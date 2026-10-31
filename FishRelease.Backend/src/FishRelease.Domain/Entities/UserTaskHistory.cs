using System;
using FishRelease.Domain.Common;

namespace FishRelease.Domain.Entities;

public class UserTaskHistory : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid TikTokTaskId { get; set; }
    public TikTokTask TikTokTask { get; set; } = null!;

    /// <summary>
    /// Mã token phiên xem sinh ra khi user bắt đầu xem, dùng chống tua/gian lận
    /// </summary>
    public string WatchSessionToken { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClaimedAt { get; set; }
    public bool RewardClaimed { get; set; } = false;
}
