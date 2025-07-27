# 🚀 Руководство по миграции React 18 -> React 19

## 📋 Обзор проблемы

**Критическая проблема:** В проекте используются разные версии React:
- **Корневой package.json**: React 19.1.0
- **apps/client/package.json**: React 18.3.1 ❌
- **apps/mdtclient/package.json**: React 19.1.0 ✅

## 🎯 Цель миграции

Унифицировать все приложения на React 19.1.0 для:
- ✅ Совместимости между приложениями
- ✅ Единой экосистемы зависимостей
- ✅ Упрощения поддержки
- ✅ Возможности создания общих компонентов

## 🔧 План миграции

### Этап 1: Подготовка (Выполнено ✅)

1. ✅ Обновлены зависимости в `apps/client/package.json`:
   ```json
   "react": "^19.1.0",
   "react-dom": "^19.1.0",
   "@types/react": "^19.0.0",
   "@types/react-dom": "^19.0.0"
   ```

2. ✅ Создан скрипт автоматической миграции: `scripts/migrate-react-19.js`

### Этап 2: Автоматическая миграция кода

Запустите автоматическую миграцию:

```bash
npm run migrate:react19
```

**Что делает скрипт:**
- Заменяет `React.FC` на современный синтаксис
- Обновляет типы компонентов
- Сохраняет совместимость с React 19

### Этап 3: Установка зависимостей

```bash
npm install
```

### Этап 4: Проверка и тестирование

```bash
# Проверка TypeScript
npm run check

# Сборка для проверки ошибок
npm run build:client

# Запуск тестов
npm run test
```

## 🔍 Основные изменения React 19

### 1. React.FC изменения

**Было (React 18):**
```tsx
const MyComponent: React.FC = () => {
  return <div>Hello</div>;
};

const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

**Стало (React 19):**
```tsx
const MyComponent = () => {
  return <div>Hello</div>;
};

const MyComponent = ({ prop }: Props) => {
  return <div>{prop}</div>;
};
```

### 2. Типы компонентов

**Было:**
```tsx
type IconComponent = React.ComponentType<any>;
```

**Стало:**
```tsx
type IconComponent = React.ComponentType<any>; // Без изменений
```

### 3. Context API

**Без изменений:**
```tsx
const MyContext = React.createContext<ContextType | null>(null);
```

## 🚨 Потенциальные проблемы

### 1. TypeScript ошибки

Если возникают ошибки TypeScript:

```bash
# Проверка типов
npx tsc --noEmit

# Исправление автоматически
npm run lint:fix
```

### 2. Проблемы с зависимостями

Если библиотеки не совместимы с React 19:

```bash
# Проверка совместимости
npm ls react react-dom

# Обновление проблемных пакетов
npm update @radix-ui/react-*
```

### 3. Проблемы сборки

```bash
# Очистка кэша
npm run clean

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install
```

## ✅ Проверочный список

После миграции убедитесь:

- [ ] `npm install` выполнен без ошибок
- [ ] `npm run build:client` собирается успешно
- [ ] `npm run test` проходит все тесты
- [ ] Приложение запускается: `npm run dev:client`
- [ ] Все компоненты отображаются корректно
- [ ] Функциональность работает как ожидается

## 🔄 Откат изменений

В случае проблем можно откатиться:

```bash
# Откат package.json
git checkout HEAD -- apps/client/package.json

# Переустановка зависимостей
npm install

# Проверка работоспособности
npm run dev:client
```

## 📊 Результат миграции

После успешной миграции:

✅ **Единая версия React 19.1.0** во всех приложениях  
✅ **Совместимость типов TypeScript**  
✅ **Упрощенная поддержка** кодовой базы  
✅ **Возможность создания общих компонентов**  
✅ **Современный синтаксис React**  

## 🎉 Следующие шаги

После миграции можно:

1. **Создать общие компоненты** в `libs/shared/`
2. **Унифицировать стили** и дизайн-систему
3. **Оптимизировать сборку** FIVEM
4. **Улучшить архитектуру** монорепозитория

---

**Статус:** 🟡 В процессе  
**Приоритет:** 🔴 Критично  
**Время выполнения:** 1-2 дня 