using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using FishRelease.Application.Features.Fishes.Commands;
using FishRelease.Application.Features.Fishes.DTOs;
using FishRelease.Application.Features.Fishes.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FishRelease.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FishMapController : ControllerBase
{
    private readonly IMediator _mediator;

    public FishMapController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy danh sách cá đang bơi theo khung nhìn bản đồ (Bounding Box)
    /// </summary>
    [HttpGet("bounding-box")]
    public async Task<ActionResult<List<ReleasedFishDto>>> GetFishesInBoundingBox(
        [FromQuery] double minLat,
        [FromQuery] double maxLat,
        [FromQuery] double minLng,
        [FromQuery] double maxLng)
    {
        var result = await _mediator.Send(new GetFishesInBoundingBoxQuery(minLat, maxLat, minLng, maxLng));
        return Ok(result);
    }

    /// <summary>
    /// Thả cá xuống tọa độ Google Maps
    /// </summary>
    [Authorize]
    [HttpPost("release")]
    public async Task<ActionResult<ReleasedFishDto>> ReleaseFish([FromBody] ReleaseFishRequest request)
    {
        var userId = GetCurrentUserId();
        var command = new ReleaseFishCommand(userId, request.FishSpeciesId, request.Latitude, request.Longitude, request.WishMessage);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Bắt cá trên bản đồ đem về giỏ để mang đi thả hồ nước khác
    /// </summary>
    [Authorize]
    [HttpPost("catch")]
    public async Task<ActionResult<CatchFishResultDto>> CatchFish([FromBody] CatchFishRequest request)
    {
        var userId = GetCurrentUserId();
        var command = new CatchFishCommand(userId, request.ReleasedFishId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Mua thêm các loài cá hiếm bằng xu
    /// </summary>
    [Authorize]
    [HttpPost("buy")]
    public async Task<ActionResult<BuyFishResultDto>> BuyFish([FromBody] BuyFishRequest request)
    {
        var userId = GetCurrentUserId();
        var command = new BuyFishCommand(userId, request.FishSpeciesId, request.Quantity);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách cá trong giỏ và số lượt cá phóng sinh miễn phí hôm nay
    /// </summary>
    [Authorize]
    [HttpGet("my-inventory")]
    public async Task<ActionResult<UserFishSummaryDto>> GetMyInventory()
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new GetUserInventoryQuery(userId));
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh mục tất cả các loài cá có sẵn trong hồ
    /// </summary>
    [HttpGet("species")]
    public async Task<ActionResult<List<FishSpeciesDto>>> GetSpecies()
    {
        var result = await _mediator.Send(new GetFishSpeciesQuery());
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

public record ReleaseFishRequest(Guid FishSpeciesId, double Latitude, double Longitude, string WishMessage);
public record CatchFishRequest(Guid ReleasedFishId);
public record BuyFishRequest(Guid FishSpeciesId, int Quantity);
