using System;
using System.Security.Claims;
using System.Threading.Tasks;
using FishRelease.Application.Features.Wallet.Commands;
using FishRelease.Application.Features.Wallet.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FishRelease.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly IMediator _mediator;

    public WalletController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tạo mã QR nạp tiền (VietQR) tự động
    /// </summary>
    [Authorize]
    [HttpPost("create-topup")]
    public async Task<ActionResult<TopUpQrDto>> CreateTopUpQr([FromBody] CreateTopUpQrRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new CreateTopUpQrCommand(userId, request.AmountVnd));
        return Ok(result);
    }

    /// <summary>
    /// Webhook nhận thông báo thanh toán thành công từ cổng thanh toán (SePay / VietQR bot)
    /// </summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> ProcessWebhook([FromBody] PaymentWebhookPayload payload)
    {
        var success = await _mediator.Send(new ProcessPaymentWebhookCommand(payload));
        if (success)
            return Ok(new { success = true, message = "Xử lý nạp tiền thành công." });

        return BadRequest(new { success = false, message = "Xử lý webhook thất bại." });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId))
            return userId;

        throw new UnauthorizedAccessException("Người dùng chưa xác thực.");
    }
}

public record CreateTopUpQrRequest(decimal AmountVnd);
