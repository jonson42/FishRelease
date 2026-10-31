using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Fishes.Commands;

public record CatchFishCommand(Guid UserId, Guid ReleasedFishId) : IRequest<CatchFishResultDto>;

public record CatchFishResultDto(
    Guid ReleasedFishId,
    Guid FishSpeciesId,
    string FishSpeciesName,
    string ImageUrl,
    string Message
);

public class CatchFishCommandValidator : AbstractValidator<CatchFishCommand>
{
    public CatchFishCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
        RuleFor(x => x.ReleasedFishId).NotEmpty().WithMessage("ReleasedFishId không được để trống.");
    }
}

public class CatchFishCommandHandler : IRequestHandler<CatchFishCommand, CatchFishResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly ISignalRNotificationService _signalRService;

    public CatchFishCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        ISignalRNotificationService signalRService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _signalRService = signalRService;
    }

    public async Task<CatchFishResultDto> Handle(CatchFishCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        var fish = await _context.ReleasedFishes
            .Include(f => f.FishSpecies)
            .FirstOrDefaultAsync(f => f.Id == request.ReleasedFishId, cancellationToken);

        if (fish == null)
            throw new NotFoundException(nameof(ReleasedFish), request.ReleasedFishId);

        if (fish.Status != FishStatus.Swimming)
            throw new BadRequestException("Con cá này vừa bơi đi mất hoặc đã được người khác vớt trước bạn!");

        var now = _dateTimeService.UtcNow;
        fish.Status = FishStatus.Caught;
        fish.CaughtByUserId = user.Id;
        fish.CaughtAt = now;

        // Thêm vào giỏ cá của người bắt
        var inventory = await _context.UserFishInventories
            .FirstOrDefaultAsync(i => i.UserId == user.Id && i.FishSpeciesId == fish.FishSpeciesId, cancellationToken);

        if (inventory == null)
        {
            inventory = new UserFishInventory
            {
                UserId = user.Id,
                FishSpeciesId = fish.FishSpeciesId,
                Quantity = 1
            };
            _context.UserFishInventories.Add(inventory);
        }
        else
        {
            inventory.Quantity += 1;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var response = new CatchFishResultDto(
            fish.Id,
            fish.FishSpeciesId,
            fish.FishSpecies.Name,
            fish.FishSpecies.ImageUrl,
            $"Bạn đã vớt thành công chú {fish.FishSpecies.Name} vào giỏ! Hãy mang đi hồ nước khác để tiếp tục gieo duyên lành."
        );

        // Gửi SignalR thông báo cá đã bị bắt
        await _signalRService.NotifyFishCaughtAsync(new
        {
            fishId = fish.Id,
            caughtBy = user.FullName.Length > 0 ? user.FullName : user.Username,
            speciesName = fish.FishSpecies.Name
        });

        return response;
    }
}
