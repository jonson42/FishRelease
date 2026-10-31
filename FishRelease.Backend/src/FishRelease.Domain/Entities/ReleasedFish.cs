using System;
using FishRelease.Domain.Common;
using FishRelease.Domain.Enums;

namespace FishRelease.Domain.Entities;

public class ReleasedFish : BaseEntity
{
    public Guid FishSpeciesId { get; set; }
    public FishSpecies FishSpecies { get; set; } = null!;

    public Guid ReleasedByUserId { get; set; }
    public User ReleasedByUser { get; set; } = null!;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string WishMessage { get; set; } = string.Empty;
    public FishStatus Status { get; set; } = FishStatus.Swimming;
    public DateTime ReleasedAt { get; set; } = DateTime.UtcNow;

    public Guid? CaughtByUserId { get; set; }
    public User? CaughtByUser { get; set; }
    public DateTime? CaughtAt { get; set; }
}
