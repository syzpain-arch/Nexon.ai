import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger.js';
import { metricsRegistry } from '../utils/metrics.js';

export interface WsEvent {
  type:
    | 'SYSTEM_ALERT'
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_DUE_REMINDER'
    | 'MESSAGE_RECEIVED'
    | 'AUTO_REPLY_SENT'
    | 'METRICS_UPDATE'
    | 'AI_STATUS'
    | 'PONG';
  payload: any;
  timestamp: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.clients.add(ws);
      metricsRegistry.setWsConnections(this.clients.size);
      logger.info('WebSocketService', `Client connected to HUD stream (${this.clients.size} active)`);

      // Send initial handshake
      ws.send(
        JSON.stringify({
          type: 'SYSTEM_ALERT',
          payload: {
            message: 'Neural uplink established with Jarvis Core. Telemetry stream active.',
            status: 'online',
          },
          timestamp: new Date().toISOString(),
        })
      );

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(
              JSON.stringify({
                type: 'PONG',
                payload: { serverTime: new Date().toISOString() },
                timestamp: new Date().toISOString(),
              })
            );
          }
        } catch (e) {
          logger.warn('WebSocketService', 'Invalid JSON received on WS', { raw: message.toString() });
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        metricsRegistry.setWsConnections(this.clients.size);
        logger.info('WebSocketService', `Client disconnected (${this.clients.size} active)`);
      });

      ws.on('error', (err) => {
        logger.error('WebSocketService', `WebSocket error: ${err.message}`);
        this.clients.delete(ws);
        metricsRegistry.setWsConnections(this.clients.size);
      });
    });

    // Broadcast live telemetry periodically
    setInterval(() => {
      if (this.clients.size > 0) {
        this.broadcast('METRICS_UPDATE', metricsRegistry.getSummary());
      }
    }, 4000);
  }

  public broadcast(type: WsEvent['type'], payload: any): void {
    if (!this.wss || this.clients.size === 0) return;

    const event: WsEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    const data = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (err) {
          logger.error('WebSocketService', 'Failed to send event to client');
        }
      }
    }
  }

  public getActiveClientCount(): number {
    return this.clients.size;
  }
}

export const wsService = new WebSocketService();
