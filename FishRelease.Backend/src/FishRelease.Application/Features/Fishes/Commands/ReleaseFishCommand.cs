using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Fishes.DTOs;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Fishes.Commands;

public record ReleaseFishCommand(
    Guid UserId,
    Guid FishSpeciesId,
    double Latitude,
    double Longitude,
    string WishMessage
) : IRequest<ReleasedFishDto>;

public class ReleaseFishCommandValidator : AbstractValidator<ReleaseFishCommand>
{
    public ReleaseFishCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
        RuleFor(x => x.FishSpeciesId).NotEmpty().WithMessage("FishSpeciesId không được để trống.");
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).WithMessage("Vĩ độ không hợp lệ.");
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).WithMessage("Kinh độ không hợp lệ.");
        RuleFor(x => x.WishMessage)
            .NotEmpty().WithMessage("Vui lòng nhập lời chúc / tâm nguyện khi thả cá.")
            .MaximumLength(500).WithMessage("Lời chúc tối đa 500 ký tự.");
    }
}

public class ReleaseFishCommandHandler : IRequestHandler<ReleaseFishCommand, ReleasedFishDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly ISignalRNotificationService _signalRService;

    public ReleaseFishCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        ISignalRNotificationService signalRService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _signalRService = signalRService;
    }

    public async Task<ReleasedFishDto> Handle(ReleaseFishCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        var species = await _context.FishSpecies
            .FirstOrDefaultAsync(s => s.Id == request.FishSpeciesId && s.IsActive, cancellationToken);
        if (species == null)
            throw new NotFoundException(nameof(FishSpecies), request.FishSpeciesId);

        // Kiểm tra xem có dùng lượt cá miễn phí hôm nay không
        var now = _dateTimeService.UtcNow;

        // Auto reset quota nếu qua ngày mới
        if (user.LastFreeFishClaimDate.Date < now.Date)
        {
            user.FreeFishQuotaToday = 10;
            user.LastFreeFishClaimDate = now.Date;
        }

        var inventory = await _context.UserFishInventories
            .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.FishSpeciesId == request.FishSpeciesId, cancellationToken);

        if (species.IsDefaultFreeSpecies && user.FreeFishQuotaToday > 0)
        {
            user.FreeFishQuotaToday -= 1;
        }
        else if (inventory != null && inventory.Quantity > 0)
        {
            inventory.Quantity -= 1;
        }
        else
        {
            throw new BadRequestException("Bạn không còn cá loài này trong giỏ hoặc đã sử dụng hết hạn mức thả cá miễn phí hôm nay!");
        }

        var releasedFish = new ReleasedFish
        {
            FishSpeciesId = species.Id,
            ReleasedByUserId = user.Id,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            WishMessage = request.WishMessage,
            Status = FishStatus.Swimming,
            ReleasedAt = now
        };

        _context.ReleasedFishes.Add(releasedFish);
        await _context.SaveChangesAsync(cancellationToken);

        var result = new ReleasedFishDto(
            releasedFish.Id,
            species.Id,
            species.Name,
            species.ImageUrl,
            species.Rarity.ToString(),
            user.Id,
            user.FullName.Length > 0 ? user.FullName : user.Username,
            releasedFish.Latitude,
            releasedFish.Longitude,
            releasedFish.WishMessage,
            releasedFish.ReleasedAt
        );

        // Gửi thông báo SignalR Realtime đến tất cả client đang xem bản đồ
        await _signalRService.NotifyFishReleasedAsync(result);

        return result;
    }
}
