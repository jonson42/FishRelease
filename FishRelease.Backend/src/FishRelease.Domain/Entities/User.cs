using System;
using System.Collections.Generic;
using FishRelease.Domain.Common;
using FishRelease.Domain.Enums;

namespace FishRelease.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>
    /// Số dư xu (coins) dùng để mua cá hiếm
    /// </summary>
    public decimal WalletBalance { get; set; } = 0;

    /// <summary>
    /// Số cá phóng sinh miễn phí còn lại trong ngày (mặc định reset về 10 mỗi ngày)
    /// </summary>
    public int FreeFishQuotaToday { get; set; } = 10;

    /// <summary>
    /// Ngày gần nhất đã reset hoặc nhận cá miễn phí
    /// </summary>
    public DateTime LastFreeFishClaimDate { get; set; } = DateTime.UtcNow.Date;

    // Navigation properties
    public ICollection<UserFishInventory> Inventories { get; set; } = new List<UserFishInventory>();
    public ICollection<ReleasedFish> ReleasedFishes { get; set; } = new List<ReleasedFish>();
    public ICollection<WalletTransaction> WalletTransactions { get; set; } = new List<WalletTransaction>();
    public ICollection<UserTaskHistory> TaskHistories { get; set; } = new List<UserTaskHistory>();
}
