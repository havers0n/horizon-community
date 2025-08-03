# АУДИТ СООТВЕТСТВИЯ БЭКЕНДА И ФРОНТЕНДА
## Проект RolePlayIdentity

**Дата аудита:** $(date)  
**Версия:** 1.0  
**Статус:** КРИТИЧЕСКИЕ НАРУШЕНИЯ ОБНАРУЖЕНЫ

---

## 🔴 КРИТИЧЕСКИЕ НАРУШЕНИЯ ЗОЛОТЫХ ПРАВИЛ

### 1. НАРУШЕНИЕ ПРАВИЛА UUID (КРИТИЧНО)

**Проблема:** Массовое использование `parseInt()` для ID в бэкенде

**Нарушения найдены в:**
- `apps/server/routes.ts:225` - `const id = parseInt(req.params.id);`
- `apps/server/routes.ts:458` - `const id = parseInt(req.params.id);`
- `apps/server/routes.ts:474` - `const id = parseInt(req.params.id);`
- `apps/server/routes.ts:520` - `const id = parseInt(req.params.id);`
- `apps/server/routes.ts:547` - `const id = parseInt(req.params.id);`
- `apps/server/routes.ts:716` - `const id = parseInt(req.params.id);`
- `apps/server/routes.ts:764` - `const reportId = parseInt(req.params.id);`
- `apps/server/routes.ts:850` - `const userId = parseInt(req.params.userId);`
- `apps/server/routes.ts:897` - `const id = parseInt(req.params.id);`

**Дополнительные нарушения:**
- `apps/server/routes/forum.ts` - множественные `Number(categoryId)`, `Number(topicId)`
- `apps/server/routes/filledReports.ts` - множественные `parseInt(id)`
- `apps/server/routes/tests.ts` - множественные `parseInt(req.params.id)`
- `apps/server/routes/cad.ts` - множественные `parseInt(req.params.id)`

**Влияние:** Полное нарушение архитектуры UUID, потенциальные ошибки типизации

### 2. НАРУШЕНИЕ ПРАВИЛА RPC/RLS (КРИТИЧНО)

**Проблема:** Фронтенд делает прямые запросы к защищенным схемам

**Нарушения найдены в:**
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:30` - `.from('characters')`
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:54` - `.from('characters')`
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:77` - `.from('characters')`
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:96` - `.from('characters')`
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:113` - `.from('mdt_calls_911')`
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:131` - `.from('vehicles')`
- `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts:147` - `.from('weapons')`

**Влияние:** Нарушение безопасности, прямой доступ к данным без проверки прав

### 3. НАРУШЕНИЕ ПРАВИЛА ЕДИНОГО ИСТОЧНИКА ТИПОВ (КРИТИЧНО)

**Проблема:** Фронтенд не использует типы из `packages/db-types`

**Нарушения найдены в:**
- `apps/client/src/lib/supabase.ts` - НЕТ импорта типов из db-types
- `apps/mdtclient/src/lib/supabase.ts` - НЕТ импорта типов из db-types
- `apps/client/src/types.ts` - Локальные типы вместо db-types
- `apps/mdtclient/src/shared/types/index.ts` - Локальные типы вместо db-types

**Влияние:** Рассинхронизация типов, потенциальные ошибки компиляции

### 4. НАРУШЕНИЕ ПРАВИЛА БЕЗОПАСНОСТИ (КРИТИЧНО)

**Проблема:** Бэкенд делает прямые запросы к таблицам в защищенных схемах

**Нарушения найдены в:**
- `apps/server/services/UserService.ts` - множественные `.from('profiles')`
- `apps/server/services/AuthService.ts` - множественные `.from('profiles')`
- `apps/server/middleware/auth.middleware.ts` - `.from('profiles')`

**Влияние:** Нарушение архитектуры безопасности, обход RPC

---

## 🟡 СЕРЬЕЗНЫЕ НАРУШЕНИЯ

### 5. НАРУШЕНИЕ ПРАВИЛА КОНСИСТЕНТНОСТИ КОДА

**Проблема:** Массовое использование `any` типов

**Нарушения найдены в:**
- `apps/server/websocket.ts` - 20+ использований `any`
- `apps/server/types.ts` - множественные `any` типы
- `apps/server/types/supabase.ts` - множественные `any` типы
- `libs/shared-types/src/index.ts` - множественные `any` типы

**Влияние:** Потеря типизации, технический долг

### 6. НАРУШЕНИЕ ПРАВИЛА АДАПТЕРОВ

**Проблема:** Отсутствие централизованных адаптеров для преобразования типов

**Нарушения найдены в:**
- `apps/client/src/lib/adapters.ts:61` - `parseInt(backendUser.id.replace(/-/g, '').substring(0, 8), 16)`
- `apps/client/src/lib/adapters.ts:68` - `parseInt(backendApp.id.replace(/-/g, '').substring(0, 8), 16)`

**Влияние:** Временные решения, нарушение архитектуры

---

## 🟢 ПОЛОЖИТЕЛЬНЫЕ АСПЕКТЫ

### 1. Правильное использование RPC в бэкенде
- `apps/server/services/CharacterService.ts` - корректное использование `.rpc()`
- `apps/server/services/MDTService.ts` - корректное использование `.rpc()`

### 2. Правильная структура типов БД
- `packages/db-types/src/index.ts` - корректно сгенерированные типы
- Все ID в схеме БД используют UUID

### 3. Правильное разделение схем
- `public`, `common`, `mdt` схемы корректно разделены
- RPC функции в схеме `public`

---

## 📋 ПЛАН ИСПРАВЛЕНИЙ

### Приоритет 1 (КРИТИЧНО) - Немедленное исправление

1. **Исправить все `parseInt()` для ID**
   ```typescript
   // БЫЛО:
   const id = parseInt(req.params.id);
   
   // ДОЛЖНО БЫТЬ:
   const id = req.params.id; // string для UUID
   ```

2. **Создать RPC функции для всех операций с данными**
   ```sql
   -- Создать RPC функции в схеме public для всех операций
   CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
   RETURNS TABLE(...) AS $$
   BEGIN
     SET search_path TO public, common, mdt;
     RETURN QUERY SELECT ... FROM profiles WHERE id = p_user_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

3. **Обновить фронтенд для использования API вместо прямых запросов**
   ```typescript
   // БЫЛО:
   const { data } = await supabase.from('characters').select();
   
   // ДОЛЖНО БЫТЬ:
   const response = await fetch('/api/characters');
   const data = await response.json();
   ```

### Приоритет 2 (ВАЖНО) - В течение недели

4. **Интегрировать типы из db-types во фронтенд**
   ```typescript
   // apps/client/src/lib/supabase.ts
   import type { Database } from '../../../packages/db-types/src/index';
   
   export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
   ```

5. **Создать централизованные адаптеры**
   ```typescript
   // apps/client/src/lib/adapters.ts
   export const adaptBackendUser = (backendUser: any): User => ({
     id: backendUser.id, // UUID остается UUID
     // ... остальные поля
   });
   ```

### Приоритет 3 (СРЕДНИЙ) - В течение месяца

6. **Устранить все `any` типы**
7. **Добавить строгую типизацию для всех API**
8. **Создать тесты для проверки соответствия типов**

---

## 🔧 КОНКРЕТНЫЕ КОМАНДЫ ДЛЯ ИСПРАВЛЕНИЯ

### 1. Обновить типы БД
```bash
supabase gen types typescript --linked > packages/db-types/src/index.ts
```

### 2. Создать RPC функции
```sql
-- apps/server/migrations/create_rpc_functions.sql
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  SET search_path TO public;
  RETURN QUERY SELECT p.id, p.username, p.email, p.role, p.created_at
  FROM profiles p WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Обновить бэкенд сервисы
```typescript
// apps/server/services/UserService.ts
async getUserById(id: string): Promise<User | null> {
  const { data, error } = await this.supabase
    .rpc('get_user_profile', { p_user_id: id });
  
  if (error) throw error;
  return data?.[0] || null;
}
```

---

## 📊 СТАТИСТИКА НАРУШЕНИЙ

- **Критических нарушений:** 4
- **Серьезных нарушений:** 2
- **Файлов с нарушениями:** 15+
- **Строк кода с нарушениями:** 50+

---

## ⚠️ РЕКОМЕНДАЦИИ

1. **НЕМЕДЛЕННО** остановить разработку новых функций
2. **ПРИОРИТЕТНО** исправить все `parseInt()` для ID
3. **СРОЧНО** создать RPC функции для всех операций с данными
4. **ПЛАНОВО** интегрировать типы из db-types во фронтенд
5. **ПОСТЕПЕННО** устранить все `any` типы

---

**Заключение:** Проект имеет серьезные архитектурные нарушения, требующие немедленного исправления. Рекомендуется приостановить разработку новых функций до устранения критических нарушений. 