import { useEffect, useRef, useState, useCallback } from 'react';
import { authUtils } from '../src/lib/auth';

// Локальные константы WebSocket событий
const WEBSOCKET_EVENTS = {
  NEW_CALL: 'new_call',
  CALL_STATUS_UPDATE: 'call_status_update',
  CALL_COMPLETED: 'call_completed',
  NEW_BOLO: 'bolo_new',
  BOLO_UPDATE: 'bolo_update',
  BOLO_REMOVED: 'bolo_removed',
  UNIT_STATUS_UPDATE: 'unit_status_update',
  PANIC_ALERT: 'panic_alert',
  BOLO_ALERT: 'bolo_alert',
} as const;

const WEBSOCKET_CHANNELS = {
  UNITS: 'units',
  CALLS: 'calls',
  ALERTS: 'alerts',
  ALL: 'all',
} as const;

interface RealTimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  channels: string[];
}

interface RealTimeConfig {
  serverUrl: string;
  useWebSocket: boolean;
  pollingInterval?: number;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

interface RealTimeState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastEvent: RealTimeEvent | null;
  stats: {
    totalEvents: number;
    connectedClients: number;
    cacheSize: number;
  };
}

interface UseRealTimeReturn extends RealTimeState {
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
  connect: () => void;
  disconnect: () => void;
  sendEvent: (eventType: string, data: any, channels?: string[]) => void;
  onEvent: (eventType: string, handler: (event: RealTimeEvent) => void) => void;
  offEvent: (eventType: string) => void;
}

const defaultConfig: RealTimeConfig = {
  serverUrl: 'http://127.0.0.1:5000',
  useWebSocket: true,
  pollingInterval: 2000,
  autoReconnect: true,
  maxReconnectAttempts: 5
};

export function useRealTime(
  initialChannels: string[] = ['all'],
  config: Partial<RealTimeConfig> = {}
): UseRealTimeReturn {
  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastEvent: null,
    stats: {
      totalEvents: 0,
      connectedClients: 0,
      cacheSize: 0
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const subscribedChannelsRef = useRef<string[]>(initialChannels);
  const lastEventTimestampRef = useRef(0);
  const eventHandlersRef = useRef<Map<string, (event: RealTimeEvent) => void>>(new Map());
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);

  // WebSocket подключение
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wsUrl = finalConfig.serverUrl.replace('http', 'ws') + '/ws';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[RealTime] WebSocket connected');
        isConnectingRef.current = false;
        isConnectedRef.current = true;
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          error: null 
        }));
        reconnectAttemptsRef.current = 0;

        // Подписываемся на каналы
        if (subscribedChannelsRef.current.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            data: { channels: subscribedChannelsRef.current }
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const realTimeEvent: RealTimeEvent = {
            id: message.id || Date.now().toString(),
            type: message.type,
            data: message.data,
            timestamp: message.timestamp || Date.now(),
            channels: message.channels || ['all']
          };

          setState(prev => ({
            ...prev,
            lastEvent: realTimeEvent,
            stats: {
              ...prev.stats,
              totalEvents: prev.stats.totalEvents + 1
            }
          }));

          // Вызываем обработчики событий
          const handlers = eventHandlersRef.current.get(realTimeEvent.type);
          if (handlers) {
            handlers(realTimeEvent);
          }

        } catch (error) {
          console.error('[RealTime] Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('[RealTime] WebSocket disconnected');
        isConnectingRef.current = false;
        isConnectedRef.current = false;
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          isConnecting: false 
        }));

        // Автоматическое переподключение
        if (finalConfig.autoReconnect && reconnectAttemptsRef.current < finalConfig.maxReconnectAttempts!) {
          reconnectAttemptsRef.current++;
          setTimeout(() => {
            console.log(`[RealTime] Attempting to reconnect (${reconnectAttemptsRef.current}/${finalConfig.maxReconnectAttempts})`);
            connectWebSocket();
          }, 1000 * reconnectAttemptsRef.current);
        } else if (finalConfig.useWebSocket && reconnectAttemptsRef.current >= finalConfig.maxReconnectAttempts!) {
          // Fallback to polling after max reconnection attempts
          console.log('[RealTime] Max reconnection attempts reached, falling back to polling');
          startPolling();
          setState(prev => ({ 
            ...prev, 
            isConnected: true,
            error: null 
          }));
        }
      };

      ws.onerror = (error) => {
        console.error('[RealTime] WebSocket error:', error);
        isConnectingRef.current = false;
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection failed',
          isConnecting: false 
        }));
        
        // Fallback to polling if WebSocket fails
        if (finalConfig.useWebSocket) {
          console.log('[RealTime] Falling back to polling mode');
          setTimeout(() => {
            startPolling();
            setState(prev => ({ 
              ...prev, 
              isConnected: true,
              error: null 
            }));
          }, 1000);
        }
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('[RealTime] Failed to create WebSocket:', error);
      isConnectingRef.current = false;
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection',
        isConnecting: false 
      }));
    }
  }, [finalConfig]);

  // HTTP Polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const pollEvents = async () => {
      try {
        const channels = subscribedChannelsRef.current.join(',');
        const since = lastEventTimestampRef.current > 0 ? `&since=${lastEventTimestampRef.current}` : '';
        
        const response = await fetch(
          `${finalConfig.serverUrl}/api/realtime/events?channels=${channels}${since}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.events && Array.isArray(data.events)) {
            data.events.forEach((event: RealTimeEvent) => {
              if (event.timestamp > lastEventTimestampRef.current) {
                lastEventTimestampRef.current = event.timestamp;
              }

              setState(prev => ({
                ...prev,
                lastEvent: event,
                stats: {
                  ...prev.stats,
                  totalEvents: prev.stats.totalEvents + 1
                }
              }));

              // Вызываем обработчики событий
              const handlers = eventHandlersRef.current.get(event.type);
              if (handlers) {
                handlers(event);
              }
            });
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('[RealTime] Polling error:', error);
        setState(prev => ({ 
          ...prev, 
          error: `Polling failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }));
      }
    };

    // Запускаем первое получение событий
    pollEvents();

    // Устанавливаем интервал
    pollingRef.current = setInterval(pollEvents, finalConfig.pollingInterval);
  }, [finalConfig]);

  // Подключение
  const connect = useCallback(() => {
    if (isConnectedRef.current || isConnectingRef.current) {
      return;
    }

    if (finalConfig.useWebSocket) {
      connectWebSocket();
    } else {
      startPolling();
      setState(prev => ({ ...prev, isConnected: true }));
    }
  }, [finalConfig.useWebSocket, connectWebSocket, startPolling]);

  // Отключение
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    isConnectingRef.current = false;
    isConnectedRef.current = false;
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      isConnecting: false 
    }));
  }, []);

  // Подписка на каналы
  const subscribe = useCallback((channels: string[]) => {
    subscribedChannelsRef.current = channels;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        data: { channels }
      }));
    }
  }, []);

  // Отписка от каналов
  const unsubscribe = useCallback((channels: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        data: { channels }
      }));
    }
  }, []);

  // Отправка события
  const sendEvent = useCallback(async (eventType: string, data: any, channels: string[] = ['all']) => {
    try {
      const response = await fetch(`${finalConfig.serverUrl}/api/realtime/broadcast`, {
        method: 'POST',
        headers: authUtils.createHeaders(),
        body: JSON.stringify({
          type: eventType,
          data,
          channels
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[RealTime] Failed to send event:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to send event: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, [finalConfig.serverUrl]);

  // Регистрация обработчиков событий
  const onEvent = useCallback((eventType: string, handler: (event: RealTimeEvent) => void) => {
    eventHandlersRef.current.set(eventType, handler);
  }, []);

  // Очистка обработчиков
  const offEvent = useCallback((eventType: string) => {
    eventHandlersRef.current.delete(eventType);
  }, []);

  // Автоматическое подключение при монтировании
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // Убираем зависимости, чтобы избежать бесконечного цикла

  // Получение статистики
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${finalConfig.serverUrl}/api/realtime/stats`, {
          headers: authUtils.getAuthHeaders()
        });

        if (response.ok) {
          const stats = await response.json();
          setState(prev => ({
            ...prev,
            stats: {
              totalEvents: prev.stats.totalEvents,
              connectedClients: stats.websocket?.connectedClients || 0,
              cacheSize: stats.cache?.totalEvents || 0
            }
          }));
        }
      } catch (error) {
        console.error('[RealTime] Failed to fetch stats:', error);
      }
    };

    const statsInterval = setInterval(fetchStats, 10000); // Каждые 10 секунд

    return () => clearInterval(statsInterval);
  }, [finalConfig.serverUrl]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    sendEvent,
    onEvent,
    offEvent
  };
}

// Специализированные хуки для конкретных типов событий
export function useUnitUpdates() {
  const [units, setUnits] = useState<Map<number, any>>(new Map());
  const { onEvent, offEvent } = useRealTime(['units']);

  useEffect(() => {
    const handleUnitUpdate = (event: RealTimeEvent) => {
      if (event.type === WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE) {
        setUnits(prev => new Map(prev).set(event.data.unitId, event.data));
      }
    };

    onEvent(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE, handleUnitUpdate);

    return () => {
      offEvent(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE);
    };
  }, [onEvent, offEvent]);

  return units;
}

export function useCallUpdates() {
  const [calls, setCalls] = useState<Map<number, any>>(new Map());
  const { onEvent, offEvent } = useRealTime(['calls']);

  useEffect(() => {
    const handleCallUpdate = (event: RealTimeEvent) => {
      if (event.type === WEBSOCKET_EVENTS.NEW_CALL) {
        setCalls(prev => new Map(prev).set(event.data.id, event.data));
      } else if (event.type === WEBSOCKET_EVENTS.CALL_STATUS_UPDATE) {
        setCalls(prev => {
          const newCalls = new Map(prev);
          const existingCall = newCalls.get(event.data.callId);
          if (existingCall) {
            newCalls.set(event.data.callId, { ...existingCall, status: event.data.status });
          }
          return newCalls;
        });
      }
    };

    onEvent(WEBSOCKET_EVENTS.NEW_CALL, handleCallUpdate);
    onEvent(WEBSOCKET_EVENTS.CALL_STATUS_UPDATE, handleCallUpdate);

    return () => {
      offEvent(WEBSOCKET_EVENTS.NEW_CALL);
      offEvent(WEBSOCKET_EVENTS.CALL_STATUS_UPDATE);
    };
  }, [onEvent, offEvent]);

  return calls;
}

export function useAlertUpdates() {
  const [alerts, setAlerts] = useState<RealTimeEvent[]>([]);
  const { onEvent, offEvent } = useRealTime(['alerts']);

  useEffect(() => {
    const handleAlert = (event: RealTimeEvent) => {
      if (event.type === WEBSOCKET_EVENTS.PANIC_ALERT || 
          event.type === WEBSOCKET_EVENTS.BOLO_ALERT) {
        setAlerts(prev => [...prev, event]);
      }
    };

    onEvent(WEBSOCKET_EVENTS.PANIC_ALERT, handleAlert);
    onEvent(WEBSOCKET_EVENTS.BOLO_ALERT, handleAlert);

    return () => {
      offEvent(WEBSOCKET_EVENTS.PANIC_ALERT);
      offEvent(WEBSOCKET_EVENTS.BOLO_ALERT);
    };
  }, [onEvent, offEvent]);

  return alerts;
}