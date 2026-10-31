using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Tasks.DTOs;
using FishRelease.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Tasks.Commands;

public record StartTikTokTaskCommand(Guid UserId, Guid TaskId) : IRequest<StartTaskSessionDto>;

public class StartTikTokTaskCommandHandler : IRequestHandler<StartTikTokTaskCommand, StartTaskSessionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    public StartTikTokTaskCommandHandler(IApplicationDbContext context, IDateTimeService dateTimeService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<StartTaskSessionDto> Handle(StartTikTokTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.TikTokTasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.IsActive, cancellationToken);
        if (task == null)
            throw new NotFoundException(nameof(TikTokTask), request.TaskId);

        var existingHistory = await _context.UserTaskHistories
            .FirstOrDefaultAsync(h => h.UserId == request.UserId && h.TikTokTaskId == request.TaskId, cancellationToken);

        if (existingHistory != null && existingHistory.RewardClaimed)
        {
            throw new BadRequestException("Bạn đã hoàn thành nhiệm vụ này và nhận thưởng rồi!");
        }

        var now = _dateTimeService.UtcNow;
        var token = Guid.NewGuid().ToString("N");

        if (existingHistory == null)
        {
            existingHistory = new UserTaskHistory
            {
                UserId = request.UserId,
                TikTokTaskId = task.Id,
                WatchSessionToken = token,
                StartedAt = now,
                RewardClaimed = false
            };
            _context.UserTaskHistories.Add(existingHistory);
        }
        else
        {
            // Reset lại phiên xem nếu xem lại trước khi claim
            existingHistory.WatchSessionToken = token;
            existingHistory.StartedAt = now;
        }

        task.ViewCount += 1;
        await _context.SaveChangesAsync(cancellationToken);

        return new StartTaskSessionDto(token, task.RequiredWatchSeconds, now);
    }
}
