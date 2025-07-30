# Система аутентификации

## Обзор

Система аутентификации использует **Supabase Auth** для управления пользователями и JWT токенами. Пользователи создаются в Supabase Auth, а дополнительная информация хранится в локальной базе данных.

## Архитектура

### Компоненты

1. **Supabase Auth**: Управление пользователями, аутентификация, JWT токены
2. **Локальная база данных**: Дополнительная информация о пользователях (роли, профили, etc.)
3. **Auth Helper функции**: Утилиты для работы с аутентификацией

### Схема данных

```sql
-- Supabase Auth (управляется Supabase)
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  encrypted_password TEXT,
  created_at TIMESTAMP,
  -- другие поля Supabase Auth
)

-- Локальная база данных
users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  auth_id UUID UNIQUE REFERENCES auth.users(id), -- связь с Supabase Auth
  role TEXT DEFAULT 'candidate',
  status TEXT DEFAULT 'active',
  -- другие поля профиля
)
```

## API Endpoints

### Регистрация

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "role": "candidate",
    "auth_id": "uuid-from-supabase"
  },
  "authUser": {
    "id": "uuid-from-supabase",
    "email": "user@example.com",
    // другие поля Supabase Auth
  }
}
```

### Вход

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "role": "candidate",
    "auth_id": "uuid-from-supabase"
  },
  "authUser": {
    "id": "uuid-from-supabase",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

### Получение профиля

```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

**Ответ:**
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "role": "candidate"
  },
  "characters": []
}
```

## Middleware

### authenticateToken

Middleware для проверки JWT токена и получения пользователя:

```typescript
import { authenticateToken } from '../middleware/auth.middleware';

app.get('/api/protected-route', authenticateToken, (req, res) => {
  // req.user содержит данные пользователя
  const user = req.user;
  res.json({ user });
});
```

### requireSupervisor

Middleware для проверки роли supervisor/admin:

```typescript
import { authenticateToken, requireSupervisor } from '../middleware/auth.middleware';

app.get('/api/admin-route', authenticateToken, requireSupervisor, (req, res) => {
  // Доступ только для supervisor/admin
  res.json({ message: 'Admin access granted' });
});
```

## Helper функции

### getAuthenticatedUser

Получает пользователя из JWT токена:

```typescript
import { getAuthenticatedUser } from '../utils/auth';

const user = await getAuthenticatedUser(req);
if (user) {
  // Пользователь аутентифицирован
}
```

### requireAuthentication

Получает пользователя или выбрасывает ошибку:

```typescript
import { requireAuthentication } from '../utils/auth';

try {
  const user = await requireAuthentication(req);
  // Пользователь аутентифицирован
} catch (error) {
  // Пользователь не аутентифицирован
}
```

### requireSupervisorOrAdmin

Проверяет роль supervisor/admin:

```typescript
import { requireSupervisorOrAdmin } from '../utils/auth';

try {
  const user = await requireSupervisorOrAdmin(req);
  // Пользователь имеет права supervisor/admin
} catch (error) {
  // Недостаточно прав
}
```

## Конфигурация

### Переменные окружения

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vite Configuration (для клиента)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
```

### Настройка Storage

Система автоматически выбирает между `SupabaseStorage` и `PgStorage`:

```typescript
// server/storage.ts
const useSupabaseStorage = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[YOUR-PASSWORD]');
export const storage = useSupabaseStorage ? new SupabaseStorage() : new PgStorage();
```

## Безопасность

### JWT Токены

- Токены создаются Supabase Auth
- Время жизни: 1 час
- Проверка через Supabase Admin API

### RLS (Row Level Security)

Supabase автоматически применяет RLS политики на уровне базы данных.

### Защита endpoints

Все защищенные endpoints должны использовать `authenticateToken` middleware:

```typescript
app.get('/api/protected', authenticateToken, (req, res) => {
  // Защищенный endpoint
});
```

## Тестирование

### Запуск тестов

```bash
# Тестирование всех endpoints
node scripts/test_api_endpoints.js

# Отладка аутентификации
node scripts/debug_auth.js

# Проверка подключения к Supabase
node scripts/check_supabase_connection.js
```

### Результаты тестов

```
🎉 Все тесты: ПРОЙДЕНЫ ✅
Публичные endpoints: ✅
Регистрация: ✅
Вход: ✅
Защищенные endpoints: ✅
Защита без токена: ✅
```

## Миграция

### Из старой системы

1. Пользователи мигрируются автоматически при первом входе
2. Старые пароли заменяются на Supabase Auth
3. `auth_id` связывает локальных пользователей с Supabase Auth

### Обновления

- Старые middleware (`verifyJWT`, `requireAdminOrSupervisor`) помечены как deprecated
- Новые middleware: `authenticateToken`, `requireSupervisor`
- Helper функции в `server/utils/auth.ts`

## Troubleshooting

### Проблемы с токенами

1. Проверьте `SUPABASE_SERVICE_ROLE_KEY`
2. Убедитесь, что токен передается в заголовке `Authorization: Bearer <token>`
3. Проверьте время жизни токена

### Проблемы с подключением

1. Проверьте `SUPABASE_URL` и ключи
2. Убедитесь, что Supabase проект активен
3. Проверьте RLS политики в Supabase Dashboard

### Проблемы с пользователями

1. Проверьте, что пользователь существует в Supabase Auth
2. Убедитесь, что `auth_id` правильно связан с локальным пользователем
3. Проверьте роли пользователя в локальной базе данных
