using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Fishes.Commands;

public record BuyFishCommand(Guid UserId, Guid FishSpeciesId, int Quantity) : IRequest<BuyFishResultDto>;

public record BuyFishResultDto(
    Guid FishSpeciesId,
    string FishSpeciesName,
    int QuantityBought,
    int TotalInInventory,
    decimal RemainingCoins
);

public class BuyFishCommandValidator : AbstractValidator<BuyFishCommand>
{
    public BuyFishCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
        RuleFor(x => x.FishSpeciesId).NotEmpty().WithMessage("FishSpeciesId không được để trống.");
        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Số lượng mua phải lớn hơn 0.");
    }
}

public class BuyFishCommandHandler : IRequestHandler<BuyFishCommand, BuyFishResultDto>
{
    private readonly IApplicationDbContext _context;

    public BuyFishCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BuyFishResultDto> Handle(BuyFishCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        var species = await _context.FishSpecies
            .FirstOrDefaultAsync(s => s.Id == request.FishSpeciesId && s.IsActive, cancellationToken);
        if (species == null)
            throw new NotFoundException(nameof(FishSpecies), request.FishSpeciesId);

        decimal totalCost = species.PriceCoins * request.Quantity;
        if (user.WalletBalance < totalCost)
        {
            throw new BadRequestException($"Số dư xu không đủ! Cần {totalCost:N0} xu nhưng bạn chỉ có {user.WalletBalance:N0} xu. Vui lòng nạp thêm xu.");
        }

        user.WalletBalance -= totalCost;

        // Lưu lịch sử giao dịch mua cá
        var transaction = new WalletTransaction
        {
            UserId = user.Id,
            TransactionCode = $"BUY_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
            AmountVnd = 0,
            CoinsAdded = -totalCost,
            TransactionType = "BuyFish",
            Status = TransactionStatus.Completed,
            PaymentGateway = "InternalWallet",
            CompletedAt = DateTime.UtcNow
        };
        _context.WalletTransactions.Add(transaction);

        // Cộng vào kho cá
        var inventory = await _context.UserFishInventories
            .FirstOrDefaultAsync(i => i.UserId == user.Id && i.FishSpeciesId == species.Id, cancellationToken);

        if (inventory == null)
        {
            inventory = new UserFishInventory
            {
                UserId = user.Id,
                FishSpeciesId = species.Id,
                Quantity = request.Quantity
            };
            _context.UserFishInventories.Add(inventory);
        }
        else
        {
            inventory.Quantity += request.Quantity;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new BuyFishResultDto(
            species.Id,
            species.Name,
            request.Quantity,
            inventory.Quantity,
            user.WalletBalance
        );
    }
}
