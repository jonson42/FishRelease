using System;
using FishRelease.Domain.Common;

namespace FishRelease.Domain.Entities;

public class UserFishInventory : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid FishSpeciesId { get; set; }
    public FishSpecies FishSpecies { get; set; } = null!;

    public int Quantity { get; set; } = 0;
}
