# Примеры использования WebSocket сервера

## Инициализация WebSocket сервера

```typescript
// server/index.ts
import { createServer } from 'http';
import { initializeCADWebSocket, getCADWebSocket } from './websocket.js';

const server = createServer(app);
const wsServer = initializeCADWebSocket(server);

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Использование в API роутах

### 1. События вызовов

```typescript
// server/routes/calls.ts
import { getCADWebSocket } from '../websocket.js';
import { WEBSOCKET_EVENTS } from '../../shared/websocket-events.js';

export async function createCall(req: Request, res: Response) {
  try {
    // Создание вызова в базе данных
    const callData = await db.insert(call911).values({
      location: req.body.location,
      description: req.body.description,
      type: req.body.type,
      priority: req.body.priority,
      callerInfo: req.body.callerInfo
    }).returning();

    const call = callData[0];

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      // Используем новое событие для создания вызова
      wsServer.broadcastCallCreated(call);
      
      // Также отправляем старое событие для обратной совместимости
      wsServer.broadcastNewCall(call);
    }

    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create call' });
  }
}

export async function updateCall(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Обновление вызова в базе данных
    const updatedCall = await db.update(call911)
      .set(updateData)
      .where(eq(call911.id, parseInt(id)))
      .returning();

    const call = updatedCall[0];

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastCallUpdated(parseInt(id), call);
      wsServer.broadcastCallStatusUpdate(parseInt(id), call.status);
    }

    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update call' });
  }
}

export async function endCall(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Завершение вызова в базе данных
    await db.update(call911)
      .set({ status: 'closed' })
      .where(eq(call911.id, parseInt(id)));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastCallEnded(parseInt(id));
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end call' });
  }
}
```

### 2. События юнитов

```typescript
// server/routes/units.ts
import { getCADWebSocket } from '../websocket.js';

export async function updateUnitStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    // Обновление статуса юнита в базе данных
    const updatedUnit = await db.update(activeUnits)
      .set({ 
        status, 
        location: location ? JSON.stringify(location) : undefined,
        lastUpdate: new Date()
      })
      .where(eq(activeUnits.id, parseInt(id)))
      .returning();

    const unit = updatedUnit[0];

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastUnitStatusUpdate(parseInt(id), status, location);
    }

    res.json({ success: true, unit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update unit status' });
  }
}

export async function updateUnitLocation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { location } = req.body;

    // Обновление местоположения юнита
    await db.update(activeUnits)
      .set({ 
        location: JSON.stringify(location),
        lastUpdate: new Date()
      })
      .where(eq(activeUnits.id, parseInt(id)));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastUnitLocationUpdate(parseInt(id), location);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update unit location' });
  }
}

export async function setUnitOffDuty(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Снятие юнита с дежурства
    await db.delete(activeUnits)
      .where(eq(activeUnits.id, parseInt(id)));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastUnitOffDuty(parseInt(id));
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set unit off duty' });
  }
}
```

### 3. События BOLO

```typescript
// server/routes/bolo.ts
import { getCADWebSocket } from '../websocket.js';

export async function createBOLO(req: Request, res: Response) {
  try {
    const boloData = req.body;

    // Создание BOLO в базе данных
    const newBolo = await db.insert(bolos).values(boloData).returning();
    const bolo = newBolo[0];

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastBOLOCreated(bolo);
      wsServer.broadcastBOLOAlert(bolo.vehiclePlate, bolo.description);
    }

    res.json({ success: true, bolo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create BOLO' });
  }
}

export async function updateBOLO(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Обновление BOLO в базе данных
    const updatedBolo = await db.update(bolos)
      .set(updateData)
      .where(eq(bolos.id, parseInt(id)))
      .returning();

    const bolo = updatedBolo[0];

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastBOLOUpdated(parseInt(id), bolo);
    }

    res.json({ success: true, bolo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update BOLO' });
  }
}

export async function deleteBOLO(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Удаление BOLO из базы данных
    await db.delete(bolos).where(eq(bolos.id, parseInt(id)));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastBOLODeleted(parseInt(id));
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete BOLO' });
  }
}
```

### 4. События паники

```typescript
// server/routes/panic.ts
import { getCADWebSocket } from '../websocket.js';

export async function activatePanicButton(req: Request, res: Response) {
  try {
    const { unitId } = req.params;
    const { location } = req.body;

    // Активация кнопки паники в базе данных
    await db.update(activeUnits)
      .set({ 
        isPanic: true,
        lastUpdate: new Date()
      })
      .where(eq(activeUnits.id, parseInt(unitId)));

    // Получение данных юнита
    const unit = await db.select().from(activeUnits)
      .where(eq(activeUnits.id, parseInt(unitId)));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastPanicButtonOn(unit[0]);
      wsServer.broadcastPanicAlert(parseInt(unitId), location);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate panic button' });
  }
}

export async function deactivatePanicButton(req: Request, res: Response) {
  try {
    const { unitId } = req.params;

    // Деактивация кнопки паники в базе данных
    await db.update(activeUnits)
      .set({ 
        isPanic: false,
        lastUpdate: new Date()
      })
      .where(eq(activeUnits.id, parseInt(unitId)));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastPanicButtonOff(parseInt(unitId));
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate panic button' });
  }
}
```

### 5. Системные события

```typescript
// server/routes/system.ts
import { getCADWebSocket } from '../websocket.js';

export async function toggleSignal100(req: Request, res: Response) {
  try {
    const { value } = req.body;

    // Обновление статуса Signal 100 в базе данных
    await db.update(systemSettings)
      .set({ signal100: value })
      .where(eq(systemSettings.id, 1));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastSignal100(value);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle Signal 100' });
  }
}

export async function toggleRoleplay(req: Request, res: Response) {
  try {
    const { value } = req.body;

    // Обновление статуса ролевой игры в базе данных
    await db.update(systemSettings)
      .set({ roleplayStopped: value })
      .where(eq(systemSettings.id, 1));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastRoleplayStopped(value);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle roleplay' });
  }
}

export async function updateAreaOfPlay(req: Request, res: Response) {
  try {
    const { area } = req.body;

    // Обновление игровой зоны в базе данных
    await db.update(systemSettings)
      .set({ areaOfPlay: area })
      .where(eq(systemSettings.id, 1));

    // Отправка события через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastAreaOfPlayUpdated({ area });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update area of play' });
  }
}
```

## Клиентская сторона (JavaScript/TypeScript)

### Подключение к WebSocket

```typescript
// client/websocket.ts
import { WEBSOCKET_EVENTS, WEBSOCKET_CHANNELS } from '../shared/websocket-events.js';

class CADWebSocketClient {
  private ws: WebSocket;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Connected to CAD WebSocket');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from CAD WebSocket');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleEvent(event: any) {
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event.data));
  }

  // Аутентификация
  authenticate(token: string, isDispatcher: boolean = false, isAdmin: boolean = false) {
    this.send({
      type: 'authenticate',
      data: { token, isDispatcher, isAdmin }
    });
  }

  // Подписка на каналы
  subscribe(channels: string[]) {
    this.send({
      type: 'subscribe',
      data: { channels }
    });
  }

  // Отписка от каналов
  unsubscribe(channels: string[]) {
    this.send({
      type: 'unsubscribe',
      data: { channels }
    });
  }

  // Регистрация обработчиков событий
  on(eventType: string, handler: Function) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  // Отправка сообщения
  private send(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Ping для поддержания соединения
  ping() {
    this.send({ type: WEBSOCKET_EVENTS.PING });
  }
}

// Пример использования
const wsClient = new CADWebSocketClient('ws://localhost:3000');

// Аутентификация
wsClient.authenticate('demo-token', true, false);

// Подписка на каналы
wsClient.subscribe([
  WEBSOCKET_CHANNELS.CALLS,
  WEBSOCKET_CHANNELS.UNITS,
  WEBSOCKET_CHANNELS.ALERTS
]);

// Обработчики событий
wsClient.on(WEBSOCKET_EVENTS.CALL_CREATED, (data) => {
  console.log('New call created:', data);
  // Обновление UI
});

wsClient.on(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE, (data) => {
  console.log('Unit status updated:', data);
  // Обновление статуса юнита в UI
});

wsClient.on(WEBSOCKET_EVENTS.PANIC_BUTTON_ON, (data) => {
  console.log('Panic button activated:', data);
  // Показать оповещение о панике
});

wsClient.on(WEBSOCKET_EVENTS.BOLO_CREATED, (data) => {
  console.log('New BOLO created:', data);
  // Добавить BOLO в список
});

// Периодический ping
setInterval(() => {
  wsClient.ping();
}, 30000);
```

## React компонент для WebSocket

```typescript
// client/components/CADWebSocketProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CADWebSocketClient } from '../websocket';
import { WEBSOCKET_EVENTS, WEBSOCKET_CHANNELS } from '../../shared/websocket-events';

interface CADWebSocketContextType {
  wsClient: CADWebSocketClient | null;
  isConnected: boolean;
  events: any[];
}

const CADWebSocketContext = createContext<CADWebSocketContextType>({
  wsClient: null,
  isConnected: false,
  events: []
});

export const useCADWebSocket = () => useContext(CADWebSocketContext);

export const CADWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wsClient, setWsClient] = useState<CADWebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const client = new CADWebSocketClient('ws://localhost:3000');
    
    // Аутентификация
    client.authenticate('demo-token', true, false);
    
    // Подписка на все каналы
    client.subscribe([
      WEBSOCKET_CHANNELS.CALLS,
      WEBSOCKET_CHANNELS.UNITS,
      WEBSOCKET_CHANNELS.ALERTS,
      WEBSOCKET_CHANNELS.INCIDENTS,
      WEBSOCKET_CHANNELS.WARRANTS,
      WEBSOCKET_CHANNELS.SYSTEM
    ]);

    // Обработчики событий
    client.on(WEBSOCKET_EVENTS.WELCOME, () => {
      setIsConnected(true);
    });

    client.on(WEBSOCKET_EVENTS.CALL_CREATED, (data) => {
      setEvents(prev => [...prev, { type: 'call_created', data, timestamp: Date.now() }]);
    });

    client.on(WEBSOCKET_EVENTS.UNIT_STATUS_UPDATE, (data) => {
      setEvents(prev => [...prev, { type: 'unit_status_update', data, timestamp: Date.now() }]);
    });

    client.on(WEBSOCKET_EVENTS.PANIC_BUTTON_ON, (data) => {
      setEvents(prev => [...prev, { type: 'panic_button_on', data, timestamp: Date.now() }]);
    });

    setWsClient(client);

    return () => {
      client.ws.close();
    };
  }, []);

  return (
    <CADWebSocketContext.Provider value={{ wsClient, isConnected, events }}>
      {children}
    </CADWebSocketContext.Provider>
  );
};
```

## Заключение

Этот расширенный WebSocket сервер предоставляет полную функциональность для CAD системы, включая:

1. **Обратная совместимость** - все существующие события сохранены
2. **Новые события** - добавлены события из SnailyCAD
3. **Типизация** - полная TypeScript поддержка
4. **Модульность** - константы вынесены в отдельный файл
5. **Гибкость** - система каналов и разрешений
6. **Простота использования** - готовые методы для каждого типа события

Рекомендуется поэтапно внедрять новые события, начиная с критически важных (вызовы, юниты, паника), а затем добавлять остальные по мере необходимости. 