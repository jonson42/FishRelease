using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Fishes.DTOs;
using FishRelease.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Fishes.Queries;

public record GetFishesInBoundingBoxQuery(
    double MinLat,
    double MaxLat,
    double MinLng,
    double MaxLng
) : IRequest<List<ReleasedFishDto>>;

public class GetFishesInBoundingBoxQueryHandler : IRequestHandler<GetFishesInBoundingBoxQuery, List<ReleasedFishDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFishesInBoundingBoxQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReleasedFishDto>> Handle(GetFishesInBoundingBoxQuery request, CancellationToken cancellationToken)
    {
        // Truy vấn tối ưu lấy cá đang bơi trong phạm vi viewport bản đồ
        var fishes = await _context.ReleasedFishes
            .AsNoTracking()
            .Include(f => f.FishSpecies)
            .Include(f => f.ReleasedByUser)
            .Where(f => f.Status == FishStatus.Swimming
                        && f.Latitude >= request.MinLat
                        && f.Latitude <= request.MaxLat
                        && f.Longitude >= request.MinLng
                        && f.Longitude <= request.MaxLng)
            .OrderByDescending(f => f.ReleasedAt)
            .Take(150) // Giới hạn marker để mượt mà trên UI bản đồ
            .Select(f => new ReleasedFishDto(
                f.Id,
                f.FishSpeciesId,
                f.FishSpecies.Name,
                f.FishSpecies.ImageUrl,
                f.FishSpecies.Rarity.ToString(),
                f.ReleasedByUserId,
                f.ReleasedByUser.FullName.Length > 0 ? f.ReleasedByUser.FullName : f.ReleasedByUser.Username,
                f.Latitude,
                f.Longitude,
                f.WishMessage,
                f.ReleasedAt
            ))
            .ToListAsync(cancellationToken);

        return fishes;
    }
}
