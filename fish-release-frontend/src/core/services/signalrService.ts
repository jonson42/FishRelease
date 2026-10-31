import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../api/endpoints';
import { ReleasedFish } from '../entities/fish';

export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private onFishReleasedCallbacks: ((fish: ReleasedFish) => void)[] = [];
  private onFishCaughtCallbacks: ((caughtData: { fishId: string; caughtBy: string; speciesName: string }) => void)[] = [];

  public startConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = localStorage.getItem('token');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/map`, {
        accessTokenFactory: () => token || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.on('OnFishReleased', (fish: ReleasedFish) => {
      this.onFishReleasedCallbacks.forEach(cb => cb(fish));
    });

    this.hubConnection.on('OnFishCaught', (caughtData: { fishId: string; caughtBy: string; speciesName: string }) => {
      this.onFishCaughtCallbacks.forEach(cb => cb(caughtData));
    });

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Map Hub Connected.'))
      .catch((err) => console.warn('SignalR Connection Warning (using polling fallback):', err));
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  public subscribeFishReleased(callback: (fish: ReleasedFish) => void): () => void {
    this.onFishReleasedCallbacks.push(callback);
    return () => {
      this.onFishReleasedCallbacks = this.onFishReleasedCallbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeFishCaught(callback: (caughtData: { fishId: string; caughtBy: string; speciesName: string }) => void): () => void {
    this.onFishCaughtCallbacks.push(callback);
    return () => {
      this.onFishCaughtCallbacks = this.onFishCaughtCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const signalRService = new SignalRService();
