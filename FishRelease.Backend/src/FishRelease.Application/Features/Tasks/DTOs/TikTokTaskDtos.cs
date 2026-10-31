using System;

namespace FishRelease.Application.Features.Tasks.DTOs;

public record TikTokTaskDto(
    Guid Id,
    string Title,
    string VideoUrl,
    string? Description,
    Guid RewardFishSpeciesId,
    string RewardFishSpeciesName,
    string ImageUrl,
    int RewardQuantity,
    int RequiredWatchSeconds,
    bool IsClaimed,
    int ViewCount,
    int ClaimCount
);

public record StartTaskSessionDto(
    string SessionToken,
    int RequiredWatchSeconds,
    DateTime StartedAt
);

public record ClaimRewardResultDto(
    Guid FishSpeciesId,
    string FishSpeciesName,
    int QuantityAdded,
    string Message
);
