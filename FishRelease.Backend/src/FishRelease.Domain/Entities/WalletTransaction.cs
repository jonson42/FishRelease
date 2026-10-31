using System;
using FishRelease.Domain.Common;
using FishRelease.Domain.Enums;

namespace FishRelease.Domain.Entities;

public class WalletTransaction : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TransactionCode { get; set; } = string.Empty;
    public decimal AmountVnd { get; set; }
    public decimal CoinsAdded { get; set; }
    
    /// <summary>
    /// Loại giao dịch: TopUp (Nạp tiền), BuyFish (Mua cá)
    /// </summary>
    public string TransactionType { get; set; } = "TopUp";

    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
    public string PaymentGateway { get; set; } = "VietQR";
    public string? RawWebhookData { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
