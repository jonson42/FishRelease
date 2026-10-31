using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Wallet.DTOs;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Wallet.Commands;

public record CreateTopUpQrCommand(Guid UserId, decimal AmountVnd) : IRequest<TopUpQrDto>;

public class CreateTopUpQrCommandValidator : AbstractValidator<CreateTopUpQrCommand>
{
    public CreateTopUpQrCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
        RuleFor(x => x.AmountVnd).GreaterThanOrEqualTo(10000).WithMessage("Số tiền nạp tối thiểu là 10,000 VNĐ.");
    }
}

public class CreateTopUpQrCommandHandler : IRequestHandler<CreateTopUpQrCommand, TopUpQrDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentWebhookService _paymentService;

    public CreateTopUpQrCommandHandler(IApplicationDbContext context, IPaymentWebhookService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<TopUpQrDto> Handle(CreateTopUpQrCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        // Quy đổi: 1,000 VNĐ = 10 Xu (10,000 VNĐ = 100 Xu)
        decimal coins = (request.AmountVnd / 1000m) * 10m;

        // Sinh mã giao dịch duy nhất
        string userPrefix = user.Username.Length >= 4 ? user.Username[..4].ToUpper() : "USER";
        string randomSuffix = new Random().Next(1000, 9999).ToString();
        string transactionCode = $"FISH{userPrefix}{randomSuffix}";

        var transaction = new WalletTransaction
        {
            UserId = user.Id,
            TransactionCode = transactionCode,
            AmountVnd = request.AmountVnd,
            CoinsAdded = coins,
            TransactionType = "TopUp",
            Status = TransactionStatus.Pending,
            PaymentGateway = "VietQR",
            CreatedAt = DateTime.UtcNow
        };

        _context.WalletTransactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        string bankId = "MB";
        string accountNo = "0888999888";
        string accountName = "CONG TY PHONG SINH SO";

        string qrUrl = _paymentService.GenerateVietQrUrl(bankId, accountNo, request.AmountVnd, transactionCode);

        return new TopUpQrDto(
            transactionCode,
            request.AmountVnd,
            coins,
            qrUrl,
            bankId,
            accountNo,
            accountName,
            transactionCode
        );
    }
}
