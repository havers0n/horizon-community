# 🛠️ План исправления несоответствий фронтенд-бэкенд

## ✅ Выполненные исправления

### 1. **Создан новый middleware для Supabase Auth**
- ✅ Файл: `apps/server/middleware/supabase-auth.middleware.ts`
- ✅ Функция: `authenticateSupabaseToken`
- ✅ Поддержка ролей: `requireSupervisor`, `requireAdmin`

### 2. **Добавлены отсутствующие API endpoints**
- ✅ `/api/stats` - Статистика системы
- ✅ `/api/admin/leave-applications` - Заявки на отпуск для админов
- ✅ `/api/admin/leave-stats` - Статистика отпусков для админов
- ✅ `/api/notifications` - Уведомления (уже был)
- ✅ `/api/tickets` - Тикеты поддержки (уже был)

### 3. **Созданы адаптеры для совместимости типов**
- ✅ Файл: `apps/client/src/lib/adapters.ts`
- ✅ Адаптеры для User, Application, Notification
- ✅ Поддержка преобразования UUID ↔ number для совместимости

### 4. **Обновлен queryClient**
- ✅ Добавлена автоматическая адаптация типов
- ✅ Поддержка Supabase Auth токенов

## 🔄 Следующие шаги

### Этап 1: Тестирование и отладка (1-2 дня)

#### 1.1 Проверить аутентификацию
```bash
# Запустить сервер
cd apps/server
npm run dev

# Запустить клиент
cd apps/client
npm run dev

# Проверить в браузере:
# 1. Регистрация/вход
# 2. Получение токена
# 3. API запросы с токеном
```

#### 1.2 Проверить API endpoints
```bash
# Тестировать endpoints:
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/stats
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/notifications
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/leave-applications
```

#### 1.3 Проверить адаптеры типов
```typescript
// В браузере проверить:
// 1. Правильно ли преобразуются UUID в number
// 2. Правильно ли отображаются данные
// 3. Нет ли ошибок в консоли
```

### Этап 2: Исправление оставшихся проблем (2-3 дня)

#### 2.1 Унифицировать типы данных
```typescript
// Создать shared-types в libs/shared-types/src/index.ts
export interface User {
  id: string; // UUID
  username: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string; // UUID
  type: string;
  status: string;
  authorId: string; // UUID
  data?: any;
  createdAt: string;
  updatedAt: string;
}
```

#### 2.2 Обновить фронтенд типы
```typescript
// В apps/client/src/types.ts заменить на:
import type { User, Application } from '@roleplay-identity/shared-types';

// Удалить старые интерфейсы и использовать импортированные
```

#### 2.3 Обновить бэкенд типы
```typescript
// В apps/server/types.ts заменить на:
import type { User, Application } from '@roleplay-identity/shared-types';

// Удалить дублирующие интерфейсы
```

### Этап 3: Улучшение архитектуры (1-2 дня)

#### 3.1 Создать единый API клиент
```typescript
// apps/client/src/lib/api-client.ts
export class ApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Promise<Record<string, string>>;

  constructor(baseUrl: string, getAuthHeaders: () => Promise<Record<string, string>>) {
    this.baseUrl = baseUrl;
    this.getAuthHeaders = getAuthHeaders;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

#### 3.2 Добавить валидацию данных
```typescript
// Использовать Zod для валидации
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['candidate', 'supervisor', 'admin']),
  // ...
});
```

#### 3.3 Добавить обработку ошибок
```typescript
// apps/client/src/lib/error-handler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  return new ApiError(500, 'Internal server error', error);
};
```

### Этап 4: Тестирование и документация (1 день)

#### 4.1 Создать тесты
```typescript
// apps/client/src/__tests__/api.test.ts
describe('API Integration', () => {
  test('should authenticate user', async () => {
    // Тест аутентификации
  });

  test('should fetch applications', async () => {
    // Тест получения заявок
  });

  test('should handle type adaptation', async () => {
    // Тест адаптации типов
  });
});
```

#### 4.2 Обновить документацию
```markdown
# API Documentation

## Authentication
All API requests require a valid Supabase JWT token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints

### GET /api/stats
Returns system statistics.

### GET /api/notifications
Returns user notifications.

### GET /api/admin/leave-applications
Returns leave applications (supervisor/admin only).
```

## 🚨 Критические моменты

### 1. **Временные решения**
- Адаптеры ID (UUID ↔ number) - это временное решение
- В будущем нужно перейти полностью на UUID

### 2. **Безопасность**
- Проверить, что все endpoints защищены аутентификацией
- Добавить rate limiting для критических endpoints

### 3. **Производительность**
- Добавить кэширование для часто запрашиваемых данных
- Оптимизировать запросы к базе данных

## 📋 Чек-лист завершения

- [ ] Все API endpoints работают
- [ ] Аутентификация работает корректно
- [ ] Типы данных совместимы
- [ ] Нет ошибок в консоли браузера
- [ ] Все функции фронтенда работают
- [ ] Тесты проходят
- [ ] Документация обновлена

## 🎯 Результат

После выполнения этого плана:
1. Фронтенд и бэкенд будут полностью совместимы
2. Аутентификация будет работать через Supabase
3. Все API endpoints будут доступны
4. Типы данных будут унифицированы
5. Система будет готова к продакшену 