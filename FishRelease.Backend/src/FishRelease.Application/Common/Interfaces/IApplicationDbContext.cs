using System.Threading;
using System.Threading.Tasks;
using FishRelease.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<FishSpecies> FishSpecies { get; }
    DbSet<UserFishInventory> UserFishInventories { get; }
    DbSet<ReleasedFish> ReleasedFishes { get; }
    DbSet<TikTokTask> TikTokTasks { get; }
    DbSet<UserTaskHistory> UserTaskHistories { get; }
    DbSet<WalletTransaction> WalletTransactions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
