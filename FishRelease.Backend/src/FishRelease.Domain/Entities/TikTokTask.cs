using System;
using System.Collections.Generic;
using FishRelease.Domain.Common;

namespace FishRelease.Domain.Entities;

public class TikTokTask : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string? Description { get; set; }

    public Guid RewardFishSpeciesId { get; set; }
    public FishSpecies RewardFishSpecies { get; set; } = null!;

    public int RewardQuantity { get; set; } = 1;
    public int RequiredWatchSeconds { get; set; } = 15;
    public bool IsActive { get; set; } = true;

    public int ViewCount { get; set; } = 0;
    public int ClaimCount { get; set; } = 0;

    public ICollection<UserTaskHistory> TaskHistories { get; set; } = new List<UserTaskHistory>();
}
