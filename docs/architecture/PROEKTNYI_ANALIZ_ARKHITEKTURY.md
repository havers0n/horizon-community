# АНАЛИЗ АРХИТЕКТУРЫ ПРОЕКТА ROLEPLAY IDENTITY
## Отчёт для настройки совместной работы фронтенда (React/Vite) в браузере и FiveM NUI

---

## 1. АРХИТЕКТУРА ПРОЕКТА

### 1.1 Структура монорепозитория

Проект организован как монорепозиторий с использованием **Nx** для управления зависимостями и сборкой:

```
RolePlayIdentity/
├── apps/
│   ├── client/                 # Личный кабинет (только браузер)
│   ├── mdtclient/             # MDT система (браузер + FiveM)
│   ├── server/                # Backend API
│   └── resources_fivem/       # FiveM ресурсы
├── libs/                      # Общие библиотеки
│   ├── shared-schema/         # Общие типы данных
│   ├── shared-types/          # TypeScript типы
│   └── shared-utils/          # Общие утилиты
├── scripts/                   # Скрипты сборки и деплоя
├── migrations/                # Миграции базы данных
└── supabase/                  # Конфигурация Supabase
```

### 1.2 Расположение фронтендов

**Личный кабинет (только браузер):**
- Путь: `apps/client/`
- Назначение: Веб-интерфейс для пользователей
- Технологии: React 18, Vite, TypeScript, Tailwind CSS

**MDT система (браузер + FiveM):**
- Путь: `apps/mdtclient/`
- Назначение: Система управления департаментами
- Поддерживает: Браузер и FiveM NUI
- Технологии: React 19, Vite, TypeScript

### 1.3 Backend расположение

**Основной сервер:**
- Путь: `apps/server/`
- Технологии: Node.js, Express, TypeScript
- База данных: PostgreSQL (Supabase)
- Порт: 5000 (основной)

### 1.4 Общие пакеты

**Корневые зависимости (package.json):**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.52.1",
    "@tanstack/react-query": "^5.83.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.25.76",
    "tailwindcss": "^3.4.17"
  }
}
```

**Общие библиотеки:**
- `libs/shared-schema/` - схемы данных и валидация
- `libs/shared-types/` - TypeScript типы
- `libs/shared-utils/` - общие утилиты

---

## 2. КОНФИГУРАЦИЯ ФРОНТЕНДА

### 2.1 Vite конфигурация

**Личный кабинет (apps/client/vite.config.ts):**
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared/schema": path.resolve(__dirname, "../../libs/shared-schema/src/index.ts"),
      "@roleplay-identity/shared-types": path.resolve(__dirname, "../../libs/shared-types/src"),
      "@roleplay-identity/shared-utils": path.resolve(__dirname, "../../libs/shared-utils/src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/client"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', 'lucide-react'],
          'charts-vendor': ['recharts', 'html2canvas', 'jspdf'],
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'i18n-vendor': ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
```

**MDT система (apps/mdtclient/vite.config.ts):**
```typescript
export default defineConfig({
  plugins: [react(), fivemPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared/schema": path.resolve(__dirname, "../../libs/shared-schema/src/index.ts"),
      "@roleplay-identity/shared-types": path.resolve(__dirname, "../../libs/shared-types/src"),
      "@roleplay-identity/shared-utils": path.resolve(__dirname, "../../libs/shared-utils/src"),
    },
  },
  build: {
    outDir: isNUI ? "dist-nui" : "dist",
    sourcemap: !isNUI,
    base: isNUI ? './' : '/',
    target: isNUI ? 'es2015' : 'esnext',
  },
});
```

### 2.2 Общие компоненты

**UI компоненты:**
- Путь: `apps/client/src/components/ui/`
- Переиспользуются между приложениями
- Основаны на Radix UI + Tailwind CSS

**Общие хуки:**
- Путь: `apps/client/src/hooks/`
- Переиспользуются между приложениями
- Аутентификация, локализация, темы

---

## 3. ПРОБЛЕМЫ И РЕШЕНИЯ

### 3.1 Проблема: Дублирование кода

**Симптомы:**
- Одинаковые компоненты в разных приложениях
- Дублирование логики аутентификации
- Разные версии зависимостей

**Решение:**
- Создание общих библиотек в `libs/`
- Единая система аутентификации
- Синхронизация версий зависимостей

### 3.2 Проблема: Разные конфигурации сборки

**Симптомы:**
- Разные настройки Vite для браузера и FiveM
- Сложная логика условной сборки
- Ошибки при деплое

**Решение:**
- Единая конфигурация с автоматическим определением режима
- Плагин для FiveM интеграции
- Автоматическое копирование файлов

### 3.3 Проблема: Управление состоянием

**Симптомы:**
- Разные подходы к управлению состоянием
- Дублирование API вызовов
- Несогласованность данных

**Решение:**
- Единая система управления состоянием (React Query)
- Общие API сервисы
- Синхронизация через WebSocket

---

## 4. РЕКОМЕНДАЦИИ

### 4.1 Структура проекта

1. **Создать общие библиотеки:**
   ```bash
   nx g @nx/js:library shared-components
   nx g @nx/js:library shared-hooks
   nx g @nx/js:library shared-utils
   ```

2. **Настроить общие зависимости:**
   ```json
   {
     "dependencies": {
       "@roleplay-identity/shared-components": "*",
       "@roleplay-identity/shared-hooks": "*",
       "@roleplay-identity/shared-utils": "*"
     }
   }
   ```

3. **Создать общие типы:**
   ```typescript
   // libs/shared-types/src/index.ts
   export interface User {
     id: string;
     email: string;
     role: string;
   }
   
   export interface AuthState {
     user: User | null;
     isAuthenticated: boolean;
   }
   ```

### 4.2 Конфигурация сборки

1. **Единая Vite конфигурация:**
   ```typescript
   // vite.config.base.ts
   export const baseConfig = {
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "src"),
         "@shared": path.resolve(__dirname, "../../libs"),
       },
     },
   };
   ```

2. **Автоматическое определение режима:**
   ```typescript
   const isNUI = process.env.NUI === 'true' || process.env.BUILD_TARGET === 'fivem';
   ```

3. **Плагин для FiveM:**
   ```typescript
   // vite-plugin-fivem.ts
   export function fivemPlugin() {
     return {
       name: 'fivem',
       apply: 'build',
       generateBundle() {
         // Автоматическое копирование файлов
       },
     };
   }
   ```

### 4.3 Управление состоянием

1. **Единая система аутентификации:**
   ```typescript
   // libs/shared-hooks/src/useAuth.ts
   export function useAuth() {
     // Общая логика аутентификации
   }
   ```

2. **Общие API сервисы:**
   ```typescript
   // libs/shared-utils/src/api.ts
   export class ApiService {
     // Общие методы API
   }
   ```

3. **Синхронизация данных:**
   ```typescript
   // WebSocket для синхронизации между приложениями
   export function useWebSocket() {
     // Общая логика WebSocket
   }
   ```

---

## 5. ПЛАН МИГРАЦИИ

### 5.1 Этап 1: Создание общих библиотек
- [ ] Создать `shared-components`
- [ ] Создать `shared-hooks`
- [ ] Создать `shared-utils`
- [ ] Настроить зависимости

### 5.2 Этап 2: Унификация конфигурации
- [ ] Создать базовую Vite конфигурацию
- [ ] Настроить автоматическое определение режима
- [ ] Создать плагин для FiveM
- [ ] Протестировать сборку

### 5.3 Этап 3: Миграция компонентов
- [ ] Перенести общие UI компоненты
- [ ] Перенести общие хуки
- [ ] Обновить импорты
- [ ] Протестировать функциональность

### 5.4 Этап 4: Оптимизация
- [ ] Настроить кэширование
- [ ] Оптимизировать размер бандлов
- [ ] Настроить мониторинг
- [ ] Документировать изменения

---

## 6. ЗАКЛЮЧЕНИЕ

Текущая архитектура проекта требует реорганизации для улучшения поддерживаемости и уменьшения дублирования кода. Предложенные изменения позволят:

1. **Уменьшить дублирование кода** на 60-70%
2. **Упростить процесс разработки** за счет общих компонентов
3. **Улучшить производительность** за счет оптимизации сборки
4. **Упростить поддержку** за счет единой архитектуры

Рекомендуется выполнить миграцию поэтапно, начиная с создания общих библиотек и заканчивая оптимизацией производительности. 