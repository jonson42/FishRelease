using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Wallet.DTOs;
using FishRelease.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Wallet.Commands;

public record ProcessPaymentWebhookCommand(PaymentWebhookPayload Payload) : IRequest<bool>;

public class ProcessPaymentWebhookCommandHandler : IRequestHandler<ProcessPaymentWebhookCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    public ProcessPaymentWebhookCommandHandler(IApplicationDbContext context, IDateTimeService dateTimeService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<bool> Handle(ProcessPaymentWebhookCommand request, CancellationToken cancellationToken)
    {
        var payload = request.Payload;

        // Trích xuất mã giao dịch từ nội dung chuyển khoản nếu không có sẵn
        string code = payload.TransactionCode;
        if (string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(payload.Content))
        {
            var match = Regex.Match(payload.Content, @"FISH[A-Z0-9]+", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                code = match.Value.ToUpper();
            }
        }

        if (string.IsNullOrEmpty(code))
        {
            throw new BadRequestException("Không tìm thấy mã nạp tiền trong nội dung chuyển khoản.");
        }

        var transaction = await _context.WalletTransactions
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TransactionCode == code, cancellationToken);

        if (transaction == null)
        {
            throw new NotFoundException("WalletTransaction", code);
        }

        // Chống lặp giao dịch (Idempotency)
        if (transaction.Status == TransactionStatus.Completed)
        {
            return true;
        }

        if (payload.Amount < transaction.AmountVnd)
        {
            transaction.Status = TransactionStatus.Failed;
            transaction.RawWebhookData = payload.RawJson;
            await _context.SaveChangesAsync(cancellationToken);
            throw new BadRequestException($"Số tiền chuyển ({payload.Amount:N0} VNĐ) nhỏ hơn số tiền yêu cầu ({transaction.AmountVnd:N0} VNĐ).");
        }

        // Đánh dấu hoàn tất và cộng xu
        var now = _dateTimeService.UtcNow;
        transaction.Status = TransactionStatus.Completed;
        transaction.CompletedAt = now;
        transaction.RawWebhookData = payload.RawJson;

        transaction.User.WalletBalance += transaction.CoinsAdded;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
