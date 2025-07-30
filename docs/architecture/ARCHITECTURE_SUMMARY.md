# Краткая сводка архитектуры бэкенда

## 🏗️ Текущая архитектура

### Backend Stack
- **Runtime:** Node.js 18+ + TypeScript
- **Framework:** Express.js 4.21.2
- **Database:** PostgreSQL + Supabase
- **ORM:** Drizzle ORM
- **WebSocket:** `ws` библиотека (8.18.0)
- **Auth:** JWT + Supabase Auth
- **Port:** 5000

### Основные компоненты
```
apps/server/
├── index.ts              # Точка входа
├── routes.ts             # Основные маршруты (884 строки)
├── websocket.ts          # WebSocket сервер (560 строк)
├── businessLogic.ts      # Бизнес-логика (758 строк)
├── storage.ts            # Интерфейс хранилища
├── db/                   # База данных
│   ├── index.ts          # Подключение к PostgreSQL
│   ├── PgStorage.ts      # Реализация хранилища
│   └── schema/           # Схемы таблиц
├── routes/               # API маршруты
│   ├── cad.ts            # CAD интеграция
│   ├── auth.ts           # Аутентификация
│   └── ...               # Другие маршруты
└── middleware/           # Middleware
    └── auth.middleware.ts # Аутентификация
```

---

## 📡 Способы коммуникации

### 1. REST API (Основной)
**Endpoints для FiveM:**
- `POST /api/auth/login` - Вход
- `POST /api/cad/characters` - Создание персонажа
- `GET /api/cad/active` - Активные юниты
- `POST /api/cad/calls` - Создание вызова 911
- `PUT /api/cad/status` - Изменение статуса

**Аутентификация:**
- JWT: `Authorization: Bearer <token>`
- CAD токен: `X-CAD-Token: <token>`
- CORS: Разрешен для всех источников

### 2. WebSocket (Текущий)
**Реализация:** Нативная библиотека `ws`
**События:**
- `broadcastUnitStatusUpdate()` - Статус юнита
- `broadcastNewCall()` - Новый вызов
- `broadcastPanicAlert()` - Тревога
- `broadcastBOLOAlert()` - BOLO уведомление

**Проблемы:**
- Нет автоматического переподключения
- Отсутствует fallback к HTTP
- Нет поддержки комнат
- Сложная отладка

---

## 🎮 FiveM интеграция

### Структура ресурса
```
apps/resources_fivem/mdt-system/
├── fxmanifest.lua        # Манифест
├── client/main.lua       # Клиентский скрипт (675 строк)
├── server/main.lua       # Серверный скрипт (317 строк)
└── ui/                   # React приложение
    ├── index.html
    ├── index.js
    └── fivem-nui.js      # NUI мост
```

### Способы связи с Backend
1. **HTTP запросы из Lua:**
   ```lua
   PerformHttpRequest('http://127.0.0.1:5000/api/...', callback)
   ```

2. **NUI Callbacks:**
   ```lua
   RegisterNUICallback('nuiCallback', function(data, cb)
       -- Обработка данных от React
   end)
   ```

3. **WebSocket:** Ограниченная поддержка

---

## 🔧 Текущие проблемы

### WebSocket
- ❌ Нет автоматического переподключения
- ❌ Отсутствует fallback к HTTP long polling
- ❌ Нет поддержки комнат и пространств имен
- ❌ Сложная интеграция с Express middleware
- ❌ Ограниченная отладка

### FiveM интеграция
- ❌ HTTP запросы блокируют основной поток
- ❌ Нет real-time обновлений из игры
- ❌ Сложная синхронизация состояния
- ❌ Отсутствует двусторонняя связь

---

## 🚀 Рекомендации по Socket.IO

### Преимущества Socket.IO
- ✅ Автоматическое переподключение
- ✅ Fallback к HTTP long polling
- ✅ Встроенная поддержка комнат
- ✅ Middleware поддержка
- ✅ Лучшая отладка и логирование
- ✅ Совместимость с Express

### План интеграции
1. **Заменить `ws` на Socket.IO**
2. **Создать гибридную систему:**
   - Socket.IO для web клиентов
   - HTTP polling для FiveM
3. **Добавить Redis для кэширования**
4. **Реализовать пространства имен:**
   - `/cad` - CAD система
   - `/mdt` - MDT система
   - `/dispatch` - Диспетчерская

### Ожидаемые улучшения
- **Надежность:** Автоматическое переподключение
- **Производительность:** Fallback механизмы
- **Масштабируемость:** Поддержка кластеризации
- **Разработка:** Лучшая отладка и документация

---

## 📋 Быстрый старт

### Установка Socket.IO
```bash
cd apps/server/
npm install socket.io @types/socket.io
```

### Базовая настройка
```typescript
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: "*" },
  transports: ['websocket', 'polling']
});

io.of('/cad').on('connection', (socket) => {
  socket.on('subscribe', (channels) => {
    channels.forEach(channel => socket.join(channel));
  });
});
```

### Миграция существующих событий
```typescript
// Было (ws)
wss.broadcast('unit_status_update', data);

// Стало (Socket.IO)
io.of('/cad').to('units').emit('unit_status_update', data);
```

---

## 🎯 Заключение

Текущая архитектура хорошо структурирована и готова к интеграции Socket.IO. Основные преимущества:

1. **Модульность** - легко заменить WebSocket
2. **Гибкость** - поддержка JWT и CAD токенов
3. **Интеграция** - HTTP API уже настроен
4. **Масштабируемость** - можно добавить Redis

Рекомендуется поэтапная миграция с сохранением обратной совместимости. 