# АУДИТ АРХИТЕКТУРЫ ROLEPLAY IDENTITY
## Отчет по синхронизации схем пользователей и миграций

**Дата аудита:** 2024-12-19  
**Версия проекта:** RolePlayIdentity  
**Аудитор:** Senior Developer Assistant  

---

## 🔍 ВЫЯВЛЕННЫЕ ПРОБЛЕМЫ

### 1. КРИТИЧЕСКИЕ РАССИНХРОНИЗАЦИИ

#### 1.1 Дублирование таблиц users
- **Проблема:** Обнаружены две разные таблицы users в разных миграциях
  - `migrations/0000_wooden_naoko.sql` - старая схема
  - `supabase/migrations/001_initial_schema.sql` - новая схема
- **Риск:** Конфликты при применении миграций, потеря данных
- **Статус:** 🔴 КРИТИЧНО

#### 1.2 Несоответствие типов owner_id в common.characters
- **Проблема:** В `common.characters` поле `owner_id` имеет тип `UUID`, но должно ссылаться на `public.users.id` (INTEGER)
- **Текущее состояние:**
  ```sql
  -- В 004_create_schemas.sql
  owner_id UUID NOT NULL,  -- ❌ НЕПРАВИЛЬНО
  ```
- **Должно быть:**
  ```sql
  owner_id INTEGER NOT NULL REFERENCES public.users(id),  -- ✅ ПРАВИЛЬНО
  ```
- **Риск:** Невозможность создания foreign key, нарушение целостности данных
- **Статус:** 🔴 КРИТИЧНО

#### 1.3 Отсутствующие поля в таблице users
- **Проблема:** В коде используются поля, которых нет в актуальной схеме БД:
  - `has_2fa` / `has2FA` - используется в коде, но отсутствует в миграциях
  - `is_dark_theme` / `isDarkTheme` - используется в коде, но отсутствует в миграциях
  - `sound_settings` - используется в коде, но отсутствует в миграциях
  - `api_token` - используется в коде, но отсутствует в миграциях
  - `cad_token` / `cadToken` - используется в коде, но отсутствует в миграциях
  - `discord_id`, `discord_access_token`, `discord_refresh_token` - используются в коде, но отсутствуют в миграциях

- **Статус:** 🟡 ВАЖНО

#### 1.4 Несоответствие типов между TypeScript и SQL
- **Проблема:** В `apps/server/types.ts` и `apps/server/lib/supabase.ts` разные определения типов для User
- **Пример:**
  ```typescript
  // types.ts
  has2FA: boolean;
  
  // supabase.ts  
  has_2fa?: boolean;  // ❌ Отсутствует в схеме
  ```
- **Статус:** 🟡 ВАЖНО

### 2. ПРОБЛЕМЫ С МИГРАЦИЯМИ

#### 2.1 Конфликтующие миграции
- **Проблема:** Миграции `migrations/` и `supabase/migrations/` могут конфликтовать
- **Риск:** Ошибки PGRST204, отсутствующие колонки
- **Статус:** 🔴 КРИТИЧНО

#### 2.2 Отсутствие триггера updated_at для users
- **Проблема:** Триггер `update_users_updated_at` создается в миграции, но может не работать корректно
- **Статус:** 🟡 ВАЖНО

### 3. ПРОБЛЕМЫ С СЕРВИСАМИ

#### 3.1 AuthService использует несуществующие поля
- **Проблема:** AuthService пытается обновлять поля, которых нет в БД:
  ```typescript
  // TODO: Добавить поле cadToken в схему пользователя
  await this.storage.updateUser(userId, { cadToken: token } as any);
  ```
- **Статус:** 🟡 ВАЖНО

#### 3.2 SupabaseStorage не обрабатывает новые поля
- **Проблема:** Адаптеры в SupabaseStorage не включают новые поля из миграции 014
- **Статус:** 🟡 ВАЖНО

#### 3.3 WebSocket аутентификация использует заглушки
- **Проблема:** WebSocket использует hardcoded токены вместо реальной аутентификации
  ```typescript
  if (token === 'demo-token' || token === 'test-token') {
    // ❌ Заглушка вместо реальной проверки
  }
  ```
- **Статус:** 🟡 ВАЖНО

---

## 📋 РЕКОМЕНДАЦИИ И TODO

### 🔴 КРИТИЧЕСКИЕ ЗАДАЧИ (Выполнить немедленно)

#### TODO 1: Исправить owner_id в common.characters
**Ответственный:** Разработчик  
**Приоритет:** КРИТИЧНО  
**Время:** 30 минут

```sql
-- Миграция для исправления owner_id
ALTER TABLE common.characters 
DROP CONSTRAINT IF EXISTS characters_owner_id_fkey;

ALTER TABLE common.characters 
ALTER COLUMN owner_id TYPE INTEGER USING owner_id::text::integer;

ALTER TABLE common.characters 
ADD CONSTRAINT characters_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.users(id);
```

#### TODO 2: Добавить недостающие поля в users
**Ответственный:** Разработчик  
**Приоритет:** КРИТИЧНО  
**Время:** 1 час

```sql
-- Миграция для добавления недостающих полей
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_2fa boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_dark_theme boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sound_settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cad_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_refresh_token text;

-- Добавляем уникальные индексы
CREATE UNIQUE INDEX IF NOT EXISTS users_api_token_unique ON users(api_token) WHERE api_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_cad_token_unique ON users(cad_token) WHERE cad_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_unique ON users(discord_id) WHERE discord_id IS NOT NULL;
```

#### TODO 3: Удалить дублирующие миграции
**Ответственный:** Разработчик  
**Приоритет:** КРИТИЧНО  
**Время:** 30 минут

- Удалить или переименовать `migrations/0000_wooden_naoko.sql`
- Убедиться, что все ссылки указывают на `supabase/migrations/`

### 🟡 ВАЖНЫЕ ЗАДАЧИ (Выполнить в течение дня)

#### TODO 4: Синхронизировать типы TypeScript
**Ответственный:** Разработчик  
**Приоритет:** ВАЖНО  
**Время:** 2 часа

- Обновить `apps/server/lib/supabase.ts` с актуальными типами
- Синхронизировать `apps/server/types.ts` с реальной схемой БД
- Убрать `as any` из AuthService

#### TODO 5: Исправить SupabaseStorage адаптеры
**Ответственный:** Разработчик  
**Приоритет:** ВАЖНО  
**Время:** 1 час

```typescript
// Обновить адаптеры в SupabaseStorage.ts
private adaptSupabaseUserToUser(supabaseUser: Tables<'users'>): User {
  return {
    // ... существующие поля
    has2FA: supabaseUser.has_2fa,
    isDarkTheme: supabaseUser.is_dark_theme,
    soundSettings: supabaseUser.sound_settings,
    apiToken: supabaseUser.api_token,
    cadToken: supabaseUser.cad_token,
    discordId: supabaseUser.discord_id,
    discordAccessToken: supabaseUser.discord_access_token,
    discordRefreshToken: supabaseUser.discord_refresh_token,
    // ...
  };
}
```

#### TODO 6: Реализовать реальную WebSocket аутентификацию
**Ответственный:** Разработчик  
**Приоритет:** ВАЖНО  
**Время:** 2 часа

```typescript
// Заменить заглушку в websocket.ts
private async handleAuthentication(clientId: string, data: any) {
  const { token } = data;
  
  // Реальная проверка токена
  const result = await authService.validateApiToken(token);
  if (!result.valid) {
    this.sendError(clientId, 'Invalid authentication token');
    return;
  }
  
  // Установка пользователя
  client.userId = result.user.id;
  // ...
}
```

### 🟢 ОБЫЧНЫЕ ЗАДАЧИ (Выполнить в течение недели)

#### TODO 7: Добавить тесты для синхронизации
**Ответственный:** QA/Разработчик  
**Приоритет:** ОБЫЧНО  
**Время:** 4 часа

- Тесты на соответствие схемы и типов
- Тесты на работу AuthService с реальными полями
- Тесты на WebSocket аутентификацию

#### TODO 8: Документация архитектуры
**Ответственный:** Технический писатель  
**Приоритет:** ОБЫЧНО  
**Время:** 2 часа

- Обновить документацию по схемам
- Описать процесс синхронизации типов
- Создать руководство по миграциям

---

## 🔧 SQL МИГРАЦИИ ДЛЯ СИНХРОНИЗАЦИИ

### Миграция 1: Исправление common.characters
```sql
-- 015_fix_common_characters_owner_id.sql
BEGIN;

-- Удаляем существующие ограничения
ALTER TABLE common.characters 
DROP CONSTRAINT IF EXISTS characters_owner_id_fkey;

-- Изменяем тип колонки
ALTER TABLE common.characters 
ALTER COLUMN owner_id TYPE INTEGER USING owner_id::text::integer;

-- Добавляем правильное ограничение
ALTER TABLE common.characters 
ADD CONSTRAINT characters_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMIT;
```

### Миграция 2: Добавление недостающих полей
```sql
-- 016_add_missing_user_fields.sql
BEGIN;

-- Добавляем недостающие поля
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_2fa boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_dark_theme boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sound_settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cad_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_refresh_token text;

-- Добавляем уникальные индексы
CREATE UNIQUE INDEX IF NOT EXISTS users_api_token_unique ON users(api_token) WHERE api_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_cad_token_unique ON users(cad_token) WHERE cad_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_unique ON users(discord_id) WHERE discord_id IS NOT NULL;

-- Добавляем комментарии
COMMENT ON COLUMN users.has_2fa IS 'Двухфакторная аутентификация';
COMMENT ON COLUMN users.is_dark_theme IS 'Темная тема интерфейса';
COMMENT ON COLUMN users.sound_settings IS 'Настройки звука пользователя';
COMMENT ON COLUMN users.api_token IS 'API токен для внешних интеграций';
COMMENT ON COLUMN users.cad_token IS 'Токен для авторизации из игры';
COMMENT ON COLUMN users.discord_id IS 'Discord ID пользователя';
COMMENT ON COLUMN users.discord_access_token IS 'Discord access token';
COMMENT ON COLUMN users.discord_refresh_token IS 'Discord refresh token';

COMMIT;
```

### Миграция 3: Проверка целостности
```sql
-- 017_verify_integrity.sql
BEGIN;

-- Проверяем, что все foreign keys корректны
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema IN ('public', 'common', 'mdt')
        AND ccu.table_name = 'users'
    ) LOOP
        RAISE NOTICE 'Foreign key: %.% -> %.%', 
            r.table_name, r.column_name, 
            r.foreign_table_name, r.foreign_column_name;
    END LOOP;
END $$;

COMMIT;
```

---

## 📚 BEST PRACTICES ДЛЯ АРХИТЕКТУРЫ

### 1. Управление схемами
- ✅ **Единственная таблица users** только в схеме `public`
- ✅ **Ссылки на пользователей** только через `public.users.id`
- ✅ **Схема common** для общих сущностей (characters, vehicles)
- ✅ **Схема mdt** для сервисных сущностей

### 2. Синхронизация типов
- ✅ **Автоматическая генерация типов** из схемы БД
- ✅ **Единый источник истины** для типов
- ✅ **Валидация типов** на этапе компиляции

### 3. Миграции
- ✅ **Последовательная нумерация** миграций
- ✅ **Проверка целостности** после каждой миграции
- ✅ **Откат миграций** при ошибках

### 4. Аутентификация
- ✅ **Единая точка входа** через AuthService
- ✅ **Валидация токенов** по auth_id
- ✅ **Синхронизация** между Supabase и локальной БД

### 5. WebSocket
- ✅ **Реальная аутентификация** вместо заглушек
- ✅ **Проверка разрешений** для каждого события
- ✅ **Логирование** всех операций

---

## 🎯 ЦЕЛИ АУДИТА

✅ **Гарантировать единственность таблицы users**  
✅ **Синхронизировать все типы и схемы**  
✅ **Исправить все foreign keys**  
✅ **Реализовать корректную аутентификацию**  
✅ **Обеспечить работоспособность миграций**  

---

**Статус аудита:** 🔴 ТРЕБУЕТ НЕМЕДЛЕННОГО ВНИМАНИЯ  
**Следующий аудит:** После выполнения критических задач  
**Подпись аудитора:** Senior Developer Assistant 