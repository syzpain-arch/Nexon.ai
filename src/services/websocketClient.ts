export type WsCallback = (type: string, payload: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<WsCallback> = new Set();
  private reconnectInterval = 3000;
  private isExplicitlyClosed = false;
  private isConnected = false;

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notify('CONNECTION_STATUS', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notify(parsed.type, parsed.payload);
        } catch (e) {
          console.warn('Failed to parse WS payload', event.data);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notify('CONNECTION_STATUS', { connected: false });
        if (!this.isExplicitlyClosed) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.notify('CONNECTION_STATUS', { connected: false });
      };
    } catch (e) {
      this.isConnected = false;
      this.notify('CONNECTION_STATUS', { connected: false });
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public subscribe(cb: WsCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getStatus(): boolean {
    return this.isConnected;
  }

  public send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  private notify(type: string, payload: any): void {
    for (const cb of this.listeners) {
      try {
        cb(type, payload);
      } catch (err) {
        console.error('Error in WS subscriber callback', err);
      }
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
