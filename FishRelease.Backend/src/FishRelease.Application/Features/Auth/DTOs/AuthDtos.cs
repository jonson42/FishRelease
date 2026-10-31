using System;

namespace FishRelease.Application.Features.Auth.DTOs;

public record AuthResponseDto(
    Guid UserId,
    string Username,
    string FullName,
    string Email,
    string Role,
    decimal WalletBalance,
    int FreeFishQuotaToday,
    string Token
);

public record UserProfileDto(
    Guid UserId,
    string Username,
    string FullName,
    string Email,
    string Role,
    decimal WalletBalance,
    int FreeFishQuotaToday
);
