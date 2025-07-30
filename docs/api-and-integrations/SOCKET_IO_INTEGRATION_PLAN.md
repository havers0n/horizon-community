# План интеграции Socket.IO в RolePlayIdentity

## 🎯 Цель интеграции

Заменить текущую WebSocket реализацию на Socket.IO для улучшения:
- Надежности соединений (автоматическое переподключение)
- Производительности (fallback к HTTP long polling)
- Масштабируемости (поддержка комнат и пространств имен)
- Отладки (встроенное логирование и мониторинг)

---

## 📊 Текущее состояние системы

### Существующие компоненты

**Backend (apps/server/):**
- Express.js сервер на порту 5000
- WebSocket сервер через `ws` библиотеку
- REST API для FiveM интеграции
- Supabase + PostgreSQL база данных

**Frontend:**
- React клиент (apps/client/)
- MDT React клиент (apps/mdtclient/)
- FiveM NUI (React приложение)

**FiveM:**
- Lua скрипты для HTTP запросов
- NUI bridge для React приложения
- Ограниченная поддержка WebSocket

---

## 🏗️ Новая архитектура с Socket.IO

### 1. Гибридная система коммуникации

```
┌─────────────────┐    Socket.IO    ┌─────────────────┐
│   Web Clients   │ ◄────────────── │  Socket.IO      │
│   (React Apps)  │                 │  Server         │
└─────────────────┘                 └─────────────────┘
                                            │
                                            │ Redis Cache
                                            ▼
┌─────────────────┐    HTTP Polling  ┌─────────────────┐
│   FiveM Client  │ ◄────────────── │  HTTP API       │
│   (Lua Scripts) │                 │  (Express.js)   │
└─────────────────┘                 └─────────────────┘
```

### 2. Комнаты и пространства имен

```typescript
// Основные пространства имен
io.of('/cad')           // CAD система
io.of('/mdt')           // MDT система
io.of('/dispatch')      // Диспетчерская
io.of('/admin')         // Административная панель

// Комнаты внутри пространств
socket.join('units')    // Статус юнитов
socket.join('calls')    // Вызовы 911
socket.join('alerts')   // Тревоги
socket.join('incidents') // Инциденты
socket.join('warrants') // Ордера
socket.join('bolo')     // BOLO уведомления
```

---

## 🔧 Техническая реализация

### 1. Установка зависимостей

```bash
# В apps/server/
npm install socket.io @types/socket.io
npm install redis @types/redis  # Для кэширования
npm install socket.io-redis     # Для кластеризации
```

### 2. Создание Socket.IO сервера

```typescript
// apps/server/socket.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { authenticateSocket } from './middleware/socket-auth';
import { rateLimitSocket } from './middleware/socket-rate-limit';

export function initializeSocketIO(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware
  io.use(authenticateSocket);
  io.use(rateLimitSocket);

  // Пространства имен
  const cadNamespace = io.of('/cad');
  const mdtNamespace = io.of('/mdt');
  const dispatchNamespace = io.of('/dispatch');
  const adminNamespace = io.of('/admin');

  // Обработчики подключений
  setupCADNamespace(cadNamespace);
  setupMDTNamespace(mdtNamespace);
  setupDispatchNamespace(dispatchNamespace);
  setupAdminNamespace(adminNamespace);

  return io;
}
```

### 3. Аутентификация Socket.IO

```typescript
// apps/server/middleware/socket-auth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

export async function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Проверка JWT токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
}
```

### 4. Обработчики пространств имен

```typescript
// apps/server/socket/cad-namespace.ts
import { Namespace } from 'socket.io';
import { WEBSOCKET_EVENTS, WEBSOCKET_CHANNELS } from '@roleplay-identity/shared-schema';

export function setupCADNamespace(io: Namespace) {
  io.on('connection', (socket) => {
    console.log(`CAD Client connected: ${socket.id}`);

    // Подписка на каналы
    socket.on('subscribe', (channels: string[]) => {
      channels.forEach(channel => {
        socket.join(channel);
        console.log(`Client ${socket.id} joined channel: ${channel}`);
      });
    });

    // Отписка от каналов
    socket.on('unsubscribe', (channels: string[]) => {
      channels.forEach(channel => {
        socket.leave(channel);
        console.log(`Client ${socket.id} left channel: ${channel}`);
      });
    });

    // Обработка статуса юнита
    socket.on('unit_status_update', (data) => {
      socket.to('units').emit('unit_status_changed', data);
    });

    // Обработка вызовов 911
    socket.on('call_created', (data) => {
      socket.to('calls').emit('new_call', data);
    });

    // Обработка тревог
    socket.on('panic_alert', (data) => {
      socket.to('alerts').emit('panic_button_pressed', data);
    });

    // Отключение
    socket.on('disconnect', () => {
      console.log(`CAD Client disconnected: ${socket.id}`);
    });
  });
}
```

### 5. Интеграция с существующим кодом

```typescript
// apps/server/websocket.ts (обновленная версия)
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class CADSocketIOServer {
  private io: SocketIOServer;
  private cadNamespace: any;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: { origin: "*" }
    });
    
    this.cadNamespace = this.io.of('/cad');
    this.setupCADNamespace();
  }

  // Миграция существующих методов
  public broadcastUnitStatusUpdate(unitId: number, status: string, location?: any) {
    this.cadNamespace.to('units').emit('unit_status_update', {
      unitId,
      status,
      location,
      timestamp: Date.now()
    });
  }

  public broadcastNewCall(callData: any) {
    this.cadNamespace.to('calls').emit('new_call', {
      ...callData,
      timestamp: Date.now()
    });
  }

  public broadcastPanicAlert(unitId: number, location: any) {
    this.cadNamespace.to('alerts').emit('panic_alert', {
      unitId,
      location,
      timestamp: Date.now()
    });
  }

  // ... остальные методы
}
```

---

## 🎮 Интеграция с FiveM

### 1. HTTP Polling для FiveM

```typescript
// apps/server/routes/fivem-polling.ts
import { Router } from 'express';
import { getSocketIO } from '../socket';

const router = Router();

// Получение последних событий для FiveM
router.get('/events/:channel', async (req, res) => {
  const { channel } = req.params;
  const { lastEventId } = req.query;
  
  // Получаем события из Redis кэша
  const events = await getEventsFromCache(channel, lastEventId as string);
  
  res.json({
    events,
    lastEventId: events.length > 0 ? events[events.length - 1].id : lastEventId
  });
});

// Отправка события от FiveM
router.post('/events/:channel', async (req, res) => {
  const { channel } = req.params;
  const eventData = req.body;
  
  // Отправляем через Socket.IO
  const io = getSocketIO();
  io.of('/cad').to(channel).emit('fivem_event', eventData);
  
  // Сохраняем в кэш
  await cacheEvent(channel, eventData);
  
  res.json({ success: true });
});

export default router;
```

### 2. Обновление FiveM Lua скриптов

```lua
-- apps/resources_fivem/mdt-system/client/socket-bridge.lua
local lastEventId = 0
local pollingInterval = 1000 -- 1 секунда
local isPolling = false

-- Функция для получения событий через HTTP polling
local function pollEvents(channel)
    if isPolling then return end
    isPolling = true
    
    PerformHttpRequest(
        'http://127.0.0.1:5000/api/fivem/events/' .. channel .. '?lastEventId=' .. lastEventId,
        function(statusCode, response, headers)
            if statusCode == 200 then
                local data = json.decode(response)
                if data.events then
                    for _, event in ipairs(data.events) do
                        -- Обработка события
                        handleSocketEvent(event)
                        lastEventId = event.id
                    end
                end
            end
            isPolling = false
        end,
        'GET',
        '',
        { ['Content-Type'] = 'application/json' }
    )
end

-- Функция для отправки событий
local function sendEvent(channel, eventData)
    PerformHttpRequest(
        'http://127.0.0.1:5000/api/fivem/events/' .. channel,
        function(statusCode, response, headers)
            if statusCode == 200 then
                print('Event sent successfully')
            end
        end,
        'POST',
        json.encode(eventData),
        { ['Content-Type'] = 'application/json' }
    )
end

-- Запуск polling для нужных каналов
Citizen.CreateThread(function()
    while true do
        pollEvents('units')
        pollEvents('calls')
        pollEvents('alerts')
        Citizen.Wait(pollingInterval)
    end
end)

-- Экспорт функций
exports('sendSocketEvent', sendEvent)
exports('startEventPolling', function(channel)
    pollEvents(channel)
end)
```

### 3. Обновление NUI Bridge

```javascript
// apps/resources_fivem/mdt-system/ui/socket-bridge.js
class FiveMSocketBridge {
  constructor() {
    this.lastEventId = 0;
    this.pollingInterval = 1000;
    this.isPolling = false;
  }

  // HTTP polling для получения событий
  async pollEvents(channel) {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/fivem/events/${channel}?lastEventId=${this.lastEventId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.events) {
          data.events.forEach(event => {
            this.handleSocketEvent(event);
            this.lastEventId = event.id;
          });
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      this.isPolling = false;
    }
  }

  // Отправка событий
  async sendEvent(channel, eventData) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/fivem/events/${channel}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        }
      );

      if (response.ok) {
        console.log('Event sent successfully');
      }
    } catch (error) {
      console.error('Send event error:', error);
    }
  }

  // Обработка событий
  handleSocketEvent(event) {
    switch (event.type) {
      case 'unit_status_update':
        this.handleUnitStatusUpdate(event.data);
        break;
      case 'new_call':
        this.handleNewCall(event.data);
        break;
      case 'panic_alert':
        this.handlePanicAlert(event.data);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
  }

  // Запуск polling
  startPolling() {
    setInterval(() => {
      this.pollEvents('units');
      this.pollEvents('calls');
      this.pollEvents('alerts');
    }, this.pollingInterval);
  }
}

// Инициализация
const socketBridge = new FiveMSocketBridge();
socketBridge.startPolling();

// Экспорт для использования в React
window.FiveMSocketBridge = socketBridge;
```

---

## 📱 Обновление клиентских приложений

### 1. React клиент (apps/client/)

```typescript
// apps/client/src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(namespace: string = '/cad') {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`http://localhost:5000${namespace}`, {
      auth: {
        token: localStorage.getItem('authToken')
      },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [namespace]);

  return socketRef.current;
}

// Хук для подписки на каналы
export function useSocketChannel(channel: string, event: string, callback: (data: any) => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe', [channel]);
    socket.on(event, callback);

    return () => {
      socket.emit('unsubscribe', [channel]);
      socket.off(event, callback);
    };
  }, [socket, channel, event, callback]);
}
```

### 2. MDT клиент (apps/mdtclient/)

```typescript
// apps/mdtclient/src/services/socket.ts
import { io, Socket } from 'socket.io-client';

class MDTSocketService {
  private socket: Socket | null = null;
  private isNUI = typeof (window as any).GetParentResourceName === 'function';

  connect() {
    if (this.isNUI) {
      // В FiveM используем HTTP polling через NUI bridge
      return;
    }

    this.socket = io('http://localhost:5000/mdt', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    this.socket.on('connect', () => {
      console.log('MDT connected to Socket.IO');
    });
  }

  subscribe(channels: string[]) {
    if (this.socket) {
      this.socket.emit('subscribe', channels);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else if (this.isNUI && window.FiveMSocketBridge) {
      // В FiveM отправляем через HTTP
      window.FiveMSocketBridge.sendEvent('mdt', { type: event, data });
    }
  }
}

export const mdtSocket = new MDTSocketService();
```

---

## 🔄 План миграции

### Этап 1: Подготовка (1-2 дня)
1. Установить Socket.IO зависимости
2. Создать базовую структуру Socket.IO сервера
3. Настроить middleware для аутентификации
4. Создать тестовые endpoints

### Этап 2: Миграция WebSocket (2-3 дня)
1. Заменить `ws` на Socket.IO в backend
2. Обновить существующие методы broadcast
3. Добавить поддержку комнат и пространств имен
4. Протестировать с web клиентами

### Этап 3: FiveM интеграция (2-3 дня)
1. Создать HTTP polling endpoints
2. Обновить Lua скрипты
3. Обновить NUI bridge
4. Протестировать в FiveM

### Этап 4: Оптимизация (1-2 дня)
1. Добавить Redis кэширование
2. Настроить rate limiting
3. Добавить мониторинг
4. Документация

---

## 🎯 Ожидаемые результаты

### Улучшения производительности:
- Автоматическое переподключение при потере связи
- Fallback к HTTP long polling для проблемных сетей
- Лучшая обработка ошибок и восстановление

### Улучшения разработки:
- Встроенное логирование и отладка
- Поддержка middleware
- Пространства имен и комнаты
- Лучшая документация и сообщество

### Улучшения масштабируемости:
- Поддержка кластеризации через Redis
- Лучшее управление памятью
- Возможность горизонтального масштабирования

---

## 🔧 Конфигурация для продакшена

```typescript
// apps/server/socket.ts (продакшен конфигурация)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  upgradeTimeout: 10000,
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 32768
  }
});

// Redis адаптер для кластеризации
if (process.env.REDIS_URL) {
  const { createAdapter } = require('@socket.io/redis-adapter');
  const { createClient } = require('redis');
  
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  
  io.adapter(createAdapter(pubClient, subClient));
}
```

Этот план обеспечивает плавную миграцию с сохранением обратной совместимости и значительным улучшением производительности и надежности системы. 