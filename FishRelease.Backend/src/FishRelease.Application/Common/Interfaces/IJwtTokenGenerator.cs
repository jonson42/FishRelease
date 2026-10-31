using FishRelease.Domain.Entities;

namespace FishRelease.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
