using System;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Infrastructure.BackgroundJobs;
using FishRelease.Infrastructure.Persistence;
using FishRelease.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FishRelease.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            // Tự động dùng In-Memory Database phục vụ kiểm thử nhanh nếu chưa cấu hình SQL Server
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("FishReleaseInMemoryDb"));
        }
        else
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
                }));
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddTransient<IDateTimeService, DateTimeService>();
        services.AddTransient<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddTransient<IPaymentWebhookService, PaymentService>();

        services.AddHttpClient<TikTokOEmbedService>();

        // Background service reset cá miễn phí 00:00 hàng ngày
        services.AddHostedService<DailyFreeFishResetJob>();

        return services;
    }
}
