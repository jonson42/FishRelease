using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace FishRelease.WebApi.Hubs;

public class MapRealtimeHub : Hub
{
    public async Task JoinMapViewport(string viewportId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, viewportId);
    }

    public async Task LeaveMapViewport(string viewportId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, viewportId);
    }
}
