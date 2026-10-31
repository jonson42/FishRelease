using System;
using System.Threading.Tasks;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Tasks.Commands;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public AdminController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    /// <summary>
    /// Thêm video TikTok cho user làm nhiệm vụ nhận cá
    /// </summary>
    [HttpPost("tiktok-task")]
    public async Task<ActionResult<Guid>> CreateTikTokTask([FromBody] CreateTikTokTaskCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { success = true, taskId = id });
    }

    /// <summary>
    /// Danh sách tất cả nhiệm vụ TikTok trong hệ thống kèm thống kê
    /// </summary>
    [HttpGet("tiktok-tasks")]
    public async Task<IActionResult> GetAllTikTokTasks()
    {
        var tasks = await _context.TikTokTasks
            .Include(t => t.RewardFishSpecies)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    /// <summary>
    /// Bật/Tắt trạng thái hoạt động của task TikTok
    /// </summary>
    [HttpPatch("tiktok-task/{id}/toggle")]
    public async Task<IActionResult> ToggleTask(Guid id)
    {
        var task = await _context.TikTokTasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null)
            return NotFound();

        task.IsActive = !task.IsActive;
        await _context.SaveChangesAsync(default);
        return Ok(new { success = true, isActive = task.IsActive });
    }

    /// <summary>
    /// Thêm hoặc chỉnh sửa loài cá
    /// </summary>
    [HttpPost("fish-species")]
    public async Task<IActionResult> UpsertFishSpecies([FromBody] UpsertFishSpeciesRequest request)
    {
        FishSpecies? species = null;
        if (request.Id.HasValue && request.Id.Value != Guid.Empty)
        {
            species = await _context.FishSpecies.FirstOrDefaultAsync(s => s.Id == request.Id.Value);
        }

        if (species == null)
        {
            species = new FishSpecies();
            _context.FishSpecies.Add(species);
        }

        species.Name = request.Name;
        species.Description = request.Description;
        species.ImageUrl = request.ImageUrl;
        species.PriceCoins = request.PriceCoins;
        species.Rarity = request.Rarity;
        species.FengShuiMeaning = request.FengShuiMeaning;
        species.IsActive = request.IsActive;
        species.IsDefaultFreeSpecies = request.IsDefaultFreeSpecies;

        await _context.SaveChangesAsync(default);
        return Ok(species);
    }

    /// <summary>
    /// Thống kê tổng quan hệ thống
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetSystemStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalSwimmingFishes = await _context.ReleasedFishes.CountAsync(f => f.Status == FishStatus.Swimming);
        var totalCaughtFishes = await _context.ReleasedFishes.CountAsync(f => f.Status == FishStatus.Caught);
        var totalCompletedTasks = await _context.UserTaskHistories.CountAsync(h => h.RewardClaimed);
        var totalTopUpCoins = await _context.WalletTransactions
            .Where(t => t.Status == TransactionStatus.Completed && t.TransactionType == "TopUp")
            .SumAsync(t => t.CoinsAdded);

        return Ok(new
        {
            totalUsers,
            totalSwimmingFishes,
            totalCaughtFishes,
            totalCompletedTasks,
            totalTopUpCoins
        });
    }
}

public record UpsertFishSpeciesRequest(
    Guid? Id,
    string Name,
    string Description,
    string ImageUrl,
    decimal PriceCoins,
    FishRarity Rarity,
    string FengShuiMeaning,
    bool IsActive,
    bool IsDefaultFreeSpecies
);
