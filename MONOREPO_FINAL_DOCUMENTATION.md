# RolePlayIdentity - Nx Monorepo Documentation

## 📋 Обзор проекта

RolePlayIdentity - это монорепозиторий для системы управления персонажами и департаментами в ролевой игре. Проект использует Nx для управления множественными приложениями и библиотеками.

## 🏗️ Архитектура

### Структура монорепозитория

```
RolePlayIdentity/
├── apps/
│   ├── client/          # Личный кабинет пользователя (React + Vite)
│   ├── mdtclient/       # MDT клиент для внутриигрового оверлея (React + Vite)
│   └── server/          # Backend API (Node.js + Express)
├── libs/
│   ├── shared-types/    # Общие типы и интерфейсы
│   ├── shared-utils/    # Общие утилиты и функции
│   └── shared-schema/   # Схемы базы данных (Drizzle ORM + Zod)
└── docs/                # Документация проекта
```

### Ключевые принципы архитектуры

1. **UI Независимость**: `client` и `mdtclient` имеют независимые UI компоненты
   - `client`: Полнофункциональный интерфейс с Radix UI, Framer Motion
   - `mdtclient`: Легкий, быстрый интерфейс с минимальными зависимостями

2. **Переиспользование логики**: Общие типы и утилиты вынесены в библиотеки
   - `shared-types`: Интерфейсы User, Character, Department, Vehicle и др.
   - `shared-utils`: Функции форматирования, работы с правами, датами
   - `shared-schema`: Схемы базы данных и валидации

3. **Разделение ответственности**:
   - `apps/*`: Представление (View)
   - `libs/*`: Бизнес-логика и модели данных (Model/Controller)

## 🚀 Приложения

### Client (Личный кабинет)
- **Технологии**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Назначение**: Полнофункциональный веб-интерфейс для управления персонажами
- **Особенности**: Богатый UI, анимации, сложные компоненты

### MDT Client (Внутриигровой оверлей)
- **Технологии**: React, TypeScript, Vite, Tailwind CSS
- **Назначение**: Легкий интерфейс для внутриигрового использования
- **Особенности**: Минимальные зависимости, быстрая загрузка, простой дизайн

### Server (Backend API)
- **Технологии**: Node.js, Express, TypeScript, Drizzle ORM
- **Назначение**: REST API для всех клиентских приложений
- **Особенности**: Валидация данных, аутентификация, работа с БД

## 📚 Библиотеки

### Shared Types
```typescript
// libs/shared-types/src/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  // ...
}

export interface Character {
  id: string;
  name: string;
  department: Department;
  // ...
}

// ... другие общие типы
```

### Shared Utils
```typescript
// libs/shared-utils/src/index.ts
export function formatDate(date: Date): string {
  // Логика форматирования дат
}

export function hasPermission(user: User, permission: string): boolean {
  // Логика проверки прав
}

// ... другие утилиты
```

### Shared Schema
```typescript
// libs/shared-schema/src/index.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  // ...
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// ... другие схемы
```

## 🛠️ Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
# Запуск всех приложений
npm run dev

# Запуск конкретного приложения
npx nx serve client
npx nx serve mdtclient
npx nx serve server
```

### Сборка
```bash
# Сборка всех приложений
npm run build:all

# Сборка конкретного приложения
npx nx build client
npx nx build mdtclient
npx nx build server
```

### Тестирование
```bash
# Тесты всех проектов
npm run test

# Тесты конкретного проекта
npx nx test client
npx nx test shared-types
```

### Линтинг
```bash
# Линтинг всех проектов
npm run lint

# Линтинг конкретного проекта
npx nx lint client
```

## 📦 Nx Команды

### Создание новых проектов
```bash
# Создание нового приложения
npx nx g @nx/react:app new-app

# Создание новой библиотеки
npx nx g @nx/js:library new-lib
```

### Анализ зависимостей
```bash
# Граф зависимостей
npx nx graph

# Анализ влияния изменений
npx nx affected:graph
```

### Очистка кэша
```bash
npx nx reset
```

## 🔧 Конфигурация

### TypeScript
- `tsconfig.base.json`: Базовая конфигурация для всех проектов
- `tsconfig.json`: Конфигурация корневого проекта
- Каждый проект имеет свой `tsconfig.json`

### ESLint
- `.eslintrc.json`: Общие правила линтинга
- Каждый проект может переопределять правила

### Prettier
- `.prettierrc`: Настройки форматирования кода
- `.prettierignore`: Исключения из форматирования

## 📊 Текущее состояние

### ✅ Завершенные задачи
- [x] Создание структуры Nx монорепозитория
- [x] Настройка базовой конфигурации
- [x] Создание библиотек shared-types, shared-utils, shared-schema
- [x] Удаление shared-ui (изменение архитектуры)
- [x] Настройка сборки и тестирования
- [x] Обновление документации

### 🔄 В процессе
- [ ] Миграция общих типов из приложений в shared-types
- [ ] Миграция общих утилит из приложений в shared-utils
- [ ] Обновление импортов во всех приложениях

### 📋 Планируемые задачи
- [ ] Добавление тестов для всех библиотек
- [ ] Создание API документации
- [ ] Оптимизация зависимостей для MDT client
- [ ] Настройка CI/CD
- [ ] Добавление Storybook для UI компонентов

## 🐛 Известные проблемы

### TS2307: Cannot find module '@roleplay-identity/shared-schema'
**Статус**: Временно решено
**Описание**: Проблема с импортом схем из shared-schema в shared-types
**Временное решение**: Закомментированы re-export блоки в shared-types
**Планируемое решение**: Настройка правильных путей импорта

## 📈 Преимущества новой архитектуры

1. **Масштабируемость**: Легко добавлять новые приложения и библиотеки
2. **Переиспользование**: Общий код вынесен в библиотеки
3. **Независимость**: UI приложений независимы друг от друга
4. **Производительность**: MDT client оптимизирован для скорости
5. **Поддерживаемость**: Четкое разделение ответственности
6. **Тестируемость**: Изолированные тесты для каждого проекта

## 🤝 Вклад в проект

### Стиль кода
- Используйте TypeScript для всех новых файлов
- Следуйте правилам ESLint и Prettier
- Добавляйте JSDoc комментарии для публичных API

### Коммиты
- Используйте conventional commits
- Примеры: `feat: add user management`, `fix: resolve import issues`

### Тестирование
- Покрывайте тестами новую функциональность
- Обновляйте тесты при изменении API

## 📞 Поддержка

При возникновении проблем:
1. Проверьте документацию в папке `docs/`
2. Изучите логи сборки и тестов
3. Создайте issue с подробным описанием проблемы

---

**Последнее обновление**: $(date)
**Версия документации**: 1.0.0 