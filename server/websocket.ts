import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { db } from './db/index.js';
import { activeUnits, call911, callAttachments } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface CADClient {
  ws: WebSocket;
  userId?: number;
  departmentId?: number;
  isDispatcher?: boolean;
  subscriptions: string[];
}

interface CADEvent {
  type: string;
  data: any;
  timestamp: number;
}

class CADWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, CADClient> = new Map();
  private heartbeatInterval!: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
    this.startHeartbeat();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      const client: CADClient = {
        ws,
        subscriptions: []
      };

      this.clients.set(clientId, client);

      console.log(`CAD Client connected: ${clientId}`);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
      } catch (error) {
          console.error('Failed to parse message:', error);
          this.sendError(clientId, 'Invalid message format');
      }
    });

    ws.on('close', () => {
        console.log(`CAD Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
    });

    ws.on('error', (error) => {
        console.error(`CAD Client error: ${clientId}`, error);
        this.clients.delete(clientId);
      });

      // Отправляем приветственное сообщение
      this.sendToClient(clientId, {
        type: 'welcome',
        data: {
          clientId,
          message: 'Connected to CAD WebSocket Server'
        },
        timestamp: Date.now()
      });
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'authenticate':
        this.handleAuthentication(clientId, message.data);
        break;
      
      case 'subscribe':
        this.handleSubscription(clientId, message.data);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscription(clientId, message.data);
        break;
      
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;
      
      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private handleAuthentication(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { token, isDispatcher = false } = data;

    if (!token) {
      this.sendError(clientId, 'Authentication token required');
      return;
    }

    // Здесь должна быть проверка токена через базу данных
    // Для демонстрации используем простую проверку
    if (token === 'demo-token') {
      client.userId = 1;
      client.departmentId = 1;
      client.isDispatcher = isDispatcher;
      
      this.sendToClient(clientId, {
        type: 'authenticated',
        data: {
          userId: client.userId,
          departmentId: client.departmentId,
          isDispatcher: client.isDispatcher
        },
        timestamp: Date.now()
      });

      console.log(`Client ${clientId} authenticated as user ${client.userId}`);
    } else {
      this.sendError(clientId, 'Invalid authentication token');
    }
  }

  private handleSubscription(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channels } = data;

    if (!Array.isArray(channels)) {
      this.sendError(clientId, 'Channels must be an array');
      return;
    }

    // Добавляем подписки
    channels.forEach((channel: string) => {
      if (!client.subscriptions.includes(channel)) {
        client.subscriptions.push(channel);
      }
    });

    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { channels: client.subscriptions },
      timestamp: Date.now()
    });

    console.log(`Client ${clientId} subscribed to: ${channels.join(', ')}`);
  }

  private handleUnsubscription(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channels } = data;

    if (!Array.isArray(channels)) {
      this.sendError(clientId, 'Channels must be an array');
      return;
    }

    // Удаляем подписки
    client.subscriptions = client.subscriptions.filter(
      sub => !channels.includes(sub)
    );

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      data: { channels: client.subscriptions },
      timestamp: Date.now()
    });

    console.log(`Client ${clientId} unsubscribed from: ${channels.join(', ')}`);
  }

  // Методы для отправки событий всем подписчикам
  public broadcastEvent(event: CADEvent, channels: string[] = []) {
    this.clients.forEach((client, clientId) => {
      if (this.shouldSendToClient(client, event.type, channels)) {
        this.sendToClient(clientId, event);
      }
    });
  }

  private shouldSendToClient(client: CADClient, eventType: string, channels: string[]): boolean {
    // Если клиент не аутентифицирован, не отправляем события
    if (!client.userId) return false;

    // Проверяем подписки клиента
    if (channels.length > 0) {
      return channels.some(channel => client.subscriptions.includes(channel));
    }

    // Проверяем тип события
    switch (eventType) {
      case 'unit_status_update':
        return client.subscriptions.includes('units') || client.subscriptions.includes('all');
      
      case 'unit_location_update':
        return client.subscriptions.includes('units') || client.subscriptions.includes('all');
      
      case 'new_call':
        return client.subscriptions.includes('calls') || client.subscriptions.includes('all');
      
      case 'call_status_update':
        return client.subscriptions.includes('calls') || client.subscriptions.includes('all');
      
      case 'panic_alert':
        return client.subscriptions.includes('alerts') || client.subscriptions.includes('all');
      
      case 'bolo_alert':
        return client.subscriptions.includes('alerts') || client.subscriptions.includes('all');
      
      default:
        return client.subscriptions.includes('all');
    }
  }

  // Специфичные методы для CAD событий
  public broadcastUnitStatusUpdate(unitId: number, status: string, location?: any) {
    this.broadcastEvent({
      type: 'unit_status_update',
      data: { unitId, status, location },
      timestamp: Date.now()
    }, ['units']);
  }

  public broadcastUnitLocationUpdate(unitId: number, location: any) {
    this.broadcastEvent({
      type: 'unit_location_update',
      data: { unitId, location },
      timestamp: Date.now()
    }, ['units']);
  }

  public broadcastNewCall(callData: any) {
    this.broadcastEvent({
      type: 'new_call',
      data: callData,
      timestamp: Date.now()
    }, ['calls']);
  }

  public broadcastCallStatusUpdate(callId: number, status: string) {
    this.broadcastEvent({
      type: 'call_status_update',
      data: { callId, status },
      timestamp: Date.now()
    }, ['calls']);
  }

  public broadcastPanicAlert(unitId: number, location: any) {
    this.broadcastEvent({
      type: 'panic_alert',
      data: { unitId, location, priority: 'high' },
      timestamp: Date.now()
    }, ['alerts']);
  }

  public broadcastBOLOAlert(vehiclePlate: string, description: string) {
    this.broadcastEvent({
      type: 'bolo_alert',
      data: { vehiclePlate, description, priority: 'medium' },
      timestamp: Date.now()
    }, ['alerts']);
  }

  // Вспомогательные методы
  private sendToClient(clientId: string, event: CADEvent) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(event));
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      this.clients.delete(clientId);
    }
  }

  private sendError(clientId: string, message: string) {
    this.sendToClient(clientId, {
      type: 'error',
      data: { message },
      timestamp: Date.now()
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          this.sendToClient(clientId, {
            type: 'heartbeat',
            data: { timestamp: Date.now() },
            timestamp: Date.now()
          });
        }
      });
    }, 30000); // Каждые 30 секунд
  }

  public stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });
    
    this.wss.close();
  }

  // Метод для получения статистики
  public getStats() {
    return {
      totalClients: this.clients.size,
      authenticatedClients: Array.from(this.clients.values()).filter(c => c.userId).length,
      dispatchers: Array.from(this.clients.values()).filter(c => c.isDispatcher).length
    };
  }
}

// Создаем глобальный экземпляр для использования в других модулях
let cadWebSocketServer: CADWebSocketServer | null = null;

export function initializeCADWebSocket(server: Server): CADWebSocketServer {
  if (cadWebSocketServer) {
    cadWebSocketServer.stop();
  }
  
  cadWebSocketServer = new CADWebSocketServer(server);
  return cadWebSocketServer;
}

export function getCADWebSocket(): CADWebSocketServer | null {
  return cadWebSocketServer;
}

export default CADWebSocketServer;