using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Tasks.DTOs;
using FishRelease.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Tasks.Commands;

public record ClaimTikTokRewardCommand(
    Guid UserId,
    Guid TaskId,
    string WatchSessionToken
) : IRequest<ClaimRewardResultDto>;

public class ClaimTikTokRewardCommandValidator : AbstractValidator<ClaimTikTokRewardCommand>
{
    public ClaimTikTokRewardCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
        RuleFor(x => x.TaskId).NotEmpty().WithMessage("TaskId không được để trống.");
        RuleFor(x => x.WatchSessionToken).NotEmpty().WithMessage("SessionToken không được để trống.");
    }
}

public class ClaimTikTokRewardCommandHandler : IRequestHandler<ClaimTikTokRewardCommand, ClaimRewardResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    public ClaimTikTokRewardCommandHandler(IApplicationDbContext context, IDateTimeService dateTimeService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<ClaimRewardResultDto> Handle(ClaimTikTokRewardCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.TikTokTasks
            .Include(t => t.RewardFishSpecies)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.IsActive, cancellationToken);
        if (task == null)
            throw new NotFoundException(nameof(TikTokTask), request.TaskId);

        var history = await _context.UserTaskHistories
            .FirstOrDefaultAsync(h => h.UserId == request.UserId && h.TikTokTaskId == request.TaskId, cancellationToken);

        if (history == null || history.WatchSessionToken != request.WatchSessionToken)
        {
            throw new BadRequestException("Phiên xem video không hợp lệ hoặc đã hết hạn! Vui lòng bấm 'Xem ngay' để bắt đầu lại.");
        }

        if (history.RewardClaimed)
        {
            throw new BadRequestException("Bạn đã nhận thưởng cho video TikTok này rồi!");
        }

        // Chống gian lận: Kiểm tra thời gian xem thực tế
        var now = _dateTimeService.UtcNow;
        var elapsedSeconds = (now - history.StartedAt).TotalSeconds;

        // Cho phép dung sai trễ mạng 1 giây
        if (elapsedSeconds < task.RequiredWatchSeconds - 1)
        {
            throw new BadRequestException($"Bạn chưa xem đủ thời lượng yêu cầu ({task.RequiredWatchSeconds}s)! Thời gian thực tế ghi nhận: {(int)elapsedSeconds}s. Vui lòng xem hết video.");
        }

        history.RewardClaimed = true;
        history.ClaimedAt = now;
        task.ClaimCount += 1;

        // Cộng cá thưởng vào kho của người dùng
        var inventory = await _context.UserFishInventories
            .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.FishSpeciesId == task.RewardFishSpeciesId, cancellationToken);

        if (inventory == null)
        {
            inventory = new UserFishInventory
            {
                UserId = request.UserId,
                FishSpeciesId = task.RewardFishSpeciesId,
                Quantity = task.RewardQuantity
            };
            _context.UserFishInventories.Add(inventory);
        }
        else
        {
            inventory.Quantity += task.RewardQuantity;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new ClaimRewardResultDto(
            task.RewardFishSpeciesId,
            task.RewardFishSpecies.Name,
            task.RewardQuantity,
            $"Chúc mừng! Bạn đã nhận được +{task.RewardQuantity} chú {task.RewardFishSpecies.Name} vào giỏ thành công!"
        );
    }
}
