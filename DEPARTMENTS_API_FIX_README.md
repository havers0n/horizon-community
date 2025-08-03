# Исправление проблемы с доступом к департаментам

## Проблема
Приложение `apps/client` не могло загрузить список департаментов и падало с ошибкой:
```
The schema must be one of the following....
```

**Причина:** Код делал прямой запрос `supabase.from('departments').select()` к таблице `departments` в защищенной схеме `common`, что блокировалось PostgREST.

## Решение

### 1. База данных (Supabase)

#### Создана RPC функция для безопасного доступа
**Файл:** `supabase/migrations/023_create_public_departments_rpc.sql`

```sql
CREATE OR REPLACE FUNCTION public.get_all_departments()
RETURNS TABLE (
  id UUID,
  name TEXT,
  full_name TEXT,
  logo_url TEXT,
  description TEXT,
  gallery TEXT[]
) 
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, d.name, d.full_name, d.logo_url, d.description, d.gallery
  FROM common.departments d
  ORDER BY d.name;
END;
$$;
```

**Особенности:**
- ✅ Использует `SECURITY INVOKER` для корректной работы RLS
- ✅ Правильный тип `UUID` для поля `id`
- ✅ Права доступа выданы всем ролям (`anon`, `authenticated`, `service_role`)

### 2. Бэкенд (apps/server)

#### Новый сервис для публичного API
**Файл:** `apps/server/services/PublicService.ts`

```typescript
export class PublicService {
  async getAllDepartments(): Promise<PublicDepartment[]>
  async getDepartmentById(id: string): Promise<PublicDepartment | null>
  async healthCheck(): Promise<{ status: string; timestamp: string; departmentsCount: number }>
}
```

#### Новые роуты для публичного API
**Файл:** `apps/server/routes/public.ts`

- `GET /api/public/departments` - список всех департаментов
- `GET /api/public/departments/:id` - департамент по ID
- `GET /api/public/health` - проверка здоровья API

#### Интеграция в основной роутер
**Файл:** `apps/server/routes.ts`

```typescript
// Публичные маршруты без аутентификации
app.use('/api/public', publicRoutes);
```

### 3. Фронтенд (apps/client)

#### Новый сервис для работы с API
**Файл:** `apps/client/src/services/departmentsService.ts`

```typescript
class DepartmentsService {
  async getAllDepartments(): Promise<Department[]>
  async getDepartmentById(id: string): Promise<Department | null>
  async healthCheck(): Promise<boolean>
}
```

#### React хуки для удобной работы
**Файл:** `apps/client/src/hooks/useDepartments.ts`

```typescript
export function useDepartments(): UseDepartmentsReturn
export function useDepartment(id: string): UseDepartmentReturn
export function useDepartmentsHealth(): { isHealthy: boolean; loading: boolean }
```

#### Обновленные функции доступа к данным
**Файл:** `apps/client/src/data/departments.ts`

- `getDepartmentById()` - теперь асинхронная, использует API
- `getDepartmentByName()` - теперь асинхронная, использует API
- `getAllDepartments()` - новая функция для получения всех департаментов

#### Исправление проблемного кода
**Файл:** `apps/mdtclient/src/lib/supabase.ts`

Заменил прямой запрос к `departments` на вызов нового API:
```typescript
// Было:
const { data, error } = await supabase.from('departments').select('count').limit(1);

// Стало:
const response = await fetch('http://localhost:5000/api/public/departments');
```

## Инструкции по применению

### 1. Применить миграцию базы данных
```bash
cd supabase
supabase db reset  # или supabase migration up
```

### 2. Перезапустить сервер
```bash
cd apps/server
npm run dev
```

### 3. Перезапустить клиент
```bash
cd apps/client
npm run dev
```

### 4. Проверить работу API
```bash
# Проверка здоровья API
curl http://localhost:5000/api/public/health

# Получение списка департаментов
curl http://localhost:5000/api/public/departments
```

## Преимущества решения

1. **Безопасность:** Нет прямого доступа к защищенным схемам
2. **Производительность:** RPC функции оптимизированы
3. **Масштабируемость:** Легко добавлять новые публичные эндпоинты
4. **Совместимость:** Fallback на локальные данные при ошибках API
5. **Типизация:** Полная TypeScript поддержка

## Тестирование

### Проверка API
```bash
# Health check
curl http://localhost:5000/api/public/health

# Список департаментов
curl http://localhost:5000/api/public/departments

# Конкретный департамент
curl http://localhost:5000/api/public/departments/[UUID]
```

### Проверка клиента
1. Открыть приложение в браузере
2. Проверить, что департаменты загружаются без ошибок
3. Проверить консоль на отсутствие ошибок схемы

## Возможные проблемы и решения

### Проблема: API недоступен
**Решение:** Проверить, что сервер запущен на порту 5000

### Проблема: CORS ошибки
**Решение:** Добавить CORS middleware в сервер

### Проблема: Неправильные типы UUID
**Решение:** Убедиться, что миграция применена корректно

## Заключение

Решение полностью устраняет проблему с доступом к департаментам, обеспечивая:
- ✅ Безопасный доступ к защищенным схемам
- ✅ Публичный API без аутентификации
- ✅ Совместимость с существующим кодом
- ✅ Fallback механизмы для надежности 