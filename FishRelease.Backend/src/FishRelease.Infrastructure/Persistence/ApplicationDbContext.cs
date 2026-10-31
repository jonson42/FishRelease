using System;
using System.Security.Cryptography;
using System.Text;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<FishSpecies> FishSpecies => Set<FishSpecies>();
    public DbSet<UserFishInventory> UserFishInventories => Set<UserFishInventory>();
    public DbSet<ReleasedFish> ReleasedFishes => Set<ReleasedFish>();
    public DbSet<TikTokTask> TikTokTasks => Set<TikTokTask>();
    public DbSet<UserTaskHistory> UserTaskHistories => Set<UserTaskHistory>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.WalletBalance).HasPrecision(18, 2);
            entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
        });

        // FishSpecies Configuration
        modelBuilder.Entity<FishSpecies>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PriceCoins).HasPrecision(18, 2);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.FengShuiMeaning).HasMaxLength(500);
        });

        // UserFishInventory Configuration
        modelBuilder.Entity<UserFishInventory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.FishSpeciesId }).IsUnique();

            entity.HasOne(e => e.User)
                .WithMany(u => u.Inventories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.FishSpecies)
                .WithMany(s => s.Inventories)
                .HasForeignKey(e => e.FishSpeciesId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ReleasedFish Configuration (Spatial Query Optimisation)
        modelBuilder.Entity<ReleasedFish>(entity =>
        {
            entity.HasKey(e => e.Id);
            // Index đa cột tăng tốc cực nhanh cho truy vấn Bounding Box bản đồ
            entity.HasIndex(e => new { e.Status, e.Latitude, e.Longitude });

            entity.Property(e => e.WishMessage).HasMaxLength(500);

            entity.HasOne(e => e.FishSpecies)
                .WithMany(s => s.ReleasedFishes)
                .HasForeignKey(e => e.FishSpeciesId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReleasedByUser)
                .WithMany(u => u.ReleasedFishes)
                .HasForeignKey(e => e.ReleasedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CaughtByUser)
                .WithMany()
                .HasForeignKey(e => e.CaughtByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TikTokTask Configuration
        modelBuilder.Entity<TikTokTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.VideoUrl).HasMaxLength(500).IsRequired();

            entity.HasOne(e => e.RewardFishSpecies)
                .WithMany(s => s.TikTokTasks)
                .HasForeignKey(e => e.RewardFishSpeciesId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // UserTaskHistory Configuration (Anti-cheat)
        modelBuilder.Entity<UserTaskHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.TikTokTaskId });
            entity.HasIndex(e => e.WatchSessionToken);

            entity.HasOne(e => e.User)
                .WithMany(u => u.TaskHistories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TikTokTask)
                .WithMany(t => t.TaskHistories)
                .HasForeignKey(e => e.TikTokTaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // WalletTransaction Configuration
        modelBuilder.Entity<WalletTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TransactionCode).IsUnique();
            entity.Property(e => e.AmountVnd).HasPrecision(18, 2);
            entity.Property(e => e.CoinsAdded).HasPrecision(18, 2);

            entity.HasOne(e => e.User)
                .WithMany(u => u.WalletTransactions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seeding Data
        SeedInitialData(modelBuilder);
    }

    private static void SeedInitialData(ModelBuilder modelBuilder)
    {
        var carpId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var koiId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var dolphinId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var turtleId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var dragonId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        modelBuilder.Entity<FishSpecies>().HasData(
            new FishSpecies
            {
                Id = carpId,
                Name = "Cá Chép Đỏ",
                Description = "Loài cá chép truyền thống trong văn hóa phóng sinh cầu an và tiễn Táo Quân.",
                ImageUrl = "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&auto=format&fit=crop&q=80",
                PriceCoins = 0,
                Rarity = FishRarity.Common,
                FengShuiMeaning = "Vượt Vũ Môn hóa Rồng, thăng tiến học hành và bình an gia đạo.",
                IsActive = true,
                IsDefaultFreeSpecies = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new FishSpecies
            {
                Id = koiId,
                Name = "Cá Koi Tam Thể",
                Description = "Cá Koi Nhật Bản tuyệt đẹp với ba màu đỏ, trắng, đen tượng trưng cho ngũ hành viên mãn.",
                ImageUrl = "https://images.unsplash.com/photo-1544943910-4c1dc44a0342?w=200&auto=format&fit=crop&q=80",
                PriceCoins = 50,
                Rarity = FishRarity.Rare,
                FengShuiMeaning = "Chiêu tài hút lộc, mang lại sự kiên trì và may mắn vượt bậc trong sự nghiệp.",
                IsActive = true,
                IsDefaultFreeSpecies = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new FishSpecies
            {
                Id = dolphinId,
                Name = "Cá Heo Xanh",
                Description = "Sứ giả của biển khơi hòa bình, tượng trưng cho trí tuệ và sự tự do.",
                ImageUrl = "https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=200&auto=format&fit=crop&q=80",
                PriceCoins = 150,
                Rarity = FishRarity.Epic,
                FengShuiMeaning = "Gia đạo thuận hòa, tâm hồn thanh tịnh và kết nối tri âm.",
                IsActive = true,
                IsDefaultFreeSpecies = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new FishSpecies
            {
                Id = turtleId,
                Name = "Rùa Kim Quy",
                Description = "Thần quy linh thiêng gắn liền với truyền thuyết Hồ Gươm và thành Cổ Loa.",
                ImageUrl = "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&auto=format&fit=crop&q=80",
                PriceCoins = 300,
                Rarity = FishRarity.Epic,
                FengShuiMeaning = "Trường thọ bách niên, công việc vững chắc như bàn thạch, tiêu trừ tai ách.",
                IsActive = true,
                IsDefaultFreeSpecies = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new FishSpecies
            {
                Id = dragonId,
                Name = "Cá Rồng Hoàng Kim",
                Description = "Hoàng Đế trong thế giới thủy sinh, tỏa ánh kim quang phú quý.",
                ImageUrl = "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=200&auto=format&fit=crop&q=80",
                PriceCoins = 999,
                Rarity = FishRarity.Legendary,
                FengShuiMeaning = "Quyền lực tối thượng, vạn sự hanh thông, đại cát đại lợi.",
                IsActive = true,
                IsDefaultFreeSpecies = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Admin User (admin / Admin@123)
        var adminId = Guid.Parse("99999999-9999-9999-9999-999999999999");
        var adminPasswordHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes("Admin@123")));

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                Username = "admin",
                Email = "admin@fishrelease.vn",
                FullName = "Quản Trị Viên",
                PasswordHash = adminPasswordHash,
                Role = UserRole.Admin,
                WalletBalance = 10000,
                FreeFishQuotaToday = 999,
                LastFreeFishClaimDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Sample TikTok Task
        modelBuilder.Entity<TikTokTask>().HasData(
            new TikTokTask
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Title = "Khám phá ý nghĩa nghi lễ phóng sinh đầu năm",
                VideoUrl = "https://www.tiktok.com/@vtv24news/video/7328901234567890123",
                Description = "Xem trọn vẹn 15 giây video để nhận ngay 1 chú Cá Koi Tam Thể may mắn vào giỏ!",
                RewardFishSpeciesId = koiId,
                RewardQuantity = 1,
                RequiredWatchSeconds = 15,
                IsActive = true,
                ViewCount = 120,
                ClaimCount = 85,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
