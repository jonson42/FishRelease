using System.Collections.Generic;
using FishRelease.Domain.Common;
using FishRelease.Domain.Enums;

namespace FishRelease.Domain.Entities;

public class FishSpecies : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal PriceCoins { get; set; } = 0;
    public FishRarity Rarity { get; set; } = FishRarity.Common;
    public string FengShuiMeaning { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsDefaultFreeSpecies { get; set; } = false;

    // Navigation
    public ICollection<UserFishInventory> Inventories { get; set; } = new List<UserFishInventory>();
    public ICollection<ReleasedFish> ReleasedFishes { get; set; } = new List<ReleasedFish>();
    public ICollection<TikTokTask> TikTokTasks { get; set; } = new List<TikTokTask>();
}
