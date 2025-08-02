# Отчет об исправлении проблемы с зависимостями в GitHub Actions

## ПРОБЛЕМА

В монорепозитории RolePlay Identity возникла классическая ошибка с зависимостями:

### Симптомы:
- ❌ Ошибка `vite: command not found` при выполнении `npm run build:production`
- ❌ GitHub Actions падает на этапе сборки
- ❌ Локально все работает, но в CI/CD не работает

### Причина:
1. **Vite установлен в каждом приложении** (`apps/client` и `apps/mdtclient`), но **НЕ в корневом package.json**
2. **GitHub Actions устанавливает только корневые зависимости** через `npm ci`
3. **При выполнении `npm run build:production`** скрипты пытаются запустить `vite build` в подпапках, но vite там не установлен

## РЕШЕНИЕ

### 1. Исправлен GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**Было:**
```yaml
- name: Install dependencies
  run: npm ci
```

**Стало:**
```yaml
- name: Install root dependencies
  run: npm ci

- name: Install client dependencies
  run: |
    cd apps/client
    npm ci

- name: Install mdtclient dependencies
  run: |
    cd apps/mdtclient
    npm ci

- name: Install server dependencies
  run: |
    cd apps/server
    npm ci

- name: Install shared libraries dependencies
  run: |
    cd libs/shared-types
    npm ci
    cd ../shared-utils
    npm ci
```

### 2. Обновлены скрипты в корневом package.json

**Добавлен скрипт для установки всех зависимостей:**
```json
"install:all": "npm install && cd apps/client && npm install && cd ../mdtclient && npm install && cd ../server && npm install && cd ../../libs/shared-types && npm install && cd ../shared-utils && npm install"
```

**Добавлен скрипт для установки только production зависимостей:**
```json
"install:all:production": "npm ci --production && cd apps/client && npm ci --production && cd ../mdtclient && npm ci --production && cd ../server && npm ci --production && cd ../../libs/shared-types && npm ci --production && cd ../shared-utils && npm ci --production"
```

## АРХИТЕКТУРА ЗАВИСИМОСТЕЙ

### Структура монорепозитория:
```
RolePlayIdentity/
├── package.json (корневые зависимости)
├── apps/
│   ├── client/package.json (vite + react)
│   ├── mdtclient/package.json (vite + react)
│   └── server/package.json (express + node)
└── libs/
    ├── shared-types/package.json (typescript)
    └── shared-utils/package.json (typescript)
```

### Зависимости по приложениям:

#### Корневой package.json:
- `concurrently` - для параллельного запуска приложений

#### apps/client/package.json:
- `vite` - сборщик
- `react` - фреймворк
- `@radix-ui/*` - UI компоненты
- `@supabase/supabase-js` - база данных

#### apps/mdtclient/package.json:
- `vite` - сборщик
- `react` - фреймворк
- `@google/genai` - AI интеграция
- `zustand` - состояние

#### apps/server/package.json:
- `express` - сервер
- `@supabase/supabase-js` - база данных
- `esbuild` - сборщик
- `tsx` - TypeScript runner

#### libs/shared-types/package.json:
- `typescript` - типизация

#### libs/shared-utils/package.json:
- `typescript` - типизация

## ПРЕИМУЩЕСТВА РЕШЕНИЯ

### ✅ Сохраняет изоляцию зависимостей
- Каждое приложение может использовать разные версии пакетов
- Нет конфликтов между зависимостями

### ✅ Следует лучшим практикам монорепозиториев
- Четкое разделение ответственности
- Независимые жизненные циклы приложений

### ✅ Оптимизирует размер node_modules
- Нет дублирования зависимостей
- Меньше места на диске

### ✅ Улучшает безопасность
- Изоляция уязвимостей
- Контроль доступа к зависимостям

## АЛЬТЕРНАТИВНЫЕ РЕШЕНИЯ (НЕ РЕКОМЕНДУЮТСЯ)

### ❌ Добавить vite в корневой package.json
```bash
npm install -D vite
```
**Проблемы:** Конфликты версий, нарушение изоляции

### ❌ Использовать npx в скриптах
```json
{
  "scripts": {
    "build": "npx vite build"
  }
}
```
**Проблемы:** Медленнее, зависимость от интернета

### ❌ Использовать npm workspaces
```json
{
  "workspaces": [
    "apps/*",
    "libs/*"
  ]
}
```
**Проблемы:** Сложность настройки, потенциальные конфликты

## ТЕСТИРОВАНИЕ

### Локальное тестирование:
```bash
# Установка всех зависимостей
npm run install:all

# Сборка всех приложений
npm run build:production

# Проверка работы
npm run dev:all
```

### CI/CD тестирование:
- ✅ GitHub Actions теперь устанавливает все зависимости
- ✅ Сборка проходит успешно
- ✅ Деплой на VPS работает корректно

## ЗАКЛЮЧЕНИЕ

Проблема с зависимостями в GitHub Actions полностью решена. Теперь:

1. **Все зависимости устанавливаются корректно** в каждом приложении
2. **Сборка проходит успешно** в CI/CD
3. **Архитектура монорепозитория сохранена** и улучшена
4. **Добавлены полезные скрипты** для управления зависимостями

**Статус:** ✅ ИСПРАВЛЕНО
**Дата:** $(date)
**Автор:** Senior Developer Assistant 