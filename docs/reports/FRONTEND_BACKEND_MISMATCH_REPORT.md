# 🔍 Отчет о несоответствиях между фронтендом и бэкендом

## 📋 Обзор проблемы

Проведен комплексный аудит системы и выявлены критические несоответствия между фронтендом (`@client/`) и бэкендом (`@server/`), которые могут вызывать ошибки и неработоспособность системы.

## 🚨 Критические несоответствия

### 1. **Аутентификация и авторизация**

#### Проблема: Разные подходы к аутентификации
- **Фронтенд**: Использует Supabase Auth напрямую через `supabase.auth.getSession()`
- **Бэкенд**: Использует собственную систему аутентификации через middleware `authenticateToken`

#### Конкретные проблемы:
```typescript
// Фронтенд (apps/client/src/lib/queryClient.ts)
const { data: { session } } = await supabase.auth.getSession();
headers.Authorization = `Bearer ${session.access_token}`;

// Бэкенд (apps/server/middleware/auth.middleware.ts)
// Ожидает JWT токен в формате, который может не совпадать с Supabase токеном
```

### 2. **API Endpoints - Отсутствующие маршруты**

#### Фронтенд ожидает, но бэкенд не предоставляет:

1. **`/api/notifications`** - Уведомления
   - Фронтенд: `useQuery(['/api/notifications'])`
   - Бэкенд: ❌ Отсутствует в основных маршрутах

2. **`/api/stats`** - Статистика
   - Фронтенд: `useQuery(['/api/stats'])`
   - Бэкенд: ❌ Отсутствует

3. **`/api/tickets`** - Тикеты поддержки
   - Фронтенд: `fetch('/api/tickets')`
   - Бэкенд: ❌ Отсутствует в основных маршрутах

4. **`/api/admin/leave-applications`** - Заявки на отпуск
   - Фронтенд: `useQuery(['/api/admin/leave-applications'])`
   - Бэкенд: ❌ Отсутствует

5. **`/api/admin/leave-stats`** - Статистика отпусков
   - Фронтенд: `useQuery(['/api/admin/leave-stats'])`
   - Бэкенд: ❌ Отсутствует

### 3. **Типы данных - Несоответствия**

#### Проблема: Разные интерфейсы пользователя
```typescript
// Фронтенд (apps/client/src/types.ts)
export interface User {
  id: number;           // ❌ number
  name: string;         // ❌ name вместо username
  department: string;   // ❌ department вместо departmentId
  isSupervisor: boolean; // ❌ isSupervisor вместо role
}

// Бэкенд (apps/server/types.ts)
export interface User {
  id: string;           // ✅ string (UUID)
  username: string;     // ✅ username
  email: string;        // ✅ email
  role: string;         // ✅ role
  departmentId?: string; // ✅ departmentId
  // ... другие поля
}
```

### 4. **API Response Format - Несоответствия**

#### Проблема: Разные форматы ответов
```typescript
// Фронтенд ожидает:
interface Application {
  id: number;
  type: string;
  status: string;
  // ...
}

// Бэкенд возвращает:
interface Application {
  id: string; // UUID
  type: string;
  status: string;
  authorId: string; // UUID
  // ...
}
```

### 5. **Отсутствующие middleware и обработчики**

#### Проблема: Фронтенд использует endpoints, которые не зарегистрированы
```typescript
// Фронтенд вызывает:
fetch('/api/tickets')
fetch('/api/notifications')
fetch('/api/stats')

// Но в apps/server/routes.ts эти маршруты не зарегистрированы
```

## 🔧 Рекомендации по исправлению

### 1. **Унификация аутентификации**
```typescript
// Создать единый middleware для Supabase Auth
export const authenticateSupabaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Получить пользователя из БД
    const dbUser = await storage.getUserByAuthId(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = dbUser;
    req.authUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
```

### 2. **Добавить отсутствующие API endpoints**
```typescript
// В apps/server/routes.ts добавить:

// Уведомления
app.get('/api/notifications', authenticateToken, async (req: any, res) => {
  const notifications = await storage.getNotificationsByUser(req.user.id);
  res.json(notifications);
});

app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
  await storage.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

// Статистика
app.get('/api/stats', authenticateToken, async (req: any, res) => {
  const stats = await storage.getStats();
  res.json(stats);
});

// Тикеты поддержки
app.get('/api/tickets', authenticateToken, async (req: any, res) => {
  const tickets = await storage.getTicketsByUser(req.user.id);
  res.json(tickets);
});

// Админские endpoints для отпусков
app.get('/api/admin/leave-applications', authenticateToken, requireSupervisor, async (req: any, res) => {
  const applications = await storage.getLeaveApplications();
  res.json(applications);
});

app.get('/api/admin/leave-stats', authenticateToken, requireSupervisor, async (req: any, res) => {
  const stats = await storage.getLeaveStats();
  res.json(stats);
});
```

### 3. **Унифицировать типы данных**
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

### 4. **Создать адаптеры для совместимости**
```typescript
// В apps/client/src/lib/adapters.ts
export const adaptBackendUserToFrontend = (backendUser: any): FrontendUser => ({
  id: parseInt(backendUser.id), // Временное решение
  name: backendUser.username,
  department: backendUser.departmentId || '',
  isSupervisor: ['supervisor', 'admin'].includes(backendUser.role)
});
```

## 📊 Приоритеты исправления

### 🔴 Критический (Блокирует работу)
1. Добавить отсутствующие API endpoints
2. Исправить аутентификацию
3. Унифицировать типы данных

### 🟡 Высокий (Влияет на функциональность)
1. Создать адаптеры для совместимости
2. Добавить валидацию данных
3. Исправить форматы ответов

### 🟢 Средний (Улучшение UX)
1. Добавить обработку ошибок
2. Улучшить типизацию
3. Добавить логирование

## 🎯 План действий

1. **Этап 1**: Исправить аутентификацию (1-2 дня)
2. **Этап 2**: Добавить отсутствующие endpoints (2-3 дня)
3. **Этап 3**: Унифицировать типы данных (1-2 дня)
4. **Этап 4**: Тестирование и отладка (1-2 дня)

## 📝 Заключение

Выявлены критические несоответствия между фронтендом и бэкендом, которые требуют немедленного исправления. Основные проблемы связаны с аутентификацией, отсутствующими API endpoints и несоответствием типов данных. Рекомендуется приступить к исправлению в указанном порядке приоритетов. 