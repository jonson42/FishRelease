using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using FishRelease.Application.Features.Tasks.Commands;
using FishRelease.Application.Features.Tasks.DTOs;
using FishRelease.Application.Features.Tasks.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FishRelease.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TikTokTaskController : ControllerBase
{
    private readonly IMediator _mediator;

    public TikTokTaskController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy danh sách nhiệm vụ xem TikTok nhận cá
    /// </summary>
    [HttpGet("available")]
    public async Task<ActionResult<List<TikTokTaskDto>>> GetAvailableTasks()
    {
        Guid? userId = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var parsed))
        {
            userId = parsed;
        }

        var result = await _mediator.Send(new GetAvailableTasksQuery(userId));
        return Ok(result);
    }

    /// <summary>
    /// Bắt đầu xem video (sinh session token và ghi nhận thời gian bắt đầu)
    /// </summary>
    [Authorize]
    [HttpPost("start")]
    public async Task<ActionResult<StartTaskSessionDto>> StartTask([FromBody] StartTaskRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new StartTikTokTaskCommand(userId, request.TaskId));
        return Ok(result);
    }

    /// <summary>
    /// Nhận thưởng sau khi hoàn thành thời lượng xem video
    /// </summary>
    [Authorize]
    [HttpPost("claim")]
    public async Task<ActionResult<ClaimRewardResultDto>> ClaimReward([FromBody] ClaimRewardRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new ClaimTikTokRewardCommand(userId, request.TaskId, request.WatchSessionToken));
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId))
            return userId;

        throw new UnauthorizedAccessException("Người dùng chưa xác thực.");
    }
}

public record StartTaskRequest(Guid TaskId);
public record ClaimRewardRequest(Guid TaskId, string WatchSessionToken);
