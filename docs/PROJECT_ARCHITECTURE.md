# PROJECT_ARCHITECTURE.md

## Обзор Проекта (High-Level Overview)

### Цель проекта
**RolePlayIdentity** — это комплексная платформа для RolePlay серверов, предоставляющая полнофункциональную MDT/CAD систему и управление персонажами. Проект решает задачу создания единой экосистемы для управления персонажами, вызовами экстренных служб, отчетностью и административными функциями в рамках игрового RolePlay сообщества.

### Технологический стек

#### Frontend
- **React 18/19** — основная библиотека для построения пользовательских интерфейсов
- **TypeScript** — строгая типизация для повышения надежности кода
- **Vite** — быстрый сборщик и dev-сервер
- **Tailwind CSS** — utility-first CSS фреймворк для стилизации
- **Radix UI** — доступные и настраиваемые UI компоненты
- **React Query (TanStack Query)** — управление серверным состоянием и кэшированием
- **Wouter** — легковесный роутер для React
- **Zustand** — управление глобальным состоянием (в MDT клиенте)
- **Framer Motion** — анимации и переходы
- **React Hook Form** — управление формами с валидацией
- **Zod** — схема валидации данных

#### Backend
- **Node.js** — серверная среда выполнения
- **Express.js** — веб-фреймворк для создания API
- **TypeScript** — строгая типизация серверного кода
- **Supabase** — Backend-as-a-Service (аутентификация, база данных, storage)
- **PostgreSQL** — основная реляционная база данных
- **Socket.io** — real-time коммуникация
- **Winston** — логирование
- **Multer** — обработка файлов
- **Helmet** — безопасность HTTP заголовков
- **CORS** — настройка Cross-Origin Resource Sharing

#### Database
- **PostgreSQL 17** — основная реляционная база данных
- **Supabase** — управляемая PostgreSQL с дополнительными сервисами
- **Row Level Security (RLS)** — безопасность на уровне строк
- **Stored Procedures** — бизнес-логика в базе данных
- **UUID** — глобально уникальные идентификаторы

#### Инструменты разработки
- **Nx** — монорепозиторий и система сборки
- **ESLint** — статический анализ кода
- **Prettier** — форматирование кода
- **Jest** — тестирование
- **Playwright** — end-to-end тестирование
- **Docker** — контейнеризация
- **GitHub Actions** — CI/CD

### Архитектурный паттерн
Проект использует **монорепозиторий (Nx)** с четким разделением на приложения и библиотеки:

- **Монорепозиторий**: Единая кодовая база для всех компонентов системы
- **Feature-Sliced Design (FSD)**: Архитектурная методология на фронтенде
- **Сервисная архитектура**: Разделение бизнес-логики на сервисы
- **API-first подход**: Четкое разделение между клиентом и сервером
- **Микросервисная архитектура на уровне сервисов**: Каждый сервис отвечает за свою доменную область

---

## Архитектура Базы Данных (PostgreSQL/Supabase)

### Обзор схем

Проект использует **множественные схемы** для логического разделения данных:

#### `public` схема
- **Назначение**: Публичные данные, доступные всем аутентифицированным пользователям
- **Содержит**: Профили пользователей, уведомления, составные типы данных
- **RLS**: Включена для безопасности

#### `common` схема  
- **Назначение**: Общие данные, используемые всеми модулями системы
- **Содержит**: Персонажи, транспортные средства, оружие, компании, департаменты
- **Особенности**: Центральная схема для основных сущностей

#### `mdt` схема
- **Назначение**: Данные, специфичные для MDT (Mobile Data Terminal) системы
- **Содержит**: Вызовы 911, BOLO, активные юниты, отчеты, заявки
- **Особенности**: Оперативные данные для диспетчеров и сотрудников

### Ключевые таблицы

#### Схема `common`
1. **`characters`** — основная таблица персонажей
   - Хранит базовую информацию о персонажах (имя, дата рождения, адрес)
   - Связана с `profiles` через `owner_id`
   - Поддерживает флаги и медицинскую информацию

2. **`vehicles`** — регистрация транспортных средств
   - VIN, номерные знаки, модель, цвет
   - Связана с `characters` через `owner_id`
   - Отслеживание регистрации и страховки

3. **`weapons`** — регистрация оружия
   - Серийные номера, модель, калибр
   - Статус регистрации и владения
   - Связана с `characters` через `owner_id`

4. **`departments`** — департаменты и службы
   - LSPD, BCSO, SAHP, LSFD, SAMS
   - Логотипы, описания, галереи

5. **`leo_profiles`** — профили сотрудников правоохранительных органов
   - Номер значка, позывной, звание, департамент
   - Связана с `characters` через `id` (1:1)

#### Схема `mdt`
1. **`calls`** — вызовы 911
   - Информация о звонящих, местоположение, приоритет
   - Статус обработки и назначенные юниты
   - Временные метки и координаты

2. **`units_on_duty`** — активные юниты
   - Номер юнита, статус, местоположение
   - Связана с `characters` через `character_id`
   - Real-time обновления статуса

3. **`bolos`** — Be On Look Out (розыск)
   - Описание разыскиваемых лиц/транспорта
   - Приоритет, статус, срок действия
   - Автор и временные метки

4. **`applications`** — заявки на работу
   - Заявки в различные департаменты
   - Статус рассмотрения и комментарии
   - Связана с `characters` через `applicant_id`

### Связи между таблицами

#### Ключевые Foreign Key связи:
- **`characters.owner_id` → `profiles.id`** — владелец персонажа
- **`leo_profiles.id` → `characters.id`** — профиль сотрудника LEO
- **`ems_profiles.id` → `characters.id`** — профиль сотрудника EMS
- **`units_on_duty.character_id` → `characters.id`** — активный юнит
- **`vehicles.owner_id` → `characters.id`** — владелец транспорта
- **`weapons.owner_id` → `characters.id`** — владелец оружия
- **`divisions.department_id` → `departments.id`** — подразделения департамента

### Использование UUID

**Все первичные ключи используют UUID** для обеспечения:
- **Глобальной уникальности**: Нет конфликтов при слиянии данных
- **Безопасности**: Сложно угадать ID других записей
- **Масштабируемости**: Поддержка распределенных систем
- **Консистентности**: Единый формат идентификаторов во всей системе

---

## Архитектура Бэкенда (Node.js/Express)

### Структура директорий

```
apps/server/
├── routes/           # API маршруты
│   ├── v1/          # Современная архитектура API v1
│   ├── admin/       # Административные маршруты
│   └── ...          # Специализированные маршруты
├── services/        # Бизнес-логика (сервисный слой)
├── middleware/      # Express middleware
├── lib/            # Библиотеки и утилиты
├── utils/          # Вспомогательные функции
├── types/          # TypeScript типы
└── tests/          # Тесты
```

### "Золотые Правила" Бэкенда

#### 1. Правило UUID (ID всегда string)
```typescript
// ✅ Правильно
interface Character {
  id: string; // UUID
  ownerId: string; // UUID
}

// ❌ Неправильно
interface Character {
  id: number;
  ownerId: number;
}
```

#### 2. Правило Сервисного слоя (вся логика в services)
```typescript
// ✅ Правильно - роут только валидирует и вызывает сервис
router.post('/characters', authenticateToken, async (req, res) => {
  const characterData = createCharacterSchema.parse(req.body);
  const character = await characterService.createCharacter(characterData);
  res.json(character);
});

// ❌ Неправильно - бизнес-логика в роуте
router.post('/characters', async (req, res) => {
  // Бизнес-логика здесь...
});
```

#### 3. Правило Единого источника типов (packages/db-types)
```typescript
// ✅ Правильно - импорт из центрального пакета
import type { Characters, CharactersInsert } from '../../../packages/db-types/src/index';

// ❌ Неправильно - дублирование типов
interface Character {
  // Локальное определение...
}
```

#### 4. Правило Архитектуры API v1 (роуты в v1, валидация Zod, авторизация requireRole)
```typescript
// ✅ Правильно - современная архитектура
router.post('/characters', 
  authenticateToken,           // Аутентификация
  requireRole('admin'),        // Авторизация
  validateSchema(createSchema), // Валидация Zod
  async (req, res) => {
    const result = await service.create(req.body);
    res.json(result);
  }
);
```

### Жизненный цикл запроса (Request Lifecycle)

1. **Запрос приходит на сервер** → Express получает HTTP запрос
2. **CORS middleware** → Проверка и настройка CORS заголовков
3. **Body parsing** → Парсинг JSON/URL-encoded данных
4. **Аутентификация** → `authenticateToken` проверяет JWT токен
5. **Авторизация** → `requireRole` проверяет права доступа
6. **Валидация** → Zod схема валидирует входные данные
7. **Сервисный слой** → Вызов соответствующего сервиса
8. **База данных** → Сервис обращается к Supabase/PostgreSQL
9. **Обработка результата** → Форматирование ответа
10. **Отправка ответа** → JSON ответ клиенту

### Аутентификация и Авторизация

#### Система аутентификации
- **JWT токены от Supabase**: Основной механизм аутентификации
- **Middleware `authenticateToken`**: Проверяет валидность токена
- **Middleware `requireRole`**: Проверяет роль пользователя из `app_metadata`
- **Поддержка множественных ролей**: admin, leo, ems, fd, dispatch, citizen

#### Процесс аутентификации
```typescript
// 1. Получение токена из заголовка
const token = req.headers.authorization?.split(' ')[1];

// 2. Верификация через Supabase
const { data: { user }, error } = await supabase.auth.getUser(token);

// 3. Получение профиля пользователя
const profile = await getUserProfile(user.id);

// 4. Проверка роли
if (!profile.role || !requiredRoles.includes(profile.role)) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

---

## Архитектура Фронтенда (React/FSD)

### Структура директорий согласно Feature-Sliced Design

```
src/
├── app/           # Инициализация приложения
├── pages/         # Страницы приложения
├── widgets/       # Композитные блоки
├── features/      # Функциональные модули
├── entities/      # Бизнес-сущности
└── shared/        # Переиспользуемый код
    ├── api/       # API клиенты
    ├── config/    # Конфигурация
    ├── contexts/  # React контексты
    ├── lib/       # Утилиты
    ├── types/     # TypeScript типы
    └── ui/        # UI компоненты
```

### Управление состоянием

#### React Query (TanStack Query)
```typescript
// Управление серверным состоянием
const { data: characters, isLoading } = useQuery({
  queryKey: ['characters', userId],
  queryFn: () => characterApi.getCharacters(userId),
  staleTime: 5 * 60 * 1000, // 5 минут
  retry: 1
});

// Мутации для изменения данных
const createCharacter = useMutation({
  mutationFn: characterApi.createCharacter,
  onSuccess: () => {
    queryClient.invalidateQueries(['characters']);
  }
});
```

#### Zustand (в MDT клиенте)
```typescript
// Глобальное состояние приложения
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  setUser: (user: User) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  theme: 'dark',
  language: 'en',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme })
}));
```

### Взаимодействие с API

#### API клиенты
```typescript
// Централизованный API клиент
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### React Query интеграция
```typescript
// Хуки для работы с API
export const useCharacters = (userId: string) => {
  return useQuery({
    queryKey: ['characters', userId],
    queryFn: () => characterApi.getCharacters(userId),
    enabled: !!userId
  });
};

export const useCreateCharacter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: characterApi.createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries(['characters']);
    }
  });
};
```

### Типизация

#### Использование типов из бэкенда
```typescript
// Импорт типов из центрального пакета
import type { 
  Characters, 
  CharactersInsert, 
  CharactersUpdate 
} from '../../../packages/db-types/src/index';

// Адаптация типов для фронтенда
interface Character {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  // ... остальные поля
}

// Типизированные API методы
const characterApi = {
  getCharacter: (id: string): Promise<Character> => { /* ... */ },
  createCharacter: (data: CreateCharacterData): Promise<Character> => { /* ... */ },
  updateCharacter: (id: string, data: UpdateCharacterData): Promise<Character> => { /* ... */ }
};
```

---

## Процесс разработки и CI/CD

### Начало работы

#### Установка зависимостей
```bash
# Установка всех зависимостей
npm install

# Или с использованием pnpm
pnpm install
```

#### Запуск в режиме разработки
```bash
# Запуск всех приложений одновременно
npm run dev

# Или отдельно
npm run dev:client    # Клиент на порту 3000
npm run dev:mdt       # MDT клиент на порту 3001  
npm run dev:server    # Сервер на порту 5000
```

#### Сборка для продакшена
```bash
# Сборка всех приложений
npm run build

# Сборка отдельных приложений
npm run build:client
npm run build:mdt
npm run build:server
```

### Линтинг и форматирование

#### ESLint
```bash
# Проверка всех приложений
npm run lint

# Исправление ошибок
npm run lint:fix
```

#### Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Проверка типов

```bash
# Проверка типов TypeScript
npm run check

# Или для отдельных приложений
npm run check:client
npm run check:mdt
npm run check:server
```

### Тестирование

```bash
# Запуск всех тестов
npm run test

# Тесты с покрытием
npm run test:coverage

# Тесты в режиме watch
npm run test:watch

# Специализированные тесты
npm run test:api        # API тесты
npm run test:security   # Тесты безопасности
npm run test:performance # Тесты производительности
```

### Деплой

#### Локальная разработка
```bash
# Запуск Supabase локально
npx supabase start

# Применение миграций
npx supabase db push

# Сброс базы данных
npx supabase db reset
```

#### Продакшен деплой
```bash
# Сборка для продакшена
npm run build:production

# Деплой на VPS
npm run deploy:vps

# Настройка VPS
npm run setup:vps
```

---

## Дополнительные компоненты

### FiveM интеграция
- **MDT клиент**: Специальная сборка для FiveM (`npm run build:fivem`)
- **NUI интерфейс**: Встроенный интерфейс в игру
- **WebSocket соединения**: Real-time обновления статуса юнитов
- **API интеграция**: Специальные эндпоинты для FiveM

### Real-time функциональность
- **Socket.io**: Real-time обновления для диспетчеров
- **Supabase Realtime**: Подписки на изменения в базе данных
- **WebSocket сервер**: Специализированный сервер для FiveM

### Система уведомлений
- **In-app уведомления**: Toast уведомления в интерфейсе
- **Push уведомления**: Уведомления через браузер
- **Email уведомления**: Уведомления по email (через Supabase)

### Система отчетов
- **Генерация PDF**: Создание отчетов в формате PDF
- **Шаблоны отчетов**: Настраиваемые шаблоны для разных типов отчетов
- **Экспорт данных**: Экспорт в различные форматы (CSV, JSON)

---

## Заключение

Проект **RolePlayIdentity** представляет собой современную, масштабируемую архитектуру, построенную на принципах:

- **Модульности**: Четкое разделение ответственности между компонентами
- **Типобезопасности**: Сквозная типизация от базы данных до UI
- **Безопасности**: Многоуровневая система аутентификации и авторизации
- **Производительности**: Оптимизированная архитектура с кэшированием
- **Масштабируемости**: Монорепозиторий с возможностью независимого развития компонентов

Архитектура обеспечивает гибкость для дальнейшего развития и легкость поддержки кодовой базы, что делает проект готовым к использованию в продакшене и дальнейшему масштабированию. 