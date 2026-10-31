using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Fishes.DTOs;
using FishRelease.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Fishes.Queries;

public record GetUserInventoryQuery(Guid UserId) : IRequest<UserFishSummaryDto>;

public class GetUserInventoryQueryHandler : IRequestHandler<GetUserInventoryQuery, UserFishSummaryDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    public GetUserInventoryQueryHandler(IApplicationDbContext context, IDateTimeService dateTimeService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<UserFishSummaryDto> Handle(GetUserInventoryQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Inventories)
            .ThenInclude(i => i.FishSpecies)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        var now = _dateTimeService.UtcNow;
        if (user.LastFreeFishClaimDate.Date < now.Date)
        {
            user.FreeFishQuotaToday = 10;
            user.LastFreeFishClaimDate = now.Date;
            await _context.SaveChangesAsync(cancellationToken);
        }

        var inventoryItems = user.Inventories
            .Where(i => i.Quantity > 0)
            .Select(i => new UserInventoryDto(
                i.FishSpeciesId,
                i.FishSpecies.Name,
                i.FishSpecies.ImageUrl,
                i.Quantity,
                i.FishSpecies.Rarity.ToString(),
                i.FishSpecies.PriceCoins
            ))
            .ToList();

        return new UserFishSummaryDto(
            user.FreeFishQuotaToday,
            10,
            user.WalletBalance,
            inventoryItems
        );
    }
}
