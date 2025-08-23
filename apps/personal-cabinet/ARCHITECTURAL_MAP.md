# Архитектурная карта Personal Cabinet Application

**ID**: ac6256dc-5de4-49c8-980c-6a40d776985f  
**Path**: c:/Projects/HorizonProject/aiflows/horizon-community-feat-applications-api-and-test-suite-repair/apps/personal-cabinet

## 🏗️ Общий обзор архитектуры

Personal Cabinet - это веб-приложение для управления личным кабинетом пользователей, построенное с использованием Feature-Sliced Design (FSD) архитектуры. Приложение следует современным принципам разработки React-приложений и обеспечивает четкое разделение ответственности между слоями.

### Технологический стек

```json
{
  "framework": "React 18.2.0",
  "buildTool": "Vite 5.4.19",
  "language": "TypeScript 5.6.3",
  "routing": "React Router Dom 7.6.3",
  "stateManagement": "Zustand 4.5.7 + React Query 5.60.5",
  "ui": "Radix UI + TailwindCSS",
  "forms": "React Hook Form 7.55.0",
  "validation": "Zod 3.24.2",
  "testing": "Jest 30.0.4 + Testing Library",
  "backend": "Supabase",
  "components": "Storybook 9.1.1"
}
```

## 📁 Структура FSD архитектуры

```mermaid
graph TB
    subgraph "📱 FSD Layers"
        App["🚀 app/"]
        Pages["📄 pages/"]
        Widgets["🧩 widgets/"]
        Features["⚡ features/"]
        Entities["🏢 entities/"]
        Shared["🔧 shared/"]
    end
    
    App --> Pages
    Pages --> Widgets
    Widgets --> Features
    Features --> Entities
    Entities --> Shared
    
    App -.-> Shared
    Pages -.-> Shared
    Widgets -.-> Shared
    Features -.-> Shared
    
    style App fill:#ff6b6b
    style Pages fill:#4ecdc4
    style Widgets fill:#45b7d1
    style Features fill:#96ceb4
    style Entities fill:#feca57
    style Shared fill:#ff9ff3
```

### Слои архитектуры

1. **🚀 app/** - Инициализация приложения, провайдеры, роутинг
2. **📄 pages/** - Страницы приложения (routes)
3. **🧩 widgets/** - Композитные UI блоки
4. **⚡ features/** - Бизнес-фичи приложения
5. **🏢 entities/** - Бизнес-сущности
6. **🔧 shared/** - Переиспользуемый код

## 🔧 Детальная структура компонентов

### 🚀 App Layer
```
app/
├── layouts/
│   └── AdminLayout.tsx          # Макет для административных страниц
├── providers/
│   └── AppProviders.tsx         # Провайдеры приложения
├── router/
│   └── AppRouter.tsx            # Конфигурация роутинга
├── App.tsx                      # Главный компонент приложения
└── App.refactored.tsx          # Рефакторенная версия
```

### 📄 Pages Layer
```
pages/
├── admin/                       # Административные страницы
│   ├── applications/           # Управление заявками
│   ├── documents/              # Управление документами
│   ├── leave-management/       # Управление отпусками
│   ├── roles/                  # Управление ролями
│   ├── tests/                  # Управление тестами
│   ├── users/                  # Управление пользователями
│   └── gallery-moderation.tsx  # Модерация галереи
├── auth/                       # Аутентификация
│   ├── login/
│   └── register/
├── cadet/                      # Курсант
│   ├── test/
│   └── training/
├── dashboard/                  # Дашборд
├── profile/                    # Профиль пользователя
├── settings/                   # Настройки
└── [other pages...]           # Остальные страницы
```

### ⚡ Features Layer
```
features/
├── admin/                      # Административные фичи
│   ├── applications/
│   ├── leave-management/
│   ├── reports/
│   └── tests/
├── auth/                       # Аутентификация
├── dashboard/                  # Дашборд
├── profile/                    # Профиль
├── applications/               # Заявки
├── forum/                      # Форум
├── gallery/                    # Галерея
├── mdt-integration/           # Интеграция с MDT
├── notifications/              # Уведомления
├── test-exam/                 # Экзамены
└── theme/                     # Темы оформления
```

### 🏢 Entities Layer
```
entities/
├── user/                      # Пользователь
├── application/               # Заявка
├── character/                 # Персонаж
├── department/                # Департамент
├── forum/                     # Форум
├── notification/              # Уведомление
├── report/                    # Отчет
├── test/                      # Тест
├── test-result/               # Результат теста
└── test-session/              # Сессия теста
```

### 🔧 Shared Layer
```
shared/
├── api/                       # API клиенты
│   ├── api-client.ts         # Базовый HTTP клиент
│   ├── auth-service.ts       # Сервис аутентификации
│   ├── applications-service.ts # Сервис заявок
│   ├── cabinet-service.ts     # Сервис кабинета
│   ├── public-service.ts      # Публичный сервис
│   ├── user-management.ts     # Управление пользователями
│   └── role-management.ts     # Управление ролями
├── config/                    # Конфигурация
├── contexts/                  # React контексты
├── hooks/                     # Пользовательские хуки
├── lib/                       # Утилиты и библиотеки
├── types/                     # TypeScript типы
└── ui/                        # UI компоненты (58 файлов)
```

## 🌐 Архитектура API

```mermaid
graph LR
    subgraph "Frontend"
        PC[Personal Cabinet]
    end
    
    subgraph "API Services"
        AC[API Client]
        AS[Auth Service]
        APS[Applications Service]
        CS[Cabinet Service]
        PS[Public Service]
        UMS[User Management]
        RMS[Role Management]
    end
    
    subgraph "Backend"
        SB[Supabase]
        DB[(Database)]
    end
    
    PC --> AC
    AC --> AS
    AC --> APS
    AC --> CS
    AC --> PS
    AC --> UMS
    AC --> RMS
    
    AS --> SB
    APS --> SB
    CS --> SB
    PS --> SB
    UMS --> SB
    RMS --> SB
    
    SB --> DB
```

### API Endpoints Structure
- **Auth Service**: Аутентификация и авторизация
- **Applications Service**: Управление заявками
- **Cabinet Service**: Функции личного кабинета
- **Public Service**: Публичные API
- **User Management**: Управление пользователями
- **Role Management**: Управление ролями и правами

## 🔐 Система безопасности и прав доступа

### Permission Guard System
```typescript
// Защита маршрутов по правам
<PermissionGuard permission="admin.panel.access">
  <AdminLayout>
    {/* Административный контент */}
  </AdminLayout>
</PermissionGuard>

// Защита компонентов
<PermissionGuard permission="tests.view">
  <AdminTests />
</PermissionGuard>
```

### Роли и права
- **admin.panel.access** - Доступ к административной панели
- **tests.view** - Просмотр тестов
- **applications.manage** - Управление заявками
- **users.manage** - Управление пользователями
- **gallery.moderate** - Модерация галереи

## 🧪 Архитектура тестирования

```
__tests__/
├── api/
│   └── user-management.test.ts    # Тесты API
└── components/
    ├── approved-message.test.tsx   # Тесты компонентов
    ├── profile-summary-widget.test.tsx
    └── user-table.test.tsx
```

### Стратегия тестирования
- **Unit Tests**: Компоненты, хуки, утилиты
- **Integration Tests**: API сервисы
- **Component Tests**: React компоненты с Testing Library

## 🎨 UI/UX архитектура

### Design System
- **Radix UI** - Базовые примитивы
- **TailwindCSS** - Стилизация
- **Lucide React** - Иконки
- **Framer Motion** - Анимации

### Компоненты (58 UI компонентов)
```
ui/
├── button.tsx               # Кнопки
├── input.tsx               # Поля ввода
├── dialog.tsx              # Модальные окна
├── table.tsx               # Таблицы
├── form.tsx                # Формы
├── toast.tsx               # Уведомления
├── permission-guard.tsx    # Защита по правам
├── error-boundary.tsx      # Обработка ошибок
└── [50+ других компонентов]
```

## 📊 Управление состоянием

```mermaid
graph TB
    subgraph "State Management"
        Z[Zustand Stores]
        RQ[React Query]
        RC[React Context]
    end
    
    subgraph "Data Flow"
        UC[UI Components]
        CH[Custom Hooks]
        API[API Services]
    end
    
    UC --> CH
    CH --> Z
    CH --> RQ
    CH --> RC
    RQ --> API
    API --> Backend[Backend Services]
```

### Паттерны управления состоянием
- **Zustand** - Глобальное состояние приложения
- **React Query** - Кэширование и синхронизация данных с сервером
- **React Context** - Контекстное состояние (темы, аутентификация)
- **Local State** - Локальное состояние компонентов

## 🔄 Жизненный цикл разработки

### Development Workflow
```bash
# Разработка
npm run dev              # Локальный сервер
npm run storybook        # Компоненты в изоляции

# Качество кода
npm run lint             # ESLint проверки
npm run type-check       # TypeScript проверки

# Тестирование
npm run test             # Юнит тесты
npm run test:watch       # Тесты в watch режиме
npm run test:coverage    # Покрытие тестами

# Сборка
npm run build            # Продакшн сборка
npm run preview          # Превью сборки
```

### Code Quality
- **ESLint** - Статический анализ кода
- **TypeScript** - Типизация
- **Prettier** - Форматирование
- **Jest** - Тестирование

## 🚀 Производительность и оптимизация

### Lazy Loading
```typescript
// Страницы загружаются по требованию
const AdminTests = React.lazy(() => import('@/pages/admin/tests'))
const Dashboard = React.lazy(() => import('@/pages/dashboard'))
```

### Bundle Optimization
- **Vite** - Быстрая сборка и HMR
- **Code Splitting** - Разделение кода по маршрутам
- **Tree Shaking** - Удаление неиспользуемого кода
- **Lazy Loading** - Отложенная загрузка компонентов

## 🌍 Интернационализация

```
locales/
├── en.json             # Английский
└── ru.json             # Русский
```

### i18n Stack
- **i18next** - Основная библиотека
- **react-i18next** - React интеграция
- **i18next-browser-languagedetector** - Автоопределение языка

## 📱 Responsive Design

### Breakpoints (TailwindCSS)
- **sm**: 640px и выше
- **md**: 768px и выше
- **lg**: 1024px и выше
- **xl**: 1280px и выше
- **2xl**: 1536px и выше

## 🔧 Конфигурация и окружение

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Environment Variables
```env
VITE_API_URL=          # URL API сервера
VITE_SUPABASE_URL=     # URL Supabase
VITE_SUPABASE_ANON_KEY= # Публичный ключ Supabase
```

## 📈 Метрики и мониторинг

### Performance Monitoring
- **Bundle Analyzer** - Анализ размера бандла
- **Lighthouse** - Веб-витрины
- **React DevTools** - Профилирование компонентов

## 🔗 Интеграции

### External Services
- **Supabase** - Backend as a Service
- **MDT System** - Mobile Data Terminal интеграция
- **FiveM** - Игровой сервер интеграция

## 🚨 Обработка ошибок

```typescript
// Глобальная обработка ошибок
<GlobalErrorBoundary>
  <AppProviders>
    <AppRouter />
  </AppProviders>
</GlobalErrorBoundary>
```

### Error Handling Strategy
- **Error Boundaries** - Перехват ошибок React
- **Try/Catch** - Обработка асинхронных ошибок
- **Toast Notifications** - Уведомления об ошибках
- **Fallback UI** - Резервный интерфейс

## 📝 Ключевые принципы разработки

1. **Separation of Concerns** - Четкое разделение ответственности
2. **DRY (Don't Repeat Yourself)** - Избегание дублирования кода
3. **SOLID Principles** - Принципы объектно-ориентированного дизайна
4. **Component Composition** - Композиция компонентов
5. **Type Safety** - Строгая типизация TypeScript
6. **Performance First** - Приоритет производительности
7. **Accessibility** - Доступность для всех пользователей

## 🔄 Планы развития

### Ближайшие задачи
- [ ] Улучшение тестового покрытия
- [ ] Оптимизация производительности
- [ ] Расширение UI компонентов
- [ ] Добавление PWA возможностей

### Долгосрочные цели
- [ ] Микрофронтенд архитектура
- [ ] Serverless функции
- [ ] Advanced Analytics
- [ ] Real-time collaboration

---

# 🏗️ Архитектурная карта бэкенда Horizon Community

**ID**: ac6256dc-5de4-49c8-980c-6a40d776985f  
**Path**: c:/Projects/HorizonProject/aiflows/horizon-community-feat-applications-api-and-test-suite-repair/apps/server

## Обзор архитектуры бэкенда

Бэкенд представляет собой Node.js приложение на базе Express.js, следующее модульной архитектуре с четким разделением слоев и принципом RLS-first (Row Level Security) для безопасности данных.

## Высокоуровневая архитектура

```mermaid
graph TB
    Client[Client Applications<br/>MDT, Cabinet, FiveM] 
    LB[Load Balancer/CDN]
    FW[Firewall/Security Layer]
    
    subgraph "Express.js Server"
        MW[Middleware Pipeline]
        Router[Route Handlers]
        Controllers[Controllers Layer]
        Services[Services Layer] 
        Auth[Authentication Layer]
    end
    
    subgraph "Data Layer"
        Supabase[(Supabase PostgreSQL)]
        Schemas[Multiple Schemas<br/>public, common, mdt, system]
        RLS[Row Level Security]
    end
    
    subgraph "Real-time"
        WS[WebSocket Server]
        RT[Real-time Events]
    end
    
    Client --> LB
    LB --> FW
    FW --> MW
    MW --> Auth
    Auth --> Router
    Router --> Controllers
    Controllers --> Services
    Services --> Supabase
    Supabase --> Schemas
    Schemas --> RLS
    
    WS --> RT
    Services --> WS
    WS --> Client
```

## Структура проекта и компоненты

### 1. Входная точка и инициализация

**Файл:** `src/index.ts`

```mermaid
graph LR
    Start[Application Start] --> ENV[Load Environment]
    ENV --> Express[Create Express App]
    Express --> Security[Apply Security Middleware]
    Security --> Routes[Register Routes]
    Routes --> WS[Setup WebSocket]
    WS --> Server[Start HTTP Server]
    
    subgraph "Middleware Chain"
        JSON[JSON Parser]
        CORS[CORS Handler]
        Helmet[Security Headers]
        RateLimit[Rate Limiting]
    end
    
    Security --> JSON
    JSON --> CORS
    CORS --> Helmet
    Helmet --> RateLimit
```

### 2. Архитектура API маршрутов

**Структура маршрутов:**

```mermaid
graph TB
    API[/api] --> Health[/health]
    API --> V1[/v1]
    API --> Admin[/admin]
    
    subgraph "V1 Routes (Public API)"
        V1 --> Auth[/auth - Authentication]
        V1 --> Characters[/characters - Character Management]
        V1 --> Cabinet[/cabinet - Cabinet Operations]
        V1 --> Applications[/applications - Application Management]
        V1 --> Departments[/departments - Department Operations]
        V1 --> Reports[/reports - EMS/FD/Law Reports]
        V1 --> MDT[/mdt - MDT System]
        V1 --> Tests[/test-sessions - Test Management]
        V1 --> Gallery[/gallery - Gallery System]
        V1 --> Common[/common - Common References]
    end
    
    subgraph "Admin Routes"
        Admin --> AdminApps[/applications - Application Management]
        Admin --> Support[/support - Support Tickets]
        Admin --> AdminTests[/tests - Test Administration]
        Admin --> UserMeta[/user-metadata - User Management]
    end
```

### 3. Middleware архитектура

**Файлы:** `src/api/middleware/*`

```mermaid
graph TD
    Request[Incoming Request] --> Security[Security Middleware]
    
    subgraph "Security Layer"
        Security --> Helmet[Helmet - Security Headers]
        Helmet --> CORS[CORS Validation]
        CORS --> RateLimit[Rate Limiting]
        RateLimit --> Validation[Input Validation]
        Validation --> Sanitization[Input Sanitization]
    end
    
    Sanitization --> AuthCheck{Needs Authentication?}
    AuthCheck -->|Yes| AuthMW[Authentication Middleware]
    AuthCheck -->|No| RouteHandler[Route Handler]
    
    subgraph "Authentication Process"
        AuthMW --> JWTVerify[JWT Token Verification]
        JWTVerify --> UserClients[Create User-Scoped Supabase Clients]
        UserClients --> SessionBuild[Build User Session]
        SessionBuild --> RLSSetup[Setup RLS Context]
    end
    
    RLSSetup --> RouteHandler
    RouteHandler --> Controller[Controller Layer]
```

### 4. Слоистая архитектура

**Паттерн:** Routes → Controllers → Services → Data Access

```mermaid
graph TB
    subgraph "Presentation Layer"
        Routes[Route Handlers<br/>src/api/routes/]
        MW[Middleware Pipeline]
    end
    
    subgraph "Business Logic Layer"
        Controllers[Controllers<br/>src/core/controllers/]
        Services[Services<br/>src/core/services/]
    end
    
    subgraph "Data Access Layer"
        Clients[Supabase Clients<br/>Per-request, User-scoped]
        Cache[Cache Service<br/>Event Caching]
    end
    
    subgraph "Database Layer"
        PublicSchema[(Public Schema<br/>Auth, Profiles)]
        CommonSchema[(Common Schema<br/>Characters, Departments)]
        MDTSchema[(MDT Schema<br/>CAD, Reports)]
        SystemSchema[(System Schema<br/>Applications, Tests)]
    end
    
    Routes --> Controllers
    Controllers --> Services
    Services --> Clients
    Services --> Cache
    
    Clients --> PublicSchema
    Clients --> CommonSchema
    Clients --> MDTSchema
    Clients --> SystemSchema
```

### 5. Сервисы и их назначение

**Директория:** `src/core/services/`

```mermaid
graph TB
    subgraph "Core Business Services"
        AppService[ApplicationService<br/>Управление заявками]
        AuthService[AuthService<br/>Аутентификация]
        UserService[UserService<br/>Управление пользователями]
        CharService[CharacterService<br/>Управление персонажей]
        DeptService[DepartmentService<br/>Департаменты]
    end
    
    subgraph "Specialized Services"
        CabinetService[CabinetService<br/>Личный кабинет]
        MDTService[MDTService<br/>MDT функционал]
        ReportService[ReportService<br/>Отчеты и документы]
        TestService[TestSessionService<br/>Тестирование]
        GalleryService[GalleryService<br/>Галерея]
    end
    
    subgraph "Infrastructure Services"
        RTService[RealTimeService<br/>Реал-тайм события]
        CacheService[CacheService<br/>Кэширование]
        LoggerService[LoggerService<br/>Логирование]
        SupportService[SupportTicketService<br/>Поддержка]
    end
    
    subgraph "Emergency Services"
        Call911Service[Call911Service<br/>Экстренные вызовы]
        FilledReportService[FilledReportService<br/>Заполненные отчеты]
        PublicService[PublicService<br/>Публичные данные]
    end
```

### 6. Система аутентификации и авторизации

**Файл:** `src/api/middleware/auth.middleware.ts`

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Supabase
    participant Database
    
    Client->>Middleware: Request with Bearer Token
    Middleware->>Supabase: Verify JWT Token
    Supabase->>Middleware: User Data
    
    Middleware->>Middleware: Create User-Scoped Clients
    Middleware->>Database: Fetch User Profile (public.profiles)
    Database->>Middleware: Profile Data
    
    Middleware->>Database: Fetch User Roles (common.v_effective_roles)
    Database->>Middleware: Roles Data
    
    Middleware->>Database: Fetch User Permissions (common.v_effective_permissions)
    Database->>Middleware: Permissions Data
    
    Middleware->>Database: Fetch User Memberships (common.memberships)
    Database->>Middleware: Memberships Data
    
    Middleware->>Middleware: Build Complete Session
    Middleware->>Client: Attach User Context to Request
```

### 7. Схемы базы данных и их назначение

```mermaid
graph TB
    subgraph "Database Schemas"
        Public[(public<br/>- profiles<br/>- auth data<br/>- system functions)]
        Common[(common<br/>- characters<br/>- departments<br/>- ranks<br/>- memberships)]
        MDT[(mdt<br/>- incidents<br/>- reports<br/>- vehicles<br/>- weapons)]
        System[(system<br/>- applications<br/>- tests<br/>- statuses<br/>- configs)]
    end
    
    subgraph "Client Types per Schema"
        PublicClient[Public Client<br/>Authentication<br/>User Profiles]
        CommonClient[Common Client<br/>Character Management<br/>Department Operations]
        MDTClient[MDT Client<br/>CAD Operations<br/>Report Management]
        SystemClient[System Client<br/>Application Processing<br/>Test Management]
    end
    
    PublicClient --> Public
    CommonClient --> Common
    MDTClient --> MDT
    SystemClient --> System
```

### 8. Реал-тайм коммуникация

**Файлы:** `src/websocket.ts`, `src/core/services/RealTimeService.ts`

```mermaid
graph TB
    subgraph "Real-time Architecture"
        WS[WebSocket Server<br/>Socket.IO]
        Cache[Event Cache<br/>In-Memory Store]
        RT[RealTimeService<br/>Event Management]
    end
    
    subgraph "Event Types"
        CAD[CAD Events<br/>Unit Status Updates]
        Chat[Chat Messages<br/>Department Communications]
        Alerts[Alert Events<br/>Emergency Notifications]
        Status[Status Updates<br/>User/Character Status]
    end
    
    subgraph "Clients"
        MDTApp[MDT Application]
        CabinetApp[Cabinet Application]
        FiveMRes[FiveM Resource]
    end
    
    RT --> WS
    WS --> Cache
    
    CAD --> RT
    Chat --> RT
    Alerts --> RT
    Status --> RT
    
    WS --> MDTApp
    WS --> CabinetApp
    WS --> FiveMRes
```

### 9. Система тестирования

**Директория:** `tests/`

```mermaid
graph TB
    subgraph "Testing Strategy"
        Unit[Unit Tests<br/>Individual Services]
        Integration[Integration Tests<br/>API Endpoints]
        E2E[End-to-End Tests<br/>Full Workflows]
        Performance[Performance Tests<br/>Load Testing]
        Security[Security Tests<br/>Vulnerability Testing]
    end
    
    subgraph "Test Categories"
        API[API Tests<br/>tests/api/]
        Services[Service Tests<br/>tests/services/]
        Middleware[Middleware Tests<br/>tests/integration/]
        Helpers[Test Helpers<br/>tests/helpers/]
    end
    
    subgraph "Test Tools"
        Jest[Jest Framework]
        Supertest[Supertest<br/>HTTP Testing]
        Playwright[Playwright<br/>Browser Testing]
    end
    
    Unit --> Services
    Integration --> API
    Integration --> Middleware
    E2E --> Helpers
    
    API --> Jest
    Services --> Jest
    Middleware --> Supertest
    Helpers --> Playwright
```

### 10. Обработка ошибок и безопасность

```mermaid
graph TB
    subgraph "Security Layers"
        InputVal[Input Validation<br/>Zod Schemas]
        RateLimit[Rate Limiting<br/>Per User/IP]
        CORS[CORS Policy<br/>Strict Origins]
        Helmet[Security Headers<br/>CSP, HSTS]
        Auth[JWT Authentication<br/>Supabase Auth]
        RLS[Row Level Security<br/>Database Level]
    end
    
    subgraph "Error Handling"
        AppError[AppError Class<br/>Custom Errors]
        ErrorHandler[Global Error Handler<br/>Express Middleware]
        Logger[Winston Logger<br/>Structured Logging]
        Monitoring[Error Monitoring<br/>Performance Tracking]
    end
    
    InputVal --> AppError
    RateLimit --> AppError
    Auth --> AppError
    
    AppError --> ErrorHandler
    ErrorHandler --> Logger
    Logger --> Monitoring
```

## Технологический стек бэкенда

```json
{
  "runtime": "Node.js 20.16.11",
  "framework": "Express.js 4.21.2",
  "language": "TypeScript 5.6.3",
  "database": "Supabase PostgreSQL",
  "auth": "Supabase Auth + JWT",
  "realtime": "Socket.IO 4.8.1",
  "validation": "Zod 3.25.76",
  "security": "Helmet 8.1.0 + express-rate-limit 8.0.1",
  "testing": "Jest 30.0.4 + Supertest 7.1.3",
  "logging": "Winston 3.15.0",
  "orm": "Drizzle ORM 0.44.3",
  "websockets": "ws 8.18.3",
  "buildTool": "TypeScript Compiler + tsx 4.19.1"
}
```

## Ключевые особенности архитектуры бэкенда

### 1. **RLS-First подход**
- Каждый запрос создает пользовательские Supabase клиенты
- Row Level Security на уровне базы данных
- Автоматическое применение политик безопасности

### 2. **Модульная структура**
- Четкое разделение на слои (Routes → Controllers → Services)
- Dependency Injection для сервисов
- Фабричные функции для создания роутеров

### 3. **Мультисхемная архитектура БД**
- Разделение функциональности по схемам
- Специализированные клиенты для каждой схемы
- Централизованное управление типами

### 4. **Comprehensive Security**
- Многоуровневая система безопасности
- Rate limiting с различными лимитами
- Валидация и санитизация входных данных

### 5. **Real-time capabilities**
- WebSocket сервер для реал-тайм коммуникации
- Event-driven архитектура
- Кэширование событий

### 6. **Extensive Testing**
- Полное покрытие тестами всех слоев
- Автоматизированное тестирование API
- Performance и security тестирование

## Структура файлов бэкенда

```
server/
├── src/
│   ├── api/                     # API Layer
│   │   ├── lib/
│   │   │   └── supabase.ts      # Supabase client configuration
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.middleware.ts        # JWT authentication
│   │   │   ├── auth-fixed.middleware.ts  # Fixed auth middleware
│   │   │   ├── logging.middleware.ts     # Request logging
│   │   │   ├── security.middleware.ts    # Security headers, CORS, rate limiting
│   │   │   └── supabase-auth.middleware.ts # Supabase-specific auth
│   │   └── routes/              # API route handlers
│   │       ├── admin/           # Administrative routes
│   │       │   ├── applications.routes.ts
│   │       │   ├── support.routes.ts
│   │       │   ├── tests.routes.ts
│   │       │   └── user-metadata.ts
│   │       ├── v1/              # Public API v1
│   │       │   ├── applications.ts
│   │       │   ├── cabinet.ts
│   │       │   ├── characters.ts
│   │       │   ├── departments.ts
│   │       │   ├── gallery.routes.ts
│   │       │   ├── mdt.ts
│   │       │   └── test-sessions.routes.ts
│   │       ├── auth.ts          # Authentication routes
│   │       ├── forum.ts         # Forum functionality
│   │       ├── realtime.ts      # Real-time communication
│   │       └── index.ts         # Route registration
│   ├── core/                    # Business Logic Layer
│   │   ├── controllers/         # Request handlers
│   │   │   ├── ApplicationController.ts
│   │   │   ├── CabinetController.ts
│   │   │   └── DepartmentController.ts
│   │   ├── lib/
│   │   │   └── supabase.ts      # Core Supabase utilities
│   │   ├── schemas/
│   │   │   └── test.schemas.ts  # Validation schemas
│   │   └── services/            # Business logic services
│   │       ├── ApplicationService.ts    # Application management
│   │       ├── AuthService.ts           # Authentication logic
│   │       ├── CabinetService.ts        # Cabinet functionality
│   │       ├── CharacterService.ts      # Character management
│   │       ├── DepartmentService.ts     # Department operations
│   │       ├── GalleryService.ts        # Gallery management
│   │       ├── LoggerService.ts         # Logging service
│   │       ├── MDTService.ts            # MDT system integration
│   │       ├── RealTimeService.ts       # Real-time events
│   │       ├── ReportService.ts         # Report management
│   │       ├── TestSessionService.ts    # Test session handling
│   │       └── UserService.ts           # User management
│   ├── db/                      # Data Access Layer
│   │   ├── SupabaseStorage.ts   # File storage abstraction
│   │   └── storage.ts           # Storage utilities
│   ├── types/                   # TypeScript type definitions
│   │   ├── express.d.ts         # Express type extensions
│   │   └── services.ts          # Service interfaces
│   ├── utils/                   # Utility functions
│   │   ├── AppError.ts          # Custom error class
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── error-handler.ts     # Global error handling
│   │   └── validation.ts        # Input validation
│   ├── development.ts           # Development environment setup
│   ├── index.ts                 # Application entry point
│   ├── production.ts            # Production environment setup
│   └── websocket.ts             # WebSocket server setup
├── tests/                       # Test Suite
│   ├── api/                     # API endpoint tests
│   │   ├── applications.test.ts
│   │   ├── auth.test.ts
│   │   ├── departments.test.ts
│   │   ├── health.test.ts
│   │   ├── integration.test.ts
│   │   ├── middleware.test.ts
│   │   ├── performance.test.ts
│   │   ├── reports.test.ts
│   │   ├── security.test.ts
│   │   └── websocket.test.ts
│   ├── services/                # Service layer tests
│   │   ├── CabinetService.test.ts
│   │   ├── CharacterService.test.ts
│   │   ├── LoggerService.test.ts
│   │   ├── ReportService.test.ts
│   │   └── UserService.test.ts
│   ├── integration/             # Integration tests
│   │   ├── APIMonitoring.test.ts
│   │   └── Middleware.test.ts
│   ├── helpers/
│   │   └── app-factory.ts       # Test utilities
│   └── setup.ts                 # Test environment setup
├── types/                       # Global type definitions
│   ├── express.d.ts
│   └── normalized-character.types.ts
├── scripts/                     # Utility scripts
│   └── generate-test-report.js
├── jest.config.ts               # Jest testing configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── tsconfig.spec.json           # TypeScript test configuration
```

## API Endpoints Overview

### Public API (v1)
- **GET** `/api/v1/health` - Health check
- **POST** `/api/v1/auth/login` - User authentication
- **GET** `/api/v1/characters` - Character management
- **GET** `/api/v1/departments` - Department operations
- **POST** `/api/v1/applications` - Application submission
- **GET** `/api/v1/cabinet/profile` - User profile
- **POST** `/api/v1/test-sessions` - Test session management
- **GET** `/api/v1/gallery` - Gallery access
- **GET** `/api/v1/mdt/*` - MDT system endpoints

### Administrative API
- **GET** `/api/admin/applications` - Application management
- **POST** `/api/admin/tests` - Test administration
- **GET** `/api/admin/support` - Support ticket management
- **PUT** `/api/admin/user-metadata` - User metadata management

## Environment Configuration

```env
# Server Configuration
PORT=5000
NODE_ENV=development|production
HOST=127.0.0.1|0.0.0.0

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Security
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
CLIENT_URL=http://localhost:3000

# Features
ENABLE_WEBSOCKETS=true
ENABLE_RATE_LIMITING=true
ENABLE_LOGGING=true
```

## Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run dev:nx           # Start with Nx
npm run check            # TypeScript type checking

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
npm run test:api         # Run API tests only
npm run test:security    # Run security tests
npm run test:performance # Run performance tests

# Building
npm run build            # Build for production
npm run build:analyze    # Build with analysis
npm start                # Start production server

# Database
npm run db:reset         # Reset Supabase database
npm run db:migrate       # Apply database migrations
npm run migrate:all      # Apply all migrations

# Code Quality
npm run lint             # ESLint checks
npm run lint:fix         # Auto-fix ESLint issues
```

## Performance Monitoring

### Metrics Collection
- **Response Time** - API endpoint response times
- **Throughput** - Requests per second
- **Error Rate** - Failed request percentage
- **Memory Usage** - Server memory consumption
- **Database Performance** - Query execution times

### Monitoring Tools
- **Winston Logger** - Structured logging
- **Performance Tests** - Load testing with Jest
- **Health Checks** - Endpoint availability monitoring
- **Error Tracking** - Custom error reporting

## Security Implementation

### Multi-layered Security
1. **Network Level** - Firewall, Load Balancer
2. **Application Level** - CORS, Rate Limiting, Input Validation
3. **Authentication** - JWT tokens, Supabase Auth
4. **Authorization** - Row Level Security (RLS)
5. **Data Level** - Input sanitization, SQL injection prevention

### Security Headers
```javascript
// Implemented via Helmet middleware
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}
```

Эта архитектура обеспечивает масштабируемость, безопасность и поддерживаемость для комплексной системы управления ролевыми играми с множественными клиентскими приложениями.

---

**Последнее обновление**: 2024-08-23  
**Версия документа**: 2.0.0 (добавлена архитектура бэкенда)  
**Контакт**: Qoder AI Assistant