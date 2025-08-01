import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage.js';

// ===== ЛОКАЛЬНЫЕ ТИПЫ И КОНСТАНТЫ =====

// WebSocket события
export const WEBSOCKET_EVENTS = {
  WELCOME: 'welcome',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  UNIT_STATUS_UPDATE: 'unit_status_update',
  UNIT_LOCATION_UPDATE: 'unit_location_update',
  NEW_CALL: 'new_call',
  CALL_STATUS_UPDATE: 'call_status_update',
  PANIC_ALERT: 'panic_alert',
  BOLO_ALERT: 'bolo_alert',
  CALL_CREATED: 'call_created',
  CALL_UPDATED: 'call_updated',
  CALL_ENDED: 'call_ended',
  INCIDENT_CREATED: 'incident_created',
  INCIDENT_UPDATED: 'incident_updated',
  WARRANT_CREATED: 'warrant_created',
  WARRANT_UPDATED: 'warrant_updated',
  TOW_CALL_CREATED: 'tow_call_created',
  TOW_CALL_UPDATED: 'tow_call_updated',
  TOW_CALL_ENDED: 'tow_call_ended',
  TAXI_CALL_CREATED: 'taxi_call_created',
  TAXI_CALL_UPDATED: 'taxi_call_updated',
  TAXI_CALL_ENDED: 'taxi_call_ended',
  UNIT_OFF_DUTY: 'unit_off_duty',
  OFFICER_STATUS_UPDATED: 'officer_status_updated',
  EMS_FD_STATUS_UPDATED: 'ems_fd_status_updated',
  BOLO_CREATED: 'bolo_created',
  BOLO_UPDATED: 'bolo_updated',
  BOLO_DELETED: 'bolo_deleted',
  PANIC_BUTTON_ON: 'panic_button_on',
  PANIC_BUTTON_OFF: 'panic_button_off',
  SIGNAL_100: 'signal_100',
  ROLEPLAY_STOPPED: 'roleplay_stopped',
  AREA_OF_PLAY_UPDATED: 'area_of_play_updated',
  DISPATCHER_UPDATE: 'dispatcher_update',
  SIGNAL_100_ON: 'signal_100_on',
  SIGNAL_100_OFF: 'signal_100_off',
  DISPATCHER_UPDATED: 'dispatcher_updated',
  HEARTBEAT: 'heartbeat'
} as const;

// WebSocket каналы
export const WEBSOCKET_CHANNELS = {
  ALL: 'all',
  DISPATCH: 'dispatch',
  LAW_ENFORCEMENT: 'law_enforcement',
  EMS: 'ems',
  FIRE: 'fire',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  UNITS: 'units',
  CALLS: 'calls',
  ALERTS: 'alerts',
  INCIDENTS: 'incidents',
  WARRANTS: 'warrants',
  TOW_CALLS: 'tow_calls',
  TAXI_CALLS: 'taxi_calls',
  SYSTEM: 'system',
  DISPATCHERS: 'dispatchers'
} as const;

// Права пользователей
export const USER_PERMISSIONS = {
  VIEW_DISPATCH: 'view_dispatch',
  CREATE_CALLS: 'create_calls',
  UPDATE_CALLS: 'update_calls',
  VIEW_LAW_ENFORCEMENT: 'view_law_enforcement',
  VIEW_EMS: 'view_ems',
  VIEW_FIRE: 'view_fire',
  VIEW_ADMIN: 'view_admin',
  VIEW_SUPERVISOR: 'view_supervisor',
  SEND_PANIC_ALERT: 'send_panic_alert',
  CREATE_BOLO: 'create_bolo',
  UPDATE_BOLO: 'update_bolo',
  DELETE_BOLO: 'delete_bolo'
} as const;

// Типы
export type WebSocketEventType = typeof WEBSOCKET_EVENTS[keyof typeof WEBSOCKET_EVENTS];
export type WebSocketChannelType = typeof WEBSOCKET_CHANNELS[keyof typeof WEBSOCKET_CHANNELS];
export type UserPermissionType = typeof USER_PERMISSIONS[keyof typeof USER_PERMISSIONS];

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: number;
  channels?: WebSocketChannelType[];
}

export interface WebSocketClient {
  ws: WebSocket;
  permissions: UserPermissionType[];
  subscriptions: WebSocketChannelType[];
  userId?: number;
  characterId?: number;
  departmentId?: number;
  role?: string;
  isDispatcher?: boolean;
  isAdmin?: boolean;
}

// Функции для работы с правами
export function getDefaultPermissions(role: string): UserPermissionType[] {
  const permissions: UserPermissionType[] = [];
  
  switch (role) {
    case 'admin':
      permissions.push(
        USER_PERMISSIONS.VIEW_DISPATCH,
        USER_PERMISSIONS.CREATE_CALLS,
        USER_PERMISSIONS.UPDATE_CALLS,
        USER_PERMISSIONS.VIEW_LAW_ENFORCEMENT,
        USER_PERMISSIONS.VIEW_EMS,
        USER_PERMISSIONS.VIEW_FIRE,
        USER_PERMISSIONS.VIEW_ADMIN,
        USER_PERMISSIONS.VIEW_SUPERVISOR,
        USER_PERMISSIONS.SEND_PANIC_ALERT,
        USER_PERMISSIONS.CREATE_BOLO,
        USER_PERMISSIONS.UPDATE_BOLO,
        USER_PERMISSIONS.DELETE_BOLO
      );
      break;
    case 'supervisor':
      permissions.push(
        USER_PERMISSIONS.VIEW_DISPATCH,
        USER_PERMISSIONS.CREATE_CALLS,
        USER_PERMISSIONS.UPDATE_CALLS,
        USER_PERMISSIONS.VIEW_LAW_ENFORCEMENT,
        USER_PERMISSIONS.VIEW_EMS,
        USER_PERMISSIONS.VIEW_FIRE,
        USER_PERMISSIONS.VIEW_SUPERVISOR,
        USER_PERMISSIONS.SEND_PANIC_ALERT,
        USER_PERMISSIONS.CREATE_BOLO,
        USER_PERMISSIONS.UPDATE_BOLO
      );
      break;
    case 'officer':
      permissions.push(
        USER_PERMISSIONS.VIEW_DISPATCH,
        USER_PERMISSIONS.VIEW_LAW_ENFORCEMENT,
        USER_PERMISSIONS.SEND_PANIC_ALERT
      );
      break;
    case 'ems':
      permissions.push(
        USER_PERMISSIONS.VIEW_DISPATCH,
        USER_PERMISSIONS.VIEW_EMS,
        USER_PERMISSIONS.SEND_PANIC_ALERT
      );
      break;
    case 'fire':
      permissions.push(
        USER_PERMISSIONS.VIEW_DISPATCH,
        USER_PERMISSIONS.VIEW_FIRE,
        USER_PERMISSIONS.SEND_PANIC_ALERT
      );
      break;
    default:
      permissions.push(USER_PERMISSIONS.VIEW_DISPATCH);
  }
  
  return permissions;
}

export function getChannelForEvent(eventType: WebSocketEventType): WebSocketChannelType[] {
  switch (eventType) {
    case WEBSOCKET_EVENTS.NEW_CALL:
    case WEBSOCKET_EVENTS.CALL_STATUS_UPDATE:
    case WEBSOCKET_EVENTS.CALL_CREATED:
    case WEBSOCKET_EVENTS.CALL_UPDATED:
    case WEBSOCKET_EVENTS.CALL_ENDED:
      return [WEBSOCKET_CHANNELS.DISPATCH];
    
    case WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE:
    case WEBSOCKET_EVENTS.UNIT_LOCATION_UPDATE:
    case WEBSOCKET_EVENTS.UNIT_OFF_DUTY:
    case WEBSOCKET_EVENTS.OFFICER_STATUS_UPDATED:
      return [WEBSOCKET_CHANNELS.DISPATCH, WEBSOCKET_CHANNELS.LAW_ENFORCEMENT];
    
    case WEBSOCKET_EVENTS.EMS_FD_STATUS_UPDATED:
      return [WEBSOCKET_CHANNELS.DISPATCH, WEBSOCKET_CHANNELS.EMS, WEBSOCKET_CHANNELS.FIRE];
    
    case WEBSOCKET_EVENTS.PANIC_ALERT:
    case WEBSOCKET_EVENTS.PANIC_BUTTON_ON:
    case WEBSOCKET_EVENTS.PANIC_BUTTON_OFF:
      return [WEBSOCKET_CHANNELS.DISPATCH, WEBSOCKET_CHANNELS.LAW_ENFORCEMENT, WEBSOCKET_CHANNELS.EMS, WEBSOCKET_CHANNELS.FIRE];
    
    case WEBSOCKET_EVENTS.BOLO_ALERT:
    case WEBSOCKET_EVENTS.BOLO_CREATED:
    case WEBSOCKET_EVENTS.BOLO_UPDATED:
    case WEBSOCKET_EVENTS.BOLO_DELETED:
      return [WEBSOCKET_CHANNELS.DISPATCH, WEBSOCKET_CHANNELS.LAW_ENFORCEMENT];
    
    case WEBSOCKET_EVENTS.SIGNAL_100:
    case WEBSOCKET_EVENTS.ROLEPLAY_STOPPED:
    case WEBSOCKET_EVENTS.AREA_OF_PLAY_UPDATED:
      return [WEBSOCKET_CHANNELS.ALL];
    
    default:
      return [WEBSOCKET_CHANNELS.DISPATCH];
  }
}

// ===== ОСНОВНОЙ КОД =====


class CADWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval!: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
    this.startHeartbeat();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        ws: ws as any,
        permissions: [],
        subscriptions: []
      };

      this.clients.set(clientId, client);

      console.log(`CAD Client connected: ${clientId}`);

      ws.on('message', (message: string) => {
        console.log(`📨 Сырое сообщение от ${clientId}:`, message.toString().substring(0, 100));
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
        type: WEBSOCKET_EVENTS.WELCOME,
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

    console.log(`📨 WebSocket сообщение от ${clientId}:`, message.type);

    switch (message.type) {
      case 'authenticate':
        console.log(`🔐 Аутентификация клиента ${clientId}`);
        this.handleAuthentication(clientId, message.data);
        break;
      
      case 'subscribe':
        console.log(`📡 Подписка клиента ${clientId} на каналы:`, message.data.channels);
        this.handleSubscription(clientId, message.data);
        break;
      
      case 'unsubscribe':
        console.log(`📡 Отписка клиента ${clientId} от каналов:`, message.data.channels);
        this.handleUnsubscription(clientId, message.data);
        break;
      
      case WEBSOCKET_EVENTS.PING:
        console.log(`🏓 Ping от клиента ${clientId}`);
        this.sendToClient(clientId, {
          type: WEBSOCKET_EVENTS.PONG,
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;
      
      default:
        console.log(`❓ Неизвестный тип сообщения от ${clientId}: ${message.type}`);
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private handleAuthentication(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { token, isDispatcher = false, isAdmin = false } = data;

    if (!token) {
      this.sendError(clientId, 'Authentication token required');
      return;
    }

    // Здесь должна быть проверка токена через базу данных
    // Для демонстрации используем простую проверку
    if (token === 'demo-token' || token === 'test-token') {
      client.userId = 1;
      client.departmentId = 1;
      client.isDispatcher = isDispatcher;
      client.isAdmin = isAdmin;
      
      // Устанавливаем разрешения на основе ролей
      client.permissions = getDefaultPermissions('officer'); // Пример роли для аутентификации
      
      this.sendToClient(clientId, {
        type: WEBSOCKET_EVENTS.AUTHENTICATED,
        data: {
          userId: client.userId,
          departmentId: client.departmentId,
          isDispatcher: client.isDispatcher,
          isAdmin: client.isAdmin,
          permissions: client.permissions
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
      if (!client.subscriptions.includes(channel as any)) {
        client.subscriptions.push(channel as any);
      }
    });

    this.sendToClient(clientId, {
      type: WEBSOCKET_EVENTS.SUBSCRIBED,
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
      (sub: string) => !channels.includes(sub)
    );

    this.sendToClient(clientId, {
      type: WEBSOCKET_EVENTS.UNSUBSCRIBED,
      data: { channels: client.subscriptions },
      timestamp: Date.now()
    });

    console.log(`Client ${clientId} unsubscribed from: ${channels.join(', ')}`);
  }

  // Методы для отправки событий всем подписчикам
  public broadcastEvent(event: WebSocketEvent, channels: string[] = []) {
    this.clients.forEach((client, clientId) => {
      if (this.shouldSendToClient(client, event.type, channels)) {
        this.sendToClient(clientId, event);
      }
    });
  }

  private shouldSendToClient(client: WebSocketClient, eventType: string, channels: string[]): boolean {
    // В тестовом режиме отправляем всем клиентам с подписками
    // Если клиент не аутентифицирован, но имеет подписки, отправляем
    if (!client.userId && client.subscriptions.length === 0) return false;

    // Проверяем подписки клиента
    if (channels.length > 0) {
      return channels.some(channel => client.subscriptions.includes(channel as any));
    }

    // Используем маппинг событий на каналы
    const expectedChannels = getChannelForEvent(eventType as any);
    return expectedChannels.some(channel => client.subscriptions.includes(channel)) || client.subscriptions.includes(WEBSOCKET_CHANNELS.ALL);
  }

  // ===== СУЩЕСТВУЮЩИЕ МЕТОДЫ (сохранены для обратной совместимости) =====

  public broadcastUnitStatusUpdate(unitId: number, status: string, location?: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE,
      data: { unitId, status, location },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.UNITS]);
  }

  public broadcastUnitLocationUpdate(unitId: number, location: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.UNIT_LOCATION_UPDATE,
      data: { unitId, location },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.UNITS]);
  }

  public broadcastNewCall(callData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.NEW_CALL,
      data: callData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.CALLS]);
  }

  public broadcastCallStatusUpdate(callId: number, status: string) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.CALL_STATUS_UPDATE,
      data: { callId, status },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.CALLS]);
  }

  public broadcastPanicAlert(unitId: number, location: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.PANIC_ALERT,
      data: { unitId, location, priority: 'high' },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  public broadcastBOLOAlert(vehiclePlate: string, description: string) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.BOLO_ALERT,
      data: { vehiclePlate, description, priority: 'medium' },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  // ===== НОВЫЕ МЕТОДЫ (расширенная функциональность) =====

  // События вызовов (расширенные)
  public broadcastCallCreated(callData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.CALL_CREATED,
      data: callData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.CALLS]);
  }

  public broadcastCallUpdated(callId: number, callData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.CALL_UPDATED,
      data: { callId, ...callData },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.CALLS]);
  }

  public broadcastCallEnded(callId: number) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.CALL_ENDED,
      data: { callId },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.CALLS]);
  }

  // События инцидентов
  public broadcastIncidentCreated(incidentData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.INCIDENT_CREATED,
      data: incidentData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.INCIDENTS]);
  }

  public broadcastIncidentUpdated(incidentId: number, incidentData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.INCIDENT_UPDATED,
      data: { incidentId, ...incidentData },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.INCIDENTS]);
  }

  // События ордеров
  public broadcastWarrantCreated(warrantData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.WARRANT_CREATED,
      data: warrantData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.WARRANTS]);
  }

  public broadcastWarrantUpdated(warrantId: number, warrantData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.WARRANT_UPDATED,
      data: { warrantId, ...warrantData },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.WARRANTS]);
  }

  // Специализированные вызовы
  public broadcastTowCallCreated(towCallData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.TOW_CALL_CREATED,
      data: towCallData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.TOW_CALLS]);
  }

  public broadcastTowCallUpdated(towCallId: number, towCallData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.TOW_CALL_UPDATED,
      data: { towCallId, ...towCallData },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.TOW_CALLS]);
  }

  public broadcastTowCallEnded(towCallId: number) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.TOW_CALL_ENDED,
      data: { towCallId },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.TOW_CALLS]);
  }

  public broadcastTaxiCallCreated(taxiCallData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.TAXI_CALL_CREATED,
      data: taxiCallData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.TAXI_CALLS]);
  }

  public broadcastTaxiCallUpdated(taxiCallId: number, taxiCallData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.TAXI_CALL_UPDATED,
      data: { taxiCallId, ...taxiCallData },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.TAXI_CALLS]);
  }

  public broadcastTaxiCallEnded(taxiCallId: number) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.TAXI_CALL_ENDED,
      data: { taxiCallId },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.TAXI_CALLS]);
  }

  // Расширенные события юнитов
  public broadcastUnitOffDuty(unitId: number) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.UNIT_OFF_DUTY,
      data: { unitId },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.UNITS]);
  }

  public broadcastOfficerStatusUpdated(officerData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.OFFICER_STATUS_UPDATED,
      data: officerData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.UNITS]);
  }

  public broadcastEmsFdStatusUpdated(emsFdData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.EMS_FD_STATUS_UPDATED,
      data: emsFdData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.UNITS]);
  }

  // Расширенные BOLO события
  public broadcastBOLOCreated(boloData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.BOLO_CREATED,
      data: boloData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  public broadcastBOLOUpdated(boloId: number, boloData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.BOLO_UPDATED,
      data: { boloId, ...boloData },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  public broadcastBOLODeleted(boloId: number) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.BOLO_DELETED,
      data: { boloId },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  // Расширенные события паники
  public broadcastPanicButtonOn(unitData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.PANIC_BUTTON_ON,
      data: unitData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  public broadcastPanicButtonOff(unitId: number) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.PANIC_BUTTON_OFF,
      data: { unitId },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  // Системные события
  public broadcastSignal100(value: boolean) {
    this.broadcastEvent({
      type: value ? WEBSOCKET_EVENTS.SIGNAL_100_ON : WEBSOCKET_EVENTS.SIGNAL_100_OFF,
      data: { value },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.ALERTS]);
  }

  public broadcastRoleplayStopped(value: boolean) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.ROLEPLAY_STOPPED,
      data: { value },
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.SYSTEM]);
  }

  public broadcastAreaOfPlayUpdated(aopData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.AREA_OF_PLAY_UPDATED,
      data: aopData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.SYSTEM]);
  }

  // События диспетчеров
  public broadcastDispatcherUpdate(dispatcherData: any) {
    this.broadcastEvent({
      type: WEBSOCKET_EVENTS.DISPATCHER_UPDATED,
      data: dispatcherData,
      timestamp: Date.now()
    }, [WEBSOCKET_CHANNELS.DISPATCHERS]);
  }

  // Вспомогательные методы
  private sendToClient(clientId: string, event: WebSocketEvent) {
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
      type: WEBSOCKET_EVENTS.ERROR,
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
            type: WEBSOCKET_EVENTS.HEARTBEAT,
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
      dispatchers: Array.from(this.clients.values()).filter(c => c.isDispatcher).length,
      admins: Array.from(this.clients.values()).filter(c => c.isAdmin).length
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