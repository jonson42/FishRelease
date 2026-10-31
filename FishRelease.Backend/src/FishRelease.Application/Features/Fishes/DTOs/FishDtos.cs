using System;
using System.Collections.Generic;

namespace FishRelease.Application.Features.Fishes.DTOs;

public record FishSpeciesDto(
    Guid Id,
    string Name,
    string Description,
    string ImageUrl,
    decimal PriceCoins,
    string Rarity,
    string FengShuiMeaning,
    bool IsDefaultFreeSpecies
);

public record ReleasedFishDto(
    Guid Id,
    Guid FishSpeciesId,
    string FishSpeciesName,
    string ImageUrl,
    string Rarity,
    Guid ReleasedByUserId,
    string ReleasedByUserName,
    double Latitude,
    double Longitude,
    string WishMessage,
    DateTime ReleasedAt
);

public record UserInventoryDto(
    Guid FishSpeciesId,
    string FishSpeciesName,
    string ImageUrl,
    int Quantity,
    string Rarity,
    decimal PriceCoins
);

public record UserFishSummaryDto(
    int FreeFishRemaining,
    int FreeFishQuotaToday,
    decimal WalletBalance,
    List<UserInventoryDto> Inventory
);
