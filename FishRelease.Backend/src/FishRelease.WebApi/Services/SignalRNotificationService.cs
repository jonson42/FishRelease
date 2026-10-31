using System.Threading.Tasks;
using FishRelease.Application.Common.Interfaces;
using FishRelease.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FishRelease.WebApi.Services;

public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<MapRealtimeHub> _hubContext;

    public SignalRNotificationService(IHubContext<MapRealtimeHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyFishReleasedAsync(object fishData)
    {
        await _hubContext.Clients.All.SendAsync("OnFishReleased", fishData);
    }

    public async Task NotifyFishCaughtAsync(object caughtData)
    {
        await _hubContext.Clients.All.SendAsync("OnFishCaught", caughtData);
    }
}
