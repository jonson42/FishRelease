using System.Threading.Tasks;

namespace FishRelease.Application.Common.Interfaces;

public interface ISignalRNotificationService
{
    Task NotifyFishReleasedAsync(object fishData);
    Task NotifyFishCaughtAsync(object caughtData);
}
