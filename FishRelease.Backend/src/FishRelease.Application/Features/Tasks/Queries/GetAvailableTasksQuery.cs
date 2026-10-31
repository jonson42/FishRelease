using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Tasks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Tasks.Queries;

public record GetAvailableTasksQuery(Guid? UserId) : IRequest<List<TikTokTaskDto>>;

public class GetAvailableTasksQueryHandler : IRequestHandler<GetAvailableTasksQuery, List<TikTokTaskDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableTasksQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TikTokTaskDto>> Handle(GetAvailableTasksQuery request, CancellationToken cancellationToken)
    {
        var tasks = await _context.TikTokTasks
            .AsNoTracking()
            .Include(t => t.RewardFishSpecies)
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        var claimedTaskIds = new HashSet<Guid>();
        if (request.UserId.HasValue)
        {
            var claimed = await _context.UserTaskHistories
                .AsNoTracking()
                .Where(h => h.UserId == request.UserId.Value && h.RewardClaimed)
                .Select(h => h.TikTokTaskId)
                .ToListAsync(cancellationToken);

            claimedTaskIds = new HashSet<Guid>(claimed);
        }

        return tasks.Select(t => new TikTokTaskDto(
            t.Id,
            t.Title,
            t.VideoUrl,
            t.Description,
            t.RewardFishSpeciesId,
            t.RewardFishSpecies.Name,
            t.RewardFishSpecies.ImageUrl,
            t.RewardQuantity,
            t.RequiredWatchSeconds,
            claimedTaskIds.Contains(t.Id),
            t.ViewCount,
            t.ClaimCount
        )).ToList();
    }
}
