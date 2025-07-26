# RolePlay Identity - Nx Монорепозиторий

Современный монорепозиторий для системы RolePlay Identity, построенный на Nx для максимальной производительности и масштабируемости.

## 🏗️ Структура проекта

```
roleplay-identity/
├── apps/
│   ├── client/                 # Личный кабинет сообщества (React + Vite)
│   ├── mdtclient/             # MDT/CAD система (React + Vite)
│   ├── server/                # Бэкенд API (Express + TypeScript)
│   └── docs/                  # Документация (в будущем)
├── libs/
│   └── shared/
│       ├── src/               # Общие утилиты и типы
│       └── schema/
│           └── src/           # Схемы валидации и типы БД
├── nx.json                    # Конфигурация Nx
├── package.json               # Корневой package.json
└── tsconfig.base.json         # Базовый TypeScript конфиг
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- Nx CLI (устанавливается автоматически)

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd roleplay-identity

# Установка зависимостей
npm install

# Инициализация Nx
npx nx reset
```

### Разработка

```bash
# Запуск всех сервисов одновременно
npm run dev:all

# Запуск отдельных сервисов
npm run dev:server      # Бэкенд (порт 5000)
npm run dev:client      # Личный кабинет (порт 3000)
npm run dev:mdt         # MDT/CAD система (порт 3001)

# Запуск только клиента и сервера
npm run dev
```

### Сборка

```bash
# Сборка всех проектов
npm run build

# Сборка отдельных проектов
npm run build:server
npm run build:client
npm run build:mdt

# Сборка только измененных проектов
npm run affected:build
```

### Тестирование

```bash
# Тестирование всех проектов
npm run test

# Тестирование отдельных проектов
npm run test:server
npm run test:client
npm run test:mdt

# Тестирование только измененных проектов
npm run affected:test
```

## 📦 Приложения (Apps)

### @roleplay-identity/client
**Личный кабинет сообщества**
- React 18 + TypeScript
- Vite для сборки
- Radix UI компоненты
- Tailwind CSS
- React Hook Form + Zod валидация
- i18next интернационализация

**Порт**: 3000
**URL**: http://localhost:3000

### @roleplay-identity/mdtclient
**MDT/CAD система**
- React 19 + TypeScript
- Vite для сборки
- Google Gemini AI интеграция
- Lucide React иконки
- Специализированный интерфейс для правоохранительных органов

**Порт**: 3001
**URL**: http://localhost:3001

### @roleplay-identity/server
**Бэкенд API**
- Express.js + TypeScript
- Supabase интеграция
- Drizzle ORM
- JWT аутентификация
- WebSocket поддержка
- Полная интеграция с SnailyCAD v4

**Порт**: 5000
**URL**: http://localhost:5000

## 📚 Библиотеки (Libraries)

### @roleplay-identity/shared
**Общие утилиты и типы**
- TypeScript типы
- Общие утилиты
- Константы
- Хелперы

### @roleplay-identity/schema
**Схемы валидации и типы БД**
- Zod схемы валидации
- Drizzle схемы БД
- TypeScript типы для БД
- Миграции

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# Google Gemini AI (для MDT)
GEMINI_API_KEY=your_gemini_api_key

# Порт сервера
PORT=5000

# Порт клиента
VITE_PORT=3000

# Порт MDT
VITE_MDT_PORT=3001
```

### База данных

```bash
# Применение миграций
npm run db:migrate

# Сброс базы данных
npm run db:reset

# Применение CAD миграций
npm run cad:migrate

# Применение всех миграций
npm run migrate:all
```

## 🛠️ Nx Команды

### Основные команды

```bash
# Разработка
npm run dev              # Клиент + Сервер
npm run dev:all          # Все сервисы
npm run dev:server       # Только сервер
npm run dev:client       # Только клиент
npm run dev:mdt          # Только MDT

# Сборка
npm run build            # Все проекты
npm run build:server     # Сервер
npm run build:client     # Клиент
npm run build:mdt        # MDT

# Тестирование
npm run test             # Все тесты
npm run test:server      # Тесты сервера
npm run test:client      # Тесты клиента
npm run test:mdt         # Тесты MDT

# Проверка кода
npm run check            # TypeScript проверка
npm run lint             # ESLint проверка
npm run lint:fix         # Автоисправление ESLint

# Анализ зависимостей
npm run graph            # Граф зависимостей
```

### Affected команды (только измененные проекты)

```bash
# Сборка только измененных проектов
npm run affected:build

# Тестирование только измененных проектов
npm run affected:test

# Линтинг только измененных проектов
npm run affected:lint
```

### База данных

```bash
# Миграции
npm run db:push          # Push схемы в Supabase
npm run db:reset         # Сброс базы данных
npm run db:migrate       # Применение миграций

# CAD интеграция
npm run cad:migrate      # CAD миграции
npm run cad:migrate:seed # CAD миграции с данными

# Форум
npm run forum:migrate    # Миграции форума
npm run forum:setup      # Настройка форума

# Отчеты
npm run migrate:reports  # Миграции отчетов
```

### Тестирование

```bash
# Пользователи
npm run test:users:create    # Создание тестовых пользователей
npm run test:users:cleanup   # Очистка тестовых пользователей

# База данных
npm run test:db              # Тест подключения к БД
npm run test:rls             # Тест RLS политик

# Схемы
npm run dev:schema:check     # Проверка dev схемы
npm run dev:schema:fix       # Исправление dev схемы
```

### Деплой

```bash
# VPS деплой
npm run deploy:vps          # Деплой на VPS
npm run setup:vps           # Настройка VPS
```

## 🔗 API Интеграция

### SnailyCAD v4

Проект полностью интегрирован с SnailyCAD v4 и поддерживает все новые поля:

- **Персонажи**: 18 новых полей (демографические, контактные, профессиональные, статусные, офицерские)
- **Пользователи**: 4 новых поля (2FA, темная тема, настройки звука, API токены)
- **API эндпоинты**: 23 эндпоинта для полной совместимости

Подробная документация: [API_SNAILYCAD_INTEGRATION.md](docs/API_SNAILYCAD_INTEGRATION.md)

### WebSocket

Поддержка real-time обновлений для:
- Статус юнитов
- Новые вызовы
- Паника кнопки
- BOLO уведомления
- Обновления инцидентов

## 🚀 Преимущества Nx

### Производительность
- **Кэширование**: Все операции кэшируются для ускорения повторных запусков
- **Параллельное выполнение**: Задачи выполняются параллельно где возможно
- **Incremental builds**: Сборка только измененных частей

### Масштабируемость
- **Affected commands**: Работа только с измененными проектами
- **Project graph**: Визуализация зависимостей между проектами
- **Distributed caching**: Возможность кэширования в CI/CD

### Разработка
- **Code generation**: Автоматическая генерация кода
- **Consistent tooling**: Единые инструменты для всех проектов
- **Type safety**: Полная типизация между проектами

## 📚 Документация

- [API интеграция с SnailyCAD](docs/API_SNAILYCAD_INTEGRATION.md)
- [Отчет по бэкенд интеграции](docs/BACKEND_SNAILYCAD_INTEGRATION_REPORT.md)
- [Система отчетов](README_REPORTS_SYSTEM.md)
- [Улучшения департаментов](DEPARTMENT_SYSTEM_IMPROVEMENTS.md)
- [Руководство по деплою на VPS](VPS_DEPLOYMENT_GUIDE.md)

## 🤝 Разработка

### Структура кода

- **TypeScript** для всех проектов
- **ESLint** для линтинга
- **Jest** для тестирования
- **Prettier** для форматирования (рекомендуется)

### Коммиты

Используйте conventional commits:

```
feat(client): добавить новую форму заявки
fix(server): исправить валидацию email
docs: обновить README
refactor(shared): вынести общие типы
```

### Pull Requests

1. Создайте ветку от `main`
2. Внесите изменения
3. Запустите тесты: `npm run test`
4. Проверьте линтер: `npm run lint`
5. Создайте Pull Request

## 🚀 Деплой

### Production

```bash
# Сборка для production
npm run build:production

# Запуск production сервера
npm run start
```

### VPS

```bash
# Настройка VPS
npm run setup:vps

# Деплой на VPS
npm run deploy:vps
```

## 📄 Лицензия

MIT License

## 🆘 Поддержка

Для вопросов и поддержки:
- Создайте Issue в GitHub
- Обратитесь к документации в папке `docs/`
- Проверьте логи сервера для диагностики проблем
- Используйте `npm run graph` для анализа зависимостей 