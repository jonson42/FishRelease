using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Fishes.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Fishes.Queries;

public record GetFishSpeciesQuery : IRequest<List<FishSpeciesDto>>;

public class GetFishSpeciesQueryHandler : IRequestHandler<GetFishSpeciesQuery, List<FishSpeciesDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFishSpeciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FishSpeciesDto>> Handle(GetFishSpeciesQuery request, CancellationToken cancellationToken)
    {
        return await _context.FishSpecies
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.PriceCoins)
            .Select(s => new FishSpeciesDto(
                s.Id,
                s.Name,
                s.Description,
                s.ImageUrl,
                s.PriceCoins,
                s.Rarity.ToString(),
                s.FengShuiMeaning,
                s.IsDefaultFreeSpecies
            ))
            .ToListAsync(cancellationToken);
    }
}
