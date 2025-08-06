# 🏗️ АРХИТЕКТУРНАЯ КАРТА БЭКЕНДА
## RolePlay Identity Server - Текущее состояние и план миграции

---

## 📊 ОБЩИЙ ОБЗОР АРХИТЕКТУРЫ

### 🎯 Текущая цель
Полная миграция с "старой" архитектуры на "новую" версионированную архитектуру с Dependency Injection (DI) и соблюдением всех "Золотых Правил".

### 🔄 Состояние миграции
- **Выполнено**: ~30% (DI-контейнер, типы, тестовая среда)
- **В процессе**: ~20% (миграция роутов)
- **Осталось**: ~50% (завершение миграции, удаление старого кода)

---

## 🏛️ ТЕКУЩАЯ АРХИТЕКТУРА

### 📁 Структура директорий
```
apps/server/src/
├── 📁 api/                    # API слой
│   ├── 📁 middleware/         # ✅ РАБОТАЕТ - Express middleware
│   ├── 📁 lib/               # ✅ РАБОТАЕТ - Библиотеки
│   └── 📁 routes/            # 🔄 ПЕРЕХОДНЫЙ ПЕРИОД
│       ├── 📁 v1/            # ✅ НОВАЯ АРХИТЕКТУРА
│       │   ├── characters.ts # ✅ РАБОТАЕТ - Образец DI
│       │   └── index.ts      # ✅ РАБОТАЕТ - Фабричная функция
│       ├── auth.ts           # 🔄 МИГРАЦИЯ - Старый подход
│       ├── forum.ts          # ❌ УСТАРЕЛ - Прямые запросы к БД
│       ├── discord.ts        # ❌ УСТАРЕЛ - Нет сервисного слоя
│       ├── public.ts         # 🔄 МИГРАЦИЯ - Старый импорт
│       ├── realtime.ts       # ❌ УСТАРЕЛ - Дублирование
│       └── index.ts          # ✅ РАБОТАЕТ - Главный роутер
├── 📁 core/                  # ✅ РАБОТАЕТ - Бизнес-логика
│   ├── 📁 services/          # ✅ РАБОТАЕТ - Сервисный слой
│   └── 📁 lib/               # ✅ РАБОТАЕТ - Утилиты
├── 📁 config/                # ✅ РАБОТАЕТ - Конфигурация
├── 📁 db/                    # ✅ РАБОТАЕТ - Подключение к БД
├── 📁 types/                 # ✅ РАБОТАЕТ - TypeScript типы
├── 📁 utils/                 # ✅ РАБОТАЕТ - Вспомогательные функции
├── index.ts                  # ✅ РАБОТАЕТ - Точка входа с DI
├── development.ts            # ✅ РАБОТАЕТ - Dev режим
├── production.ts             # ✅ РАБОТАЕТ - Prod режим
└── websocket.ts              # ✅ РАБОТАЕТ - WebSocket сервер
```

---

## 🔧 СЕРВИСНЫЙ СЛОЙ (CORE SERVICES)

### ✅ РАБОТАЮЩИЕ СЕРВИСЫ
```typescript
// apps/server/src/core/services/
├── ✅ AuthService.ts          # Аутентификация и авторизация
├── ✅ CharacterService.ts     # Управление персонажами (ОБРАЗЕЦ)
├── ✅ ApplicationService.ts   # Заявки на работу
├── ✅ SupportTicketService.ts # Тикеты поддержки
├── ✅ Call911Service.ts       # Вызовы экстренных служб
├── ✅ ReportService.ts        # Отчеты
├── ✅ ReportTemplateService.ts # Шаблоны отчетов
├── ✅ MDTService.ts           # MDT функционал
├── ✅ RealTimeService.ts      # Real-time коммуникация
├── ✅ TestService.ts          # Тестовые эндпоинты
├── ✅ PublicService.ts        # Публичные данные
├── ✅ LoggerService.ts        # Логирование
├── ✅ CacheService.ts         # Кэширование
└── ✅ FilledReportService.ts  # Заполненные отчеты
```

### 🔄 СЕРВИСЫ, ТРЕБУЮЩИЕ АДАПТАЦИИ
```typescript
// Нужно создать:
├── 🔄 ForumService.ts         # ❌ ОТСУТСТВУЕТ - Для forum.ts
├── 🔄 DiscordService.ts       # ❌ ОТСУТСТВУЕТ - Для discord.ts
└── 🔄 RealtimeService.ts      # 🔄 АДАПТАЦИЯ - Обновить под новые типы
```

### 🎯 DI-КОНТЕЙНЕР (РАБОТАЕТ)
```typescript
// apps/server/src/index.ts
const services: ServicesContainer = {
  // ✅ Все сервисы создаются централизованно
  authService: new AuthService(),
  characterService: new CharacterService(),
  applicationService: new ApplicationService(),
  supportTicketService: new SupportTicketService(),
  call911Service: new Call911Service(),
  reportService: new ReportService(),
  reportTemplateService: new ReportTemplateService(),
  mdtService: new MDTService(),
  realTimeService: new RealTimeService(),
  testService: new TestService(),
  publicService: new PublicService(),
  loggerService: new LoggerService(),
  cacheService: new CacheService(),
  filledReportService: new FilledReportService(
    reportService,
    reportTemplateService
  ),
};
```

---

## 🛣️ АРХИТЕКТУРА РОУТИНГА

### ✅ НОВАЯ АРХИТЕКТУРА (V1)
```typescript
// apps/server/src/api/routes/v1/index.ts
export function createV1Router(services: ServicesContainer): Router {
  const router: Router = Router();

  // ✅ ПУБЛИЧНЫЕ РОУТЫ
  router.use('/auth', createAuthRoutes(services));
  router.get('/health', ...);

  // ✅ MIDDLEWARE АУТЕНТИФИКАЦИИ
  router.use(authenticateToken);

  // ✅ ЗАЩИЩЕННЫЕ РОУТЫ
  router.use('/characters', createCharacterRoutes(services));
  // ... остальные роуты
}
```

### ❌ СТАРАЯ АРХИТЕКТУРА (К УДАЛЕНИЮ)
```typescript
// apps/server/src/api/routes/
├── ❌ auth.ts                 # 373 строки - Создает свой AuthService
├── ❌ forum.ts                # 585 строк - Прямые запросы к БД
├── ❌ discord.ts              # 199 строк - Нет сервисного слоя
├── ❌ public.ts               # 113 строк - Старый импорт сервиса
├── ❌ realtime.ts             # 174 строки - Дублирование
├── ❌ realtime-simple.ts      # 232 строки - Дублирование
└── ❌ test.routes.ts          # 71 строка - Тестовые роуты
```

### 🔄 ПЕРЕХОДНЫЙ ПЕРИОД
```typescript
// apps/server/src/api/routes/index.ts
export async function registerRoutes(app: Express, services: ServicesContainer) {
  // ✅ НОВОЕ: v1 роуты с DI
  const v1Router = createV1Router(services);
  app.use('/api/v1', v1Router);

  // ❌ СТАРОЕ: Прямая регистрация (будет удалено)
  // app.use('/api', oldRoutes);
}
```

---

## 🎯 ПЛАН МИГРАЦИИ ПО ПРИОРИТЕТАМ

### 🚨 КРИТИЧНО (Неделя 1)
```typescript
// 1. Создать недостающие сервисы
├── ForumService.ts            # Для forum.ts
├── DiscordService.ts          # Для discord.ts
└── Обновить RealtimeService.ts # Адаптация под новые типы

// 2. Мигрировать auth.ts в v1
├── Создать createAuthRoutes(services)
├── Перенести в routes/v1/auth.ts
└── Обновить v1/index.ts
```

### 🔥 ВЫСОКИЙ (Неделя 2)
```typescript
// 3. Мигрировать public.ts в v1
├── Создать createPublicRoutes(services)
├── Перенести в routes/v1/public.ts
└── Обновить v1/index.ts

// 4. Мигрировать discord.ts в v1
├── Создать createDiscordRoutes(services)
├── Перенести в routes/v1/discord.ts
└── Обновить v1/index.ts
```

### 📈 СРЕДНИЙ (Неделя 3)
```typescript
// 5. Мигрировать forum.ts в v1
├── Создать createForumRoutes(services)
├── Перенести в routes/v1/forum.ts
└── Обновить v1/index.ts

// 6. Мигрировать realtime.ts в v1
├── Объединить realtime.ts + realtime-simple.ts
├── Создать createRealtimeRoutes(services)
└── Перенести в routes/v1/realtime.ts
```

### 🔧 НИЗКИЙ (Неделя 4)
```typescript
// 7. Завершение миграции
├── Обновить главный роутер
├── Удалить старые файлы
├── Обновить тесты
└── Обновить документацию
```

---

## 🧪 ТЕСТОВАЯ СРЕДА

### ✅ РАБОТАЮЩИЕ КОМПОНЕНТЫ
```typescript
// apps/server/tests/
├── ✅ setup.ts               # Настройка тестового окружения
├── ✅ api/                   # API тесты
├── ✅ services/              # Тесты сервисов
├── ✅ integration/           # Интеграционные тесты
└── ✅ README.md              # Документация тестов
```

### 🔄 ТРЕБУЮТ ОБНОВЛЕНИЯ
```typescript
// Нужно переписать тесты для новых v1 роутов:
├── 🔄 auth.test.ts           # Тесты для v1/auth
├── 🔄 public.test.ts         # Тесты для v1/public
├── 🔄 discord.test.ts        # Тесты для v1/discord
├── 🔄 forum.test.ts          # Тесты для v1/forum
└── 🔄 realtime.test.ts       # Тесты для v1/realtime
```

---

## 📦 ТИПЫ И СХЕМЫ

### ✅ РАБОТАЮЩИЕ КОМПОНЕНТЫ
```typescript
// packages/db-types/src/index.ts
├── ✅ Database типы          # Полная типизация БД
├── ✅ ENUM типы              # Строгая типизация
├── ✅ RPC функции            # Типы для stored procedures
└── ✅ Composite типы         # Составные типы данных

// apps/server/src/types/
├── ✅ services.ts            # ServicesContainer
├── ✅ express.d.ts           # Расширения Express
└── ✅ normalized-character.types.ts # Нормализованные типы
```

### 🔄 ТРЕБУЮТ ОБНОВЛЕНИЯ
```typescript
// Нужно добавить типы для новых сервисов:
├── 🔄 ForumService типы      # Для forum функционала
├── 🔄 DiscordService типы    # Для Discord интеграции
└── 🔄 RealtimeService типы   # Для WebSocket
```

---

## 🔒 БЕЗОПАСНОСТЬ И MIDDLEWARE

### ✅ РАБОТАЮЩИЕ КОМПОНЕНТЫ
```typescript
// apps/server/src/api/middleware/
├── ✅ auth.middleware.ts     # Аутентификация JWT
├── ✅ CORS настройки         # В index.ts
├── ✅ Error handling         # Централизованная обработка ошибок
└── ✅ Rate limiting          # В отдельных роутах
```

### 🔄 ТРЕБУЮТ УЛУЧШЕНИЯ
```typescript
// Нужно создать:
├── 🔄 error.middleware.ts    # Единый error handler
├── 🔄 validation.middleware.ts # Zod валидация
└── 🔄 rate-limit.middleware.ts # Централизованный rate limiting
```

---

## 🗄️ БАЗА ДАННЫХ

### ✅ РАБОТАЮЩИЕ КОМПОНЕНТЫ
```typescript
// apps/server/src/db/
├── ✅ supabase.ts            # Подключение к Supabase
├── ✅ RPC функции            # Stored procedures
└── ✅ Миграции               # Supabase migrations

// Схемы БД:
├── ✅ public                 # Публичные данные
├── ✅ common                 # Общие данные
└── ✅ mdt                    # MDT данные
```

### 🔄 ТРЕБУЮТ ОБНОВЛЕНИЯ
```typescript
// Нужно добавить RPC функции для:
├── 🔄 Forum функционал       # get_forum_stats, get_forum_categories
├── 🔄 Discord интеграция     # sync_discord_user
└── 🔄 Realtime события       # broadcast_notification
```

---

## 🚀 ПРОИЗВОДИТЕЛЬНОСТЬ И МАСШТАБИРУЕМОСТЬ

### ✅ РАБОТАЮЩИЕ КОМПОНЕНТЫ
```typescript
// apps/server/src/
├── ✅ CacheService           # Кэширование
├── ✅ LoggerService          # Структурированное логирование
├── ✅ Graceful shutdown      # Корректное завершение
└── ✅ WebSocket сервер       # Real-time коммуникация
```

### 🔄 ТРЕБУЮТ УЛУЧШЕНИЯ
```typescript
// Нужно добавить:
├── 🔄 Connection pooling     # Для PostgreSQL
├── 🔄 Health checks          # Мониторинг состояния
├── 🔄 Metrics collection     # Сбор метрик
└── 🔄 Performance monitoring # Мониторинг производительности
```

---

## 📋 ЧЕКЛИСТ МИГРАЦИИ

### ✅ ВЫПОЛНЕНО
- [x] DI-контейнер создан
- [x] Типы синхронизированы с БД
- [x] Тестовая среда настроена
- [x] CharacterService как образец
- [x] v1 роутер с фабричными функциями
- [x] Аутентификация и авторизация

### 🔄 В ПРОЦЕССЕ
- [ ] Создание ForumService
- [ ] Создание DiscordService
- [ ] Миграция auth.ts в v1
- [ ] Миграция public.ts в v1

### ❌ ОСТАЛОСЬ
- [ ] Миграция discord.ts в v1
- [ ] Миграция forum.ts в v1
- [ ] Миграция realtime.ts в v1
- [ ] Обновление главного роутера
- [ ] Удаление старых файлов
- [ ] Обновление тестов
- [ ] Обновление документации

---

## 🎯 КОНЕЧНАЯ ЦЕЛЬ

### 🏆 ИДЕАЛЬНАЯ АРХИТЕКТУРА
```typescript
// После завершения миграции:
apps/server/src/api/routes/
├── 📁 v1/                    # ЕДИНСТВЕННАЯ архитектура
│   ├── auth.ts              # ✅ DI + валидация + обработка ошибок
│   ├── characters.ts        # ✅ Образец архитектуры
│   ├── public.ts            # ✅ Публичные данные
│   ├── discord.ts           # ✅ Discord интеграция
│   ├── forum.ts             # ✅ Forum функционал
│   ├── realtime.ts          # ✅ WebSocket события
│   └── index.ts             # ✅ Фабричная функция
└── index.ts                 # ✅ Только v1 роуты

// Удаленные файлы:
❌ auth.ts (старый)
❌ forum.ts (старый)
❌ discord.ts (старый)
❌ public.ts (старый)
❌ realtime.ts (старый)
❌ realtime-simple.ts (старый)
```

### 🎉 РЕЗУЛЬТАТ
- **100% DI** - Все зависимости внедряются
- **100% версионирование** - Все API через /api/v1/
- **100% типизация** - Только типы из db-types
- **100% валидация** - Zod схемы везде
- **100% обработка ошибок** - Централизованная
- **100% тестирование** - Покрытие всех роутов

---

## 📊 МЕТРИКИ ПРОГРЕССА

### 📈 Текущий прогресс: 30%
- ✅ DI-контейнер: 100%
- ✅ Типы: 100%
- ✅ Тестовая среда: 100%
- 🔄 Роуты: 15%
- ❌ Сервисы: 85%
- ❌ Документация: 0%

### 🎯 Целевые метрики
- **Неделя 1**: 45% (создание сервисов + auth)
- **Неделя 2**: 65% (public + discord)
- **Неделя 3**: 85% (forum + realtime)
- **Неделя 4**: 100% (завершение + очистка)

---

*Эта архитектурная карта будет обновляться по мере выполнения миграции.* 