import { getCADWebSocket } from '../websocket.js';
import { WEBSOCKET_EVENTS, WebSocketEventType } from '@roleplay-identity/shared-schema';

// Кэш для HTTP polling клиентов (FiveM)
interface CachedEvent {
  id: string;
  type: WebSocketEventType;
  data: any;
  timestamp: number;
  channels: string[];
}

class RealTimeService {
  private eventCache: Map<string, CachedEvent[]> = new Map();
  private maxCacheSize = 1000; // Максимальное количество событий в кэше
  private cacheTimeout = 5 * 60 * 1000; // 5 минут

  constructor() {
    // Очищаем кэш каждые 5 минут
    setInterval(() => this.cleanupCache(), this.cacheTimeout);
  }

  /**
   * Отправка события через WebSocket и кэширование для HTTP polling
   */
  public broadcastEvent(eventType: WebSocketEventType, data: any, channels: string[] = ['all']) {
    // Отправляем через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastEvent({
        type: eventType,
        data,
        timestamp: Date.now()
      }, channels);
    }

    // Сохраняем в кэш для HTTP polling
    this.cacheEvent(eventType, data, channels);
  }

  /**
   * Кэширование события для HTTP polling клиентов
   */
  private cacheEvent(eventType: WebSocketEventType, data: any, channels: string[]) {
    const event: CachedEvent = {
      id: this.generateEventId(),
      type: eventType,
      data,
      timestamp: Date.now(),
      channels
    };

    // Добавляем событие в каждый канал
    channels.forEach(channel => {
      if (!this.eventCache.has(channel)) {
        this.eventCache.set(channel, []);
      }
      
      const channelEvents = this.eventCache.get(channel)!;
      channelEvents.push(event);

      // Ограничиваем размер кэша
      if (channelEvents.length > this.maxCacheSize) {
        channelEvents.shift();
      }
    });
  }

  /**
   * Получение событий для HTTP polling клиентов
   */
  public getEventsForChannels(channels: string[], since?: number): CachedEvent[] {
    const allEvents: CachedEvent[] = [];
    const cutoffTime = since || (Date.now() - this.cacheTimeout);

    channels.forEach(channel => {
      const channelEvents = this.eventCache.get(channel) || [];
      const filteredEvents = channelEvents.filter(event => 
        event.timestamp > cutoffTime
      );
      allEvents.push(...filteredEvents);
    });

    // Убираем дубликаты и сортируем по времени
    const uniqueEvents = this.removeDuplicates(allEvents);
    return uniqueEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Удаление дубликатов событий
   */
  private removeDuplicates(events: CachedEvent[]): CachedEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.type}-${JSON.stringify(event.data)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Очистка старых событий из кэша
   */
  private cleanupCache() {
    const cutoffTime = Date.now() - this.cacheTimeout;
    
    for (const [channel, events] of this.eventCache.entries()) {
      const filteredEvents = events.filter(event => event.timestamp > cutoffTime);
      this.eventCache.set(channel, filteredEvents);
    }
  }

  /**
   * Генерация уникального ID события
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение статистики кэша
   */
  public getCacheStats() {
    const stats: Record<string, number> = {};
    let totalEvents = 0;

    for (const [channel, events] of this.eventCache.entries()) {
      stats[channel] = events.length;
      totalEvents += events.length;
    }

    return {
      channels: stats,
      totalEvents,
      maxCacheSize: this.maxCacheSize,
      cacheTimeout: this.cacheTimeout
    };
  }

  // Специализированные методы для CAD событий
  public broadcastUnitStatusUpdate(unitId: number, status: string, location?: any) {
    this.broadcastEvent(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE, {
      unitId,
      status,
      location,
      timestamp: Date.now()
    }, ['units', 'all']);
  }

  public broadcastNewCall(callData: any) {
    this.broadcastEvent(WEBSOCKET_EVENTS.NEW_CALL, {
      ...callData,
      timestamp: Date.now()
    }, ['calls', 'dispatch', 'all']);
  }

  public broadcastCallStatusUpdate(callId: number, status: string) {
    this.broadcastEvent(WEBSOCKET_EVENTS.CALL_STATUS_UPDATE, {
      callId,
      status,
      timestamp: Date.now()
    }, ['calls', 'dispatch', 'all']);
  }

  public broadcastPanicAlert(unitId: number, location: any) {
    this.broadcastEvent(WEBSOCKET_EVENTS.PANIC_ALERT, {
      unitId,
      location,
      timestamp: Date.now()
    }, ['alerts', 'units', 'all']);
  }

  public broadcastBOLOAlert(vehiclePlate: string, description: string) {
    this.broadcastEvent(WEBSOCKET_EVENTS.BOLO_ALERT, {
      vehiclePlate,
      description,
      timestamp: Date.now()
    }, ['alerts', 'bolo', 'all']);
  }
}

// Создаем глобальный экземпляр
const realTimeService = new RealTimeService();

export { realTimeService, RealTimeService };
export type { CachedEvent };