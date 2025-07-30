# Анализ архитектуры бэкенда для интеграции Socket.IO

## 🏗️ Общая архитектура системы

### 1. Текущий стек технологий

**Backend (apps/server/):**
- **Runtime:** Node.js 18+ с TypeScript
- **Framework:** Express.js 4.21.2
- **Database:** PostgreSQL + Supabase
- **ORM:** Drizzle ORM
- **Authentication:** JWT + Supabase Auth
- **WebSocket:** Нативная библиотека `ws` (8.18.0)
- **File Upload:** Multer
- **Validation:** Zod
- **Security:** bcrypt, express-rate-limit

**Frontend:**
- **Client (apps/client/):** React + Vite + TypeScript
- **MDT Client (apps/mdtclient/):** React + Vite + TypeScript
- **FiveM UI:** React приложение, встроенное в NUI

**FiveM Integration:**
- **Resource:** `apps/resources_fivem/mdt-system/`
- **Communication:** HTTP REST API + WebSocket
- **NUI Bridge:** Специальные скрипты для FiveM

---

## 🔄 Схема взаимодействия компонентов

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   FiveM Client  │ ──────────────► │   Backend API   │
│   (Lua Scripts) │                 │   (Express.js)  │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │ WebSocket                         │ WebSocket
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   FiveM NUI     │ ◄────────────── │  WebSocket      │
│   (React App)   │                 │  Server (ws)    │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │ HTTP/REST                         │ Database
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Web Client    │                 │   PostgreSQL    │
│   (React App)   │                 │   + Supabase    │
└─────────────────┘                 └─────────────────┘
```

---

## 📡 Текущие способы коммуникации

### 1. REST API (Основной канал)

**Endpoints для FiveM:**
```typescript
// Аутентификация
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me

// CAD интеграция
POST /api/cad/characters
GET /api/cad/characters
POST /api/cad/vehicles
GET /api/cad/vehicles/plate/:plate
POST /api/cad/weapons
GET /api/cad/weapons/serial/:serial

// Статус юнитов
POST /api/cad/onduty
PUT /api/cad/status
POST /api/cad/offduty
GET /api/cad/active
POST /api/cad/panic

// Вызовы 911
POST /api/cad/calls
GET /api/cad/calls
PUT /api/cad/calls/:id/attach
PUT /api/cad/calls/:id/status

// Отчеты
POST /api/cad/records
GET /api/cad/records

// Игровая интеграция
POST /api/cad/generate-token
GET /api/cad/me
```

**Аутентификация:**
- JWT токены в заголовке `Authorization: Bearer <token>`
- CAD токены для игровой интеграции: `X-CAD-Token: <token>`
- CORS настроен для всех источников (включая FiveM)

### 2. WebSocket (Реализован через `ws`)

**Текущая реализация в `websocket.ts`:**
```typescript
class CADWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  
  // События для real-time обновлений
  broadcastUnitStatusUpdate(unitId: number, status: string, location?: any)
  broadcastUnitLocationUpdate(unitId: number, location: any)
  broadcastNewCall(callData: any)
  broadcastCallStatusUpdate(callId: number, status: string)
  broadcastPanicAlert(unitId: number, location: any)
  broadcastBOLOAlert(vehiclePlate: string, description: string)
  broadcastCallCreated(callData: any)
  broadcastCallUpdated(callId: number, callData: any)
  broadcastCallEnded(callId: number)
  broadcastIncidentCreated(incidentData: any)
  broadcastIncidentUpdated(incidentId: number, incidentData: any)
  broadcastWarrantCreated(warrantData: any)
  broadcastWarrantUpdated(warrantId: number, warrantData: any)
  broadcastTowCallCreated(towCallData: any)
  broadcastTaxiCallCreated(taxiCallData: any)
  broadcastUnitOffDuty(unitId: number)
  broadcastOfficerStatusUpdated(officerData: any)
  broadcastEmsFdStatusUpdated(emsFdData: any)
  broadcastBOLOCreated(boloData: any)
  broadcastPanicButtonOn(unitData: any)
  broadcastSignal100(value: boolean)
  broadcastRoleplayStopped(value: boolean)
  broadcastAreaOfPlayUpdated(aopData: any)
  broadcastDispatcherUpdate(dispatcherData: any)
}
```

**Каналы подписки:**
- `units` - статус юнитов
- `calls` - вызовы 911
- `alerts` - тревоги и уведомления
- `incidents` - инциденты
- `warrants` - ордера
- `bolo` - BOLO уведомления
- `dispatcher` - диспетчерские обновления

---

## 🎮 Интеграция с FiveM

### 1. FiveM Resource Structure

**Файловая структура:**
```
apps/resources_fivem/mdt-system/
├── fxmanifest.lua          # Манифест ресурса
├── config.lua              # Конфигурация
├── client/
│   └── main.lua           # Клиентский скрипт
├── server/
│   └── main.lua           # Серверный скрипт
├── shared/
│   └── utils.lua          # Общие утилиты
└── ui/                    # React приложение
    ├── index.html
    ├── index.css
    ├── index.js
    ├── fivem-nui.js       # NUI мост
    └── nui-bridge.js      # Дополнительный мост
```

### 2. Способы коммуникации с Backend

**HTTP запросы из Lua:**
```lua
-- В client/main.lua
local function makeApiRequest(endpoint, data)
    PerformHttpRequest('http://127.0.0.1:5000/api' .. endpoint, function(statusCode, response, headers)
        if statusCode == 200 then
            local result = json.decode(response)
            -- Обработка ответа
        end
    end, 'POST', json.encode(data), { ['Content-Type'] = 'application/json' })
end
```

**NUI Callbacks:**
```lua
-- Обработка данных от React приложения
RegisterNUICallback('nuiCallback', function(data, cb)
    local action = data.action
    if action == 'searchCitizen' then
        -- Поиск гражданина
    elseif action == 'saveReport' then
        -- Сохранение отчета
    end
    cb('ok')
end)
```

**WebSocket подключение:**
```lua
-- В client/main.lua (если реализовано)
local ws = nil

local function connectWebSocket()
    -- Подключение к WebSocket серверу
    -- Обработка real-time событий
end
```

---

## 🔧 Текущие проблемы и ограничения

### 1. WebSocket реализация

**Проблемы:**
- Использует нативную библиотеку `ws` вместо Socket.IO
- Отсутствует автоматическое переподключение
- Нет комнат и пространств имен
- Ограниченная поддержка событий
- Сложная интеграция с Express middleware

**Ограничения:**
- Нет поддержки fallback к HTTP long polling
- Отсутствует встроенная аутентификация
- Нет поддержки middleware
- Сложная отладка и логирование

### 2. FiveM интеграция

**Проблемы:**
- HTTP запросы блокируют основной поток
- Нет real-time обновлений из игры
- Сложная синхронизация состояния
- Отсутствует двусторонняя связь

**Ограничения:**
- FiveM не поддерживает WebSocket напрямую
- NUI ограничен в возможностях
- Сложная обработка ошибок сети

---

## 🚀 Рекомендации по интеграции Socket.IO

### 1. Замена WebSocket на Socket.IO

**Преимущества:**
- Автоматическое переподключение
- Fallback к HTTP long polling
- Встроенная поддержка комнат
- Middleware поддержка
- Лучшая отладка и логирование
- Совместимость с Express

**План миграции:**
```typescript
// Заменить ws на socket.io
import { Server } from 'socket.io';

// Создать Socket.IO сервер
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Мигрировать существующие события
io.on('connection', (socket) => {
  // Аутентификация
  socket.on('authenticate', (data) => {
    // Проверка токена
  });
  
  // Подписка на каналы
  socket.on('subscribe', (channels) => {
    channels.forEach(channel => {
      socket.join(channel);
    });
  });
  
  // Обработка отключения
  socket.on('disconnect', () => {
    // Очистка ресурсов
  });
});
```

### 2. Интеграция с FiveM

**Стратегия:**
1. **HTTP Polling для FiveM:** Использовать HTTP запросы для получения обновлений
2. **WebSocket для Web клиентов:** Socket.IO для браузерных клиентов
3. **NUI Bridge:** Специальный мост для передачи данных в NUI

**Реализация:**
```typescript
// Создать гибридную систему
class HybridCommunicationManager {
  // WebSocket для web клиентов
  private io: Server;
  
  // HTTP polling для FiveM
  private pollingEndpoints: Map<string, any>;
  
  // Синхронизация между каналами
  broadcastToAll(event: string, data: any) {
    // WebSocket
    this.io.emit(event, data);
    
    // HTTP polling (сохранить в кэш)
    this.cacheEvent(event, data);
  }
}
```

### 3. Оптимизация производительности

**Рекомендации:**
- Использовать Redis для кэширования событий
- Реализовать rate limiting для Socket.IO
- Добавить сжатие данных
- Использовать бинарные протоколы для больших данных
- Реализовать lazy loading для исторических данных

**Архитектура:**
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

---

## 📋 План внедрения Socket.IO

### Этап 1: Подготовка инфраструктуры
1. Установить Socket.IO зависимости
2. Создать Socket.IO сервер
3. Настроить CORS и middleware
4. Добавить аутентификацию

### Этап 2: Миграция WebSocket событий
1. Перенести существующие события в Socket.IO
2. Обновить клиентские библиотеки
3. Добавить поддержку комнат
4. Реализовать fallback механизмы

### Этап 3: Интеграция с FiveM
1. Создать HTTP polling endpoints
2. Реализовать NUI bridge для Socket.IO
3. Добавить синхронизацию состояния
4. Оптимизировать производительность

### Этап 4: Тестирование и оптимизация
1. Нагрузочное тестирование
2. Оптимизация памяти и CPU
3. Мониторинг и логирование
4. Документация API

---

## 🎯 Заключение

Текущая архитектура хорошо структурирована и готова к интеграции Socket.IO. Основные преимущества:

1. **Модульная архитектура** - легко заменить WebSocket на Socket.IO
2. **Гибкая аутентификация** - поддержка JWT и CAD токенов
3. **Хорошая интеграция с FiveM** - HTTP API уже настроен
4. **Масштабируемость** - можно добавить Redis и кластеризацию

Рекомендуется поэтапная миграция с сохранением обратной совместимости. 