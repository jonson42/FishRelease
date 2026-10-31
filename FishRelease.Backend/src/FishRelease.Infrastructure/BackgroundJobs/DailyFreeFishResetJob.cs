using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Domain.Entities;
using FishRelease.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FishRelease.Infrastructure.BackgroundJobs;

public class DailyFreeFishResetJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyFreeFishResetJob> _logger;

    public DailyFreeFishResetJob(IServiceProvider serviceProvider, ILogger<DailyFreeFishResetJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyFreeFishResetJob Worker đã khởi động.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                // Tính thời gian tới 00:00:00 UTC tiếp theo (tương đương 07:00 AM VN)
                var nextMidnight = now.Date.AddDays(1);
                var delay = nextMidnight - now;

                if (delay > TimeSpan.Zero)
                {
                    _logger.LogInformation("Lịch reset hạn mức cá miễn phí tiếp theo sau: {Hours} giờ {Minutes} phút", delay.Hours, delay.Minutes);
                    await Task.Delay(delay, stoppingToken);
                }

                // Thực hiện reset lượt cá miễn phí cho toàn bộ user
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    var today = DateTime.UtcNow.Date;
                    var usersToReset = await context.Users
                        .Where(u => u.LastFreeFishClaimDate < today)
                        .ToListAsync(stoppingToken);

                    foreach (var user in usersToReset)
                    {
                        user.FreeFishQuotaToday = 10;
                        user.LastFreeFishClaimDate = today;
                    }

                    if (usersToReset.Count > 0)
                    {
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Đã cấp phát tự động 10 chú cá miễn phí hàng ngày cho {Count} người dùng.", usersToReset.Count);
                    }
                }

                // Chờ 1 phút để tránh trigger liên tục trong giây đầu tiên của ngày mới
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi trong DailyFreeFishResetJob.");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
