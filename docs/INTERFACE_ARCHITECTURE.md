# Архитектура разделенных интерфейсов

## Обзор

Проект теперь использует архитектуру **микросервисных интерфейсов**, где каждый интерфейс работает как отдельное приложение на своем порту/домене.

## Структура интерфейсов

### 🏠 Основной интерфейс (Client)
- **Порт**: 3000 (dev) / основной домен (prod)
- **URL**: `http://localhost:3000` / `https://your-domain.com`
- **Технологии**: React + React Query + Context API
- **Назначение**: Главная панель управления, заявки, отчеты, тесты, форум

### 📊 MDT System (MDT Client)
- **Порт**: 3001 (dev) / поддомен (prod)
- **URL**: `http://localhost:3001` / `https://mdt.your-domain.com`
- **Технологии**: React + Zustand + Real-time
- **Назначение**: Система управления данными, поиск граждан, управление юнитами

### 📡 CAD System (CAD Client)
- **Порт**: 3002 (dev) / поддомен (prod)
- **URL**: `http://localhost:3002` / `https://cad.your-domain.com`
- **Технологии**: React + Zustand + WebSocket
- **Назначение**: Система диспетчеризации, управление вызовами, карта

## Преимущества новой архитектуры

### ✅ Изоляция состояний
- Каждый интерфейс использует свою систему управления состоянием
- Нет конфликтов между Zustand и React Query
- Независимые жизненные циклы приложений

### ✅ Масштабируемость
- Каждый интерфейс может быть развернут отдельно
- Возможность горизонтального масштабирования
- Независимые обновления и деплой

### ✅ Специализация
- MDT оптимизирован для работы с данными
- CAD оптимизирован для real-time операций
- Основной интерфейс фокусируется на управлении

### ✅ Безопасность
- Изоляция сессий между интерфейсами
- Возможность разных уровней доступа
- Защита от cross-site атак

## Навигация между интерфейсами

### Interface Switcher
Центральный компонент для переключения между интерфейсами:

```typescript
// Определение текущего интерфейса
const currentUrl = window.location.hostname + window.location.port;
const isMDT = currentUrl.includes('mdt') || window.location.pathname.includes('/mdt');
const isCAD = currentUrl.includes('cad') || window.location.pathname.includes('/cad');

// Переход на другой интерфейс
const handleInterfaceChange = (url: string) => {
  window.location.href = url;
};
```

### Контекстные кнопки
В каждом интерфейсе есть кнопки для быстрого перехода:

- **Основной интерфейс**: Кнопка "MDT/CAD" в навигации
- **MDT**: Кнопка "Вернуться в основной интерфейс" + "CAD System" в сайдбаре
- **CAD**: Кнопка "MDT" в заголовке

## Конфигурация разработки

### Запуск всех интерфейсов
```bash
# Терминал 1 - Основной интерфейс
cd apps/client
npm run dev  # http://localhost:3000

# Терминал 2 - MDT System
cd apps/mdtclient
npm run dev  # http://localhost:3001

# Терминал 3 - CAD System (если создан)
cd apps/cadclient
npm run dev  # http://localhost:3002
```

### Переменные окружения
```bash
# apps/client/.env
VITE_API_URL=http://localhost:3000/api
VITE_MAIN_DOMAIN=http://localhost:3000

# apps/mdtclient/.env
VITE_API_URL=http://localhost:3000/api
VITE_MDT_DOMAIN=http://localhost:3001

# apps/cadclient/.env
VITE_API_URL=http://localhost:3000/api
VITE_CAD_DOMAIN=http://localhost:3002
```

## Продакшн конфигурация

### Домены
```bash
# Основной интерфейс
https://your-domain.com

# MDT System
https://mdt.your-domain.com

# CAD System
https://cad.your-domain.com
```

### Nginx конфигурация
```nginx
# Основной интерфейс
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# MDT System
server {
    listen 80;
    server_name mdt.your-domain.com;
    location / {
        proxy_pass http://localhost:3001;
    }
}

# CAD System
server {
    listen 80;
    server_name cad.your-domain.com;
    location / {
        proxy_pass http://localhost:3002;
    }
}
```

## Общие ресурсы

### API Backend
- Все интерфейсы используют общий API на `http://localhost:3000/api`
- Аутентификация через JWT токены
- CORS настроен для всех поддоменов

### База данных
- Общая Supabase база данных
- RLS (Row Level Security) для изоляции данных
- Real-time подписки для MDT и CAD

### Общие библиотеки
```typescript
// libs/shared-types - общие типы
import { User, Character, Department } from '@roleplay-identity/shared-types';

// libs/shared-utils - общие утилиты
import { formatDate, validateEmail } from '@roleplay-identity/shared-utils';

// libs/shared-schema - схемы валидации
import { userSchema, characterSchema } from '@shared/schema';
```

## Миграция с монолитной архитектуры

### Что изменилось
1. **Удалены внутренние роуты** `/mdt` и `/cad` из основного клиента
2. **Добавлены переходы на отдельные домены** через `window.location.href`
3. **Разделены системы управления состоянием** между приложениями
4. **Настроены отдельные порты** для разработки

### Что осталось
1. **Общий API backend** для всех интерфейсов
2. **Общие типы и утилиты** в shared библиотеках
3. **Единая система аутентификации** через JWT
4. **Общая база данных** с RLS

## Мониторинг и аналитика

### Логирование
```typescript
// Каждый интерфейс логирует переходы
console.log(`Переход с ${currentDomain} на ${targetDomain}`);
```

### Аналитика
- Отслеживание использования каждого интерфейса
- Метрики производительности по отдельности
- Анализ пользовательских путей между интерфейсами

## Безопасность

### CORS настройки
```typescript
// Backend CORS конфигурация
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://your-domain.com',
    'https://mdt.your-domain.com',
    'https://cad.your-domain.com'
  ],
  credentials: true
};
```

### JWT токены
- Токены действительны для всех поддоменов
- Автоматическое обновление токенов
- Безопасная передача между интерфейсами

## Заключение

Новая архитектура обеспечивает:
- ✅ **Лучшую производительность** - каждый интерфейс оптимизирован под свои задачи
- ✅ **Простоту разработки** - нет конфликтов между разными технологиями
- ✅ **Масштабируемость** - возможность независимого развития интерфейсов
- ✅ **Безопасность** - изоляция и специализированные настройки безопасности 