# RolePlay Identity System

Система управления идентичностью для ролевых игр с поддержкой персонажей, профилей и MDT.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL (через Supabase)

### Установка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd roleplay-identity
   ```

2. **Установите зависимости:**
   ```bash
   # Установка корневых зависимостей
   npm install --legacy-peer-deps
   
   # Установка зависимостей для всех workspace
   npm run install:workspaces
   ```

3. **Настройте переменные окружения:**
   ```bash
   # Скопируйте примеры конфигурации
   cp apps/server/.env.example apps/server/.env
   cp apps/client/.env.example apps/client/.env
   cp apps/mdtclient/.env.example apps/mdtclient/.env
   
   # Отредактируйте файлы .env с вашими настройками
   ```

4. **Запустите базу данных:**
   ```bash
   # Если используете Supabase локально
   npx supabase start
   
   # Или настройте подключение к удаленной базе данных
   ```

5. **Запустите приложения:**
   ```bash
   # Запуск всех приложений одновременно
   npm run dev:all
   
   # Или запуск по отдельности:
   npm run dev:server    # Сервер API
   npm run dev:client    # Клиентское приложение
   npm run dev:mdt       # MDT приложение
   ```

## 🏗️ Архитектура проекта

```
roleplay-identity/
├── apps/
│   ├── client/          # React клиентское приложение
│   ├── mdtclient/       # MDT клиентское приложение
│   └── server/          # Express.js сервер API
├── libs/
│   ├── shared-types/    # Общие TypeScript типы
│   ├── shared-utils/    # Общие утилиты
│   └── ui-components/   # React компоненты
├── packages/
│   └── db-types/        # Типы базы данных (автогенерированные)
└── supabase/            # Конфигурация Supabase
```

## 🔧 Разработка

### Workspace зависимости

Проект использует npm workspaces для управления зависимостями между пакетами. Если возникают проблемы с установкой:

```bash
# Очистка кэша npm
npm cache clean --force

# Удаление node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf libs/*/node_modules
rm -rf packages/*/node_modules

# Переустановка с legacy peer deps
npm install --legacy-peer-deps
npm run install:workspaces
```

### Сборка

```bash
# Сборка всех приложений
npm run build

# Сборка отдельных приложений
npm run build:server
npm run build:client
npm run build:mdt
```

### Тестирование

```bash
# Запуск всех тестов
npm run test

# Тестирование отдельных приложений
npm run test:server
npm run test:client
npm run test:mdt
```

### Линтинг

```bash
# Проверка кода во всех приложениях
npm run lint

# Исправление ошибок линтера
npm run lint:fix
```

## 🗄️ База данных

### Синхронизация типов

После изменения схемы базы данных обновите TypeScript типы:

```bash
npm run db:sync
```

### Миграции

```bash
# Применение миграций
npm run db:migrate

# Сброс базы данных (только для разработки)
npm run db:reset
```

## 🚨 Решение проблем

### Ошибка "Unsupported URL Type workspace:"

Эта ошибка возникает при использовании workspace зависимостей в npm. Решение:

1. **Используйте --legacy-peer-deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Или переключитесь на yarn:**
   ```bash
   npm install -g yarn
   yarn install
   ```

3. **Или используйте pnpm:**
   ```bash
   npm install -g pnpm
   pnpm install
   ```

### Проблемы с TypeScript

Если возникают ошибки TypeScript:

```bash
# Проверка типов
npm run check

# Пересборка типов базы данных
npm run db:sync
```

### Проблемы с зависимостями

```bash
# Очистка и переустановка
npm run clean
npm install --legacy-peer-deps
npm run install:workspaces
```

## 📚 Документация

- [API документация](./docs/api.md)
- [Схема базы данных](./docs/database.md)
- [Архитектура](./docs/architecture.md)
- [Руководство по развертыванию](./docs/deployment.md)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Отправьте pull request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для подробностей.