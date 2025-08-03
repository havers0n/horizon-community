# 🔴 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ - ИНСТРУКЦИИ

## ⚠️ ВАЖНО: НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ

**ПЕРЕД НАЧАЛОМ РАБОТЫ:**
1. Сделайте резервную копию базы данных
2. Создайте ветку для исправлений: `git checkout -b fix-critical-security-issues`
3. Остановите разработку новых функций
4. Уведомите команду о критических проблемах

---

## 🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ

### Шаг 1: Автоматическое исправление
```bash
# Запуск автоматического исправления
node scripts/fix-critical-issues.js
```

### Шаг 2: Применение миграций
```bash
# Применить новые RPC функции
supabase db push
```

### Шаг 3: Проверка исправлений
```bash
# Запуск тестов
npm test

# Проверка типов
npm run type-check
```

---

## 📋 ПОДРОБНЫЙ ПЛАН ИСПРАВЛЕНИЙ

### ПРИОРИТЕТ 1: UUID ПРОБЛЕМЫ (КРИТИЧНО)

#### 1.1 Исправление parseInt() в роутах

**Проблема:** `parseInt(req.params.id)` для UUID
**Решение:** Валидация UUID

**До:**
```typescript
app.get('/api/departments/:id', async (req, res) => {
  const id = parseInt(req.params.id); // ❌ КРИТИЧНО!
  const department = await storage.getDepartment(id);
  res.json(department);
});
```

**После:**
```typescript
import { isValidUUID } from '../utils/uuid';

app.get('/api/departments/:id', async (req, res) => {
  const id = req.params.id;
  
  // UUID валидация
  if (!isValidUUID(id)) {
    return res.status(400).json({ 
      message: 'Invalid UUID format', 
      field: 'id',
      value: id
    });
  }
  
  const department = await storage.getDepartment(id);
  res.json(department);
});
```

#### 1.2 Исправление адаптеров фронтенда

**Проблема:** Обрезка UUID до 8 символов
**Решение:** Использование полных UUID

**До:**
```typescript
// ❌ КРИТИЧНО - потеря данных!
id: parseInt(backendUser.id.replace(/-/g, '').substring(0, 8), 16)
```

**После:**
```typescript
// ✅ Правильно - полный UUID
id: backendUser.id
```

#### 1.3 Файлы для исправления:
- `apps/server/routes.ts` (9 нарушений)
- `apps/server/routes/adminTests.ts` (4 нарушения)
- `apps/server/routes/filledReports.ts` (7 нарушений)
- `apps/client/src/lib/adapters.ts` (5 нарушений)

---

### ПРИОРИТЕТ 2: ПРЯМЫЕ ЗАПРОСЫ К ЗАЩИЩЕННЫМ СХЕМАМ (КРИТИЧНО)

#### 2.1 Замена на RPC функции

**Проблема:** Прямые запросы к `common.` и `mdt.` схемам
**Решение:** Использование RPC функций

**До:**
```typescript
// ❌ КРИТИЧНО - обход RLS!
const result = await pool.query('SELECT * FROM common.characters WHERE id = $1', [id]);
```

**После:**
```typescript
// ✅ Правильно - через RPC
const result = await pool.query('SELECT * FROM public.get_character_by_id($1)', [id]);
```

#### 2.2 Создание недостающих RPC функций

**Файл:** `supabase/migrations/025_fix_architecture_rpc.sql`

```sql
-- Функции для тестов
CREATE OR REPLACE FUNCTION public.get_all_tests()
RETURNS SETOF tests 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM tests ORDER BY id DESC;
END;
$$;

-- Функции для заполненных рапортов
CREATE OR REPLACE FUNCTION public.get_filled_report_by_id(p_report_id UUID)
RETURNS SETOF filled_reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM filled_reports WHERE id = p_report_id;
END;
$$;
```

#### 2.3 Файлы для исправления:
- `apps/server/services/CharacterServiceUpdated.ts` (10+ нарушений)
- `apps/server/test-schema-connection.js` (6 нарушений)
- `apps/server/test-bolo-units.js` (5 нарушений)

---

### ПРИОРИТЕТ 3: ТИПИЗАЦИЯ ФРОНТЕНДА (СРОЧНО)

#### 3.1 Интеграция типов БД

**Проблема:** Фронтенд не использует типы из `packages/db-types`
**Решение:** Импорт и использование типов

**До:**
```typescript
// ❌ Дублирование типов
interface User {
  id: number; // Неправильный тип!
  name: string;
}
```

**После:**
```typescript
// ✅ Использование типов БД
import type { User } from '../types/database';

// Теперь User.id имеет правильный тип UUID
```

#### 3.2 Создание типов для фронтенда

**Файлы:**
- `apps/client/src/types/database.ts`
- `apps/mdtclient/src/types/database.ts`

```typescript
// Импорт типов из packages/db-types
export type { Database, Tables } from '../../../packages/db-types/src/index';

// Алиасы для удобства
export type User = Tables['users'];
export type Character = Tables['characters'];
export type Department = Tables['departments'];
```

#### 3.3 Обновление package.json

**Добавить в зависимости:**
```json
{
  "dependencies": {
    "@your-org/db-types": "workspace:*"
  }
}
```

---

### ПРИОРИТЕТ 4: ВАЛИДАЦИЯ И БЕЗОПАСНОСТЬ (ПЛАНОВО)

#### 4.1 Zod схемы для API

**Создать:** `apps/server/schemas/validation.ts`

```typescript
import { z } from 'zod';

export const UUIDSchema = z.string().uuid();
export const UserSchema = z.object({
  id: UUIDSchema,
  username: z.string().min(3),
  email: z.string().email()
});
```

#### 4.2 Middleware для валидации

**Создать:** `apps/server/middleware/validation.middleware.ts`

```typescript
import { UUIDSchema } from '../schemas/validation';

export const validateUUID = (req: any, res: any, next: any) => {
  const id = req.params.id;
  
  try {
    UUIDSchema.parse(id);
    next();
  } catch (error) {
    res.status(400).json({ 
      message: 'Invalid UUID format',
      field: 'id',
      value: id
    });
  }
};
```

---

## 🧪 ТЕСТИРОВАНИЕ ИСПРАВЛЕНИЙ

### 1. Unit тесты

**Создать:** `apps/server/__tests__/uuid-validation.test.ts`

```typescript
import { isValidUUID } from '../utils/uuid';

describe('UUID Validation', () => {
  test('should validate correct UUID', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    expect(isValidUUID(validUUID)).toBe(true);
  });
  
  test('should reject invalid UUID', () => {
    const invalidUUID = '123';
    expect(isValidUUID(invalidUUID)).toBe(false);
  });
});
```

### 2. Интеграционные тесты

**Создать:** `apps/server/__tests__/api-routes.test.ts`

```typescript
import request from 'supertest';
import { app } from '../app';

describe('API Routes', () => {
  test('should reject invalid UUID', async () => {
    const response = await request(app)
      .get('/api/departments/invalid-uuid')
      .expect(400);
    
    expect(response.body.message).toBe('Invalid UUID format');
  });
});
```

### 3. Тесты безопасности

**Создать:** `apps/server/__tests__/security.test.ts`

```typescript
describe('Security Tests', () => {
  test('should not allow direct access to protected schemas', async () => {
    // Тест на попытку прямого доступа к common.characters
  });
  
  test('should validate UUID format in all endpoints', async () => {
    // Тест всех эндпоинтов на валидацию UUID
  });
});
```

---

## 📊 ПРОВЕРКА ИСПРАВЛЕНИЙ

### 1. Автоматическая проверка

```bash
# Проверка на наличие parseInt для UUID
grep -r "parseInt.*[Ii][Dd]" apps/ --include="*.ts" --include="*.js"

# Проверка прямых запросов к защищенным схемам
grep -r "FROM.*common\." apps/ --include="*.ts" --include="*.js"
grep -r "FROM.*mdt\." apps/ --include="*.ts" --include="*.js"

# Проверка использования типов
grep -r "from.*db-types" apps/ --include="*.ts" --include="*.js"
```

### 2. Ручная проверка

1. **Проверить все роуты** на валидацию UUID
2. **Проверить все сервисы** на использование RPC
3. **Проверить фронтенд** на использование типов БД
4. **Проверить адаптеры** на правильную обработку UUID

### 3. Тестирование функциональности

1. **Создание пользователей** с UUID
2. **Создание персонажей** через RPC
3. **Тестирование API** с валидными и невалидными UUID
4. **Проверка фронтенда** на корректное отображение данных

---

## 🚨 КРИТИЧЕСКИЕ ТОЧКИ ВНИМАНИЯ

### 1. Миграция данных

**ВАЖНО:** Если в БД есть данные с числовыми ID, нужна миграция:

```sql
-- Миграция числовых ID на UUID
ALTER TABLE users ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE users SET new_id = gen_random_uuid() WHERE new_id IS NULL;
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN new_id TO id;
ALTER TABLE users ADD PRIMARY KEY (id);
```

### 2. Совместимость API

**Проблема:** Изменение типов ID сломает существующие клиенты
**Решение:** Постепенная миграция с поддержкой обоих форматов

```typescript
// Поддержка старого и нового формата
const parseId = (id: string | number): string => {
  if (typeof id === 'number') {
    // Конвертация старого числового ID в UUID
    return convertNumericIdToUUID(id);
  }
  return id;
};
```

### 3. Производительность

**Мониторинг:** После исправлений проверить:
- Время ответа API
- Использование памяти
- Нагрузку на БД

---

## 📞 ПОДДЕРЖКА И ВОПРОСЫ

### Полезные команды

```bash
# Проверка статуса БД
supabase status

# Просмотр логов
supabase logs

# Сброс БД (только для разработки!)
supabase db reset

# Генерация типов
supabase gen types typescript --local > packages/db-types/src/index.ts
```

### Контакты

- **Архитектура:** Проверить RPC функции в `supabase/migrations/020_create_trusted_rpc_functions.sql`
- **Типы:** Изучить `packages/db-types/src/index.ts`
- **Безопасность:** Проверить RLS политики в миграциях

---

## ✅ ЧЕКЛИСТ ЗАВЕРШЕНИЯ

- [ ] Все `parseInt()` для UUID исправлены
- [ ] Все прямые запросы к защищенным схемам заменены на RPC
- [ ] Фронтенд использует типы из `packages/db-types`
- [ ] Добавлена валидация UUID во всех эндпоинтах
- [ ] Созданы и применены новые RPC функции
- [ ] Все тесты проходят
- [ ] Проведено тестирование безопасности
- [ ] Документация обновлена
- [ ] Команда уведомлена о завершении

---

**Статус:** 🔴 КРИТИЧНО - Требует немедленного выполнения  
**Приоритет:** Максимальный  
**Время выполнения:** 1-2 дня  
**Риск:** Высокий (изменение типов данных)