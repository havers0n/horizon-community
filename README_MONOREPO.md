# RolePlay Identity - Монорепозиторий

Этот проект представляет собой монорепозиторий для системы RolePlay Identity, построенный с использованием Nx.

## Структура проекта

```
├── apps/
│   ├── client/          # Личный кабинет (React + Vite)
│   ├── mdtclient/       # MDT клиент для FiveM (React + Vite)
│   └── server/          # Общий бэкенд (Node.js + Express)
├── libs/
│   ├── shared-types/    # Общие типы TypeScript
│   └── shared-utils/    # Общие утилиты
├── shared/              # Общие ресурсы
├── docs/                # Документация
└── scripts/             # Скрипты для деплоя и миграций
```

## Приложения

### 1. Client (Личный кабинет)
- **Технологии**: React, Vite, TypeScript, Tailwind CSS
- **Назначение**: Веб-интерфейс для граждан и сотрудников правоохранительных органов
- **Порт**: 3000 (dev)

### 2. MDT Client (MDT для FiveM)
- **Технологии**: React, Vite, TypeScript
- **Назначение**: Мобильный терминал данных для использования в FiveM
- **Порт**: 3001 (dev)

### 3. Server (Бэкенд)
- **Технологии**: Node.js, Express, TypeScript, Supabase
- **Назначение**: API сервер для всех приложений
- **Порт**: 3002 (dev)

## Библиотеки

### Shared Types
Общие типы TypeScript, используемые во всех приложениях:
- Пользователи и роли
- Граждане и транспортные средства
- Инциденты и отчеты
- API ответы и WebSocket сообщения

### Shared Utils
Общие утилиты для всех приложений:
- Форматирование дат и времени
- Валидация данных
- Утилиты для работы с массивами и объектами
- API утилиты
- WebSocket утилиты
- Система ролей и разрешений

## Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Разработка

#### Запуск всех приложений
```bash
npm run dev:all
```

#### Запуск отдельных приложений
```bash
# Личный кабинет
npm run dev:client

# MDT клиент
npm run dev:mdt

# Сервер
npm run dev:server
```

### Сборка

#### Сборка всех приложений
```bash
npm run build
```

#### Сборка отдельных приложений
```bash
npm run build:client
npm run build:mdt
npm run build:server
```

### Тестирование
```bash
# Все тесты
npm run test

# Отдельные приложения
npm run test:client
npm run test:mdt
npm run test:server
```

### Линтинг
```bash
# Проверка всех приложений
npm run lint

# Исправление ошибок
npm run lint:fix
```

## База данных

### Миграции
```bash
# Применить все миграции
npm run migrate:all

# Миграция форума
npm run migrate:forum

# Миграция CAD
npm run migrate:cad

# Миграция отчетов
npm run migrate:reports
```

### Тестирование базы данных
```bash
# Проверка подключения
npm run check:db

# Тестирование подключения
npm run test:db
```

## Деплой

### VPS деплой
```bash
# Настройка VPS
npm run setup:vps

# Деплой на VPS
npm run deploy:vps
```

## Nx команды

### Граф зависимостей
```bash
npm run graph
```

### Анализ изменений
```bash
# Сборка измененных проектов
npm run affected:build

# Тестирование измененных проектов
npm run affected:test

# Линтинг измененных проектов
npm run affected:lint
```

## Структура зависимостей

```
client ──┐
         ├── shared-types
         └── shared-utils

mdtclient ──┐
            ├── shared-types
            └── shared-utils

server ──┐
         ├── shared-types
         └── shared-utils
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=3002
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:3002
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Разработка

### Добавление новых библиотек
```bash
# Создание новой библиотеки
npx nx g @nx/js:library my-library --directory=libs

# Создание React библиотеки
npx nx g @nx/react:library my-react-library --directory=libs
```

### Добавление новых приложений
```bash
# Создание React приложения
npx nx g @nx/react:app my-app --directory=apps

# Создание Express приложения
npx nx g @nx/express:app my-api --directory=apps
```

## Мониторинг и логирование

### Логи
- Все логи приложений сохраняются в `logs/`
- Ротация логов настроена автоматически
- Уровни логирования: error, warn, info, debug

### Мониторинг
- Health check endpoints для каждого приложения
- Метрики производительности
- Мониторинг базы данных

## Безопасность

- JWT аутентификация
- Rate limiting
- CORS настройки
- Валидация входных данных
- SQL injection защита
- XSS защита

## Производительность

- Кэширование на уровне приложений
- Оптимизация запросов к базе данных
- Lazy loading компонентов
- Tree shaking для уменьшения размера бандлов
- CDN для статических ресурсов

## Поддержка

Для получения поддержки:
1. Проверьте документацию в папке `docs/`
2. Создайте issue в репозитории
3. Обратитесь к команде разработки 