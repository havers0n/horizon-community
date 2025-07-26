/**
 * Константы WebSocket событий для CAD системы
 * Основаны на анализе SnailyCAD и расширены для нашего проекта
 */

// Базовые события
export const WEBSOCKET_EVENTS = {
  // Системные события
  WELCOME: 'welcome',
  AUTHENTICATED: 'authenticated',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  PING: 'ping',
  PONG: 'pong',
  HEARTBEAT: 'heartbeat',
  ERROR: 'error',

  // События юнитов
  UNIT_STATUS_UPDATE: 'unit_status_update',
  UNIT_LOCATION_UPDATE: 'unit_location_update',
  UNIT_OFF_DUTY: 'unit_off_duty',
  OFFICER_STATUS_UPDATED: 'officer_status_updated',
  EMS_FD_STATUS_UPDATED: 'ems_fd_status_updated',

  // События вызовов (совместимость с существующими)
  NEW_CALL: 'new_call',
  CALL_STATUS_UPDATE: 'call_status_update',
  
  // События вызовов (новые, расширенные)
  CALL_CREATED: 'call_created',
  CALL_UPDATED: 'call_updated',
  CALL_ENDED: 'call_ended',

  // События инцидентов
  INCIDENT_CREATED: 'incident_created',
  INCIDENT_UPDATED: 'incident_updated',

  // События ордеров
  WARRANT_CREATED: 'warrant_created',
  WARRANT_UPDATED: 'warrant_updated',

  // Специализированные вызовы
  TOW_CALL_CREATED: 'tow_call_created',
  TOW_CALL_UPDATED: 'tow_call_updated',
  TOW_CALL_ENDED: 'tow_call_ended',
  TAXI_CALL_CREATED: 'taxi_call_created',
  TAXI_CALL_UPDATED: 'taxi_call_updated',
  TAXI_CALL_ENDED: 'taxi_call_ended',

  // Оповещения (совместимость с существующими)
  PANIC_ALERT: 'panic_alert',
  BOLO_ALERT: 'bolo_alert',

  // Оповещения (новые, расширенные)
  PANIC_BUTTON_ON: 'panic_button_on',
  PANIC_BUTTON_OFF: 'panic_button_off',
  BOLO_CREATED: 'bolo_created',
  BOLO_UPDATED: 'bolo_updated',
  BOLO_DELETED: 'bolo_deleted',
  SIGNAL_100_ON: 'signal_100_on',
  SIGNAL_100_OFF: 'signal_100_off',

  // Системные события
  ROLEPLAY_STOPPED: 'roleplay_stopped',
  AREA_OF_PLAY_UPDATED: 'area_of_play_updated',

  // События диспетчеров
  DISPATCHER_UPDATED: 'dispatcher_updated',
} as const;

// Каналы подписки
export const WEBSOCKET_CHANNELS = {
  UNITS: 'units',
  CALLS: 'calls',
  ALERTS: 'alerts',
  INCIDENTS: 'incidents',
  WARRANTS: 'warrants',
  TOW_CALLS: 'tow_calls',
  TAXI_CALLS: 'taxi_calls',
  SYSTEM: 'system',
  DISPATCHERS: 'dispatchers',
  ALL: 'all',
} as const;

// Разрешения пользователей
export const USER_PERMISSIONS = {
  // Базовые разрешения
  VIEW_CALLS: 'view_calls',
  VIEW_UNITS: 'view_units',
  VIEW_INCIDENTS: 'view_incidents',
  VIEW_WARRANTS: 'view_warrants',
  VIEW_BOLOS: 'view_bolos',

  // Разрешения диспетчера
  EDIT_CALLS: 'edit_calls',
  MANAGE_UNITS: 'manage_units',
  CREATE_INCIDENTS: 'create_incidents',
  EDIT_INCIDENTS: 'edit_incidents',
  CREATE_WARRANTS: 'create_warrants',
  EDIT_WARRANTS: 'edit_warrants',
  CREATE_BOLOS: 'create_bolos',
  EDIT_BOLOS: 'edit_bolos',
  DELETE_BOLOS: 'delete_bolos',

  // Административные разрешения
  ADMIN_ACCESS: 'admin_access',
  MANAGE_USERS: 'manage_users',
  MANAGE_DEPARTMENTS: 'manage_departments',
  SYSTEM_SETTINGS: 'system_settings',
} as const;

// Типы событий для группировки
export const EVENT_CATEGORIES = {
  UNIT_EVENTS: [
    WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE,
    WEBSOCKET_EVENTS.UNIT_LOCATION_UPDATE,
    WEBSOCKET_EVENTS.UNIT_OFF_DUTY,
    WEBSOCKET_EVENTS.OFFICER_STATUS_UPDATED,
    WEBSOCKET_EVENTS.EMS_FD_STATUS_UPDATED,
  ],
  
  CALL_EVENTS: [
    WEBSOCKET_EVENTS.NEW_CALL,
    WEBSOCKET_EVENTS.CALL_STATUS_UPDATE,
    WEBSOCKET_EVENTS.CALL_CREATED,
    WEBSOCKET_EVENTS.CALL_UPDATED,
    WEBSOCKET_EVENTS.CALL_ENDED,
  ],
  
  INCIDENT_EVENTS: [
    WEBSOCKET_EVENTS.INCIDENT_CREATED,
    WEBSOCKET_EVENTS.INCIDENT_UPDATED,
  ],
  
  WARRANT_EVENTS: [
    WEBSOCKET_EVENTS.WARRANT_CREATED,
    WEBSOCKET_EVENTS.WARRANT_UPDATED,
  ],
  
  TOW_CALL_EVENTS: [
    WEBSOCKET_EVENTS.TOW_CALL_CREATED,
    WEBSOCKET_EVENTS.TOW_CALL_UPDATED,
    WEBSOCKET_EVENTS.TOW_CALL_ENDED,
  ],
  
  TAXI_CALL_EVENTS: [
    WEBSOCKET_EVENTS.TAXI_CALL_CREATED,
    WEBSOCKET_EVENTS.TAXI_CALL_UPDATED,
    WEBSOCKET_EVENTS.TAXI_CALL_ENDED,
  ],
  
  ALERT_EVENTS: [
    WEBSOCKET_EVENTS.PANIC_ALERT,
    WEBSOCKET_EVENTS.BOLO_ALERT,
    WEBSOCKET_EVENTS.PANIC_BUTTON_ON,
    WEBSOCKET_EVENTS.PANIC_BUTTON_OFF,
    WEBSOCKET_EVENTS.BOLO_CREATED,
    WEBSOCKET_EVENTS.BOLO_UPDATED,
    WEBSOCKET_EVENTS.BOLO_DELETED,
    WEBSOCKET_EVENTS.SIGNAL_100_ON,
    WEBSOCKET_EVENTS.SIGNAL_100_OFF,
  ],
  
  SYSTEM_EVENTS: [
    WEBSOCKET_EVENTS.ROLEPLAY_STOPPED,
    WEBSOCKET_EVENTS.AREA_OF_PLAY_UPDATED,
  ],
  
  DISPATCHER_EVENTS: [
    WEBSOCKET_EVENTS.DISPATCHER_UPDATED,
  ],
} as const;

// Маппинг событий на каналы
export const EVENT_CHANNEL_MAPPING = {
  [WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE]: WEBSOCKET_CHANNELS.UNITS,
  [WEBSOCKET_EVENTS.UNIT_LOCATION_UPDATE]: WEBSOCKET_CHANNELS.UNITS,
  [WEBSOCKET_EVENTS.UNIT_OFF_DUTY]: WEBSOCKET_CHANNELS.UNITS,
  [WEBSOCKET_EVENTS.OFFICER_STATUS_UPDATED]: WEBSOCKET_CHANNELS.UNITS,
  [WEBSOCKET_EVENTS.EMS_FD_STATUS_UPDATED]: WEBSOCKET_CHANNELS.UNITS,
  
  [WEBSOCKET_EVENTS.NEW_CALL]: WEBSOCKET_CHANNELS.CALLS,
  [WEBSOCKET_EVENTS.CALL_STATUS_UPDATE]: WEBSOCKET_CHANNELS.CALLS,
  [WEBSOCKET_EVENTS.CALL_CREATED]: WEBSOCKET_CHANNELS.CALLS,
  [WEBSOCKET_EVENTS.CALL_UPDATED]: WEBSOCKET_CHANNELS.CALLS,
  [WEBSOCKET_EVENTS.CALL_ENDED]: WEBSOCKET_CHANNELS.CALLS,
  
  [WEBSOCKET_EVENTS.INCIDENT_CREATED]: WEBSOCKET_CHANNELS.INCIDENTS,
  [WEBSOCKET_EVENTS.INCIDENT_UPDATED]: WEBSOCKET_CHANNELS.INCIDENTS,
  
  [WEBSOCKET_EVENTS.WARRANT_CREATED]: WEBSOCKET_CHANNELS.WARRANTS,
  [WEBSOCKET_EVENTS.WARRANT_UPDATED]: WEBSOCKET_CHANNELS.WARRANTS,
  
  [WEBSOCKET_EVENTS.TOW_CALL_CREATED]: WEBSOCKET_CHANNELS.TOW_CALLS,
  [WEBSOCKET_EVENTS.TOW_CALL_UPDATED]: WEBSOCKET_CHANNELS.TOW_CALLS,
  [WEBSOCKET_EVENTS.TOW_CALL_ENDED]: WEBSOCKET_CHANNELS.TOW_CALLS,
  
  [WEBSOCKET_EVENTS.TAXI_CALL_CREATED]: WEBSOCKET_CHANNELS.TAXI_CALLS,
  [WEBSOCKET_EVENTS.TAXI_CALL_UPDATED]: WEBSOCKET_CHANNELS.TAXI_CALLS,
  [WEBSOCKET_EVENTS.TAXI_CALL_ENDED]: WEBSOCKET_CHANNELS.TAXI_CALLS,
  
  [WEBSOCKET_EVENTS.PANIC_ALERT]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.BOLO_ALERT]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.PANIC_BUTTON_ON]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.PANIC_BUTTON_OFF]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.BOLO_CREATED]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.BOLO_UPDATED]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.BOLO_DELETED]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.SIGNAL_100_ON]: WEBSOCKET_CHANNELS.ALERTS,
  [WEBSOCKET_EVENTS.SIGNAL_100_OFF]: WEBSOCKET_CHANNELS.ALERTS,
  
  [WEBSOCKET_EVENTS.ROLEPLAY_STOPPED]: WEBSOCKET_CHANNELS.SYSTEM,
  [WEBSOCKET_EVENTS.AREA_OF_PLAY_UPDATED]: WEBSOCKET_CHANNELS.SYSTEM,
  
  [WEBSOCKET_EVENTS.DISPATCHER_UPDATED]: WEBSOCKET_CHANNELS.DISPATCHERS,
} as const;

// Типы для TypeScript
export type WebSocketEventType = typeof WEBSOCKET_EVENTS[keyof typeof WEBSOCKET_EVENTS];
export type WebSocketChannelType = typeof WEBSOCKET_CHANNELS[keyof typeof WEBSOCKET_CHANNELS];
export type UserPermissionType = typeof USER_PERMISSIONS[keyof typeof USER_PERMISSIONS];

// Интерфейсы для типизации
export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: number;
}

export interface WebSocketClient {
  ws: WebSocket;
  userId?: number;
  departmentId?: number;
  isDispatcher?: boolean;
  isAdmin?: boolean;
  permissions: UserPermissionType[];
  subscriptions: WebSocketChannelType[];
}

// Утилитарные функции
export function getChannelForEvent(eventType: WebSocketEventType): WebSocketChannelType {
  return (EVENT_CHANNEL_MAPPING as any)[eventType] || WEBSOCKET_CHANNELS.ALL;
}

export function isEventInCategory(eventType: WebSocketEventType, category: keyof typeof EVENT_CATEGORIES): boolean {
  return (EVENT_CATEGORIES[category] as any).includes(eventType);
}

export function getDefaultPermissions(isDispatcher: boolean = false, isAdmin: boolean = false): UserPermissionType[] {
  const permissions: UserPermissionType[] = [
    USER_PERMISSIONS.VIEW_CALLS,
    USER_PERMISSIONS.VIEW_UNITS,
    USER_PERMISSIONS.VIEW_INCIDENTS,
    USER_PERMISSIONS.VIEW_WARRANTS,
    USER_PERMISSIONS.VIEW_BOLOS,
  ];

  if (isDispatcher) {
    permissions.push(
      USER_PERMISSIONS.EDIT_CALLS,
      USER_PERMISSIONS.MANAGE_UNITS,
      USER_PERMISSIONS.CREATE_INCIDENTS,
      USER_PERMISSIONS.EDIT_INCIDENTS,
      USER_PERMISSIONS.CREATE_WARRANTS,
      USER_PERMISSIONS.EDIT_WARRANTS,
      USER_PERMISSIONS.CREATE_BOLOS,
      USER_PERMISSIONS.EDIT_BOLOS,
      USER_PERMISSIONS.DELETE_BOLOS,
    );
  }

  if (isAdmin) {
    permissions.push(
      USER_PERMISSIONS.ADMIN_ACCESS,
      USER_PERMISSIONS.MANAGE_USERS,
      USER_PERMISSIONS.MANAGE_DEPARTMENTS,
      USER_PERMISSIONS.SYSTEM_SETTINGS,
    );
  }

  return permissions;
} 