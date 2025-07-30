# BEST PRACTICES ДЛЯ АРХИТЕКТУРЫ С НЕСКОЛЬКИМИ СХЕМАМИ

## 🏗️ ОСНОВНЫЕ ПРИНЦИПЫ

### 1. Управление схемами
```
public/     - Основная схема, только здесь таблица users
common/     - Общие сущности (characters, vehicles, departments)
mdt/        - Сервисные сущности для MDT-системы
```

### 2. Единственность таблицы users
- ✅ **Только в public.users** - никаких дублей в других схемах
- ✅ **Ссылки через public.users.id** - все foreign keys указывают сюда
- ✅ **auth_id для Supabase** - связь с auth.users через UUID

### 3. Синхронизация типов
- ✅ **Автогенерация из схемы** - типы TypeScript из БД
- ✅ **Единый источник истины** - схема БД определяет типы
- ✅ **Валидация на компиляции** - TypeScript проверяет соответствие

---

## 📋 ПРАВИЛА МИГРАЦИЙ

### 1. Нумерация
```sql
-- Последовательная нумерация
001_initial_schema.sql
002_add_features.sql
003_fix_issues.sql
```

### 2. Безопасность
```sql
-- Всегда используйте транзакции
BEGIN;
-- Ваши изменения
COMMIT;

-- Проверяйте существование
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name type;
```

### 3. Обратная совместимость
```sql
-- Добавляйте поля с дефолтными значениями
ALTER TABLE users ADD COLUMN new_field TEXT DEFAULT 'default_value';

-- Не удаляйте поля без миграции данных
-- Сначала переименуйте, потом удалите
```

---

## 🔐 АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ

### 1. AuthService
```typescript
// Единая точка входа для аутентификации
class AuthService {
  async authenticate(token: string): Promise<AuthUser>
  async validateApiToken(token: string): Promise<TokenValidationResult>
  async syncUser(supabaseUser: any): Promise<AuthUser>
}
```

### 2. Синхронизация с Supabase
```typescript
// Поиск пользователя строго по auth_id
async getUserByAuthId(authId: string): Promise<User | undefined> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();
  return data ? this.adaptSupabaseUserToUser(data) : undefined;
}
```

### 3. WebSocket аутентификация
```typescript
// Реальная проверка токенов, не заглушки
private async handleAuthentication(clientId: string, data: any) {
  const result = await authService.validateApiToken(data.token);
  if (!result.valid) {
    this.sendError(clientId, 'Invalid token');
    return;
  }
  // Установка пользователя
}
```

---

## 🗄️ УПРАВЛЕНИЕ ДАННЫМИ

### 1. Foreign Keys
```sql
-- Правильные ссылки на users
ALTER TABLE common.characters 
ADD CONSTRAINT characters_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- НЕПРАВИЛЬНО: ссылка на UUID
owner_id UUID NOT NULL,  -- ❌
```

### 2. Индексы
```sql
-- Уникальные индексы для токенов
CREATE UNIQUE INDEX users_api_token_unique ON users(api_token) WHERE api_token IS NOT NULL;
CREATE UNIQUE INDEX users_cad_token_unique ON users(cad_token) WHERE cad_token IS NOT NULL;
CREATE UNIQUE INDEX users_discord_id_unique ON users(discord_id) WHERE discord_id IS NOT NULL;
```

### 3. Триггеры
```sql
-- Автоматическое обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔧 РАЗРАБОТКА

### 1. Типы TypeScript
```typescript
// Синхронизированные типы с БД
export interface User {
  id: number;
  username: string;
  email: string;
  authId: string;
  has2FA: boolean;
  isDarkTheme: boolean;
  soundSettings: any;
  apiToken?: string;
  cadToken?: string;
  discordId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Адаптеры в SupabaseStorage
```typescript
// Корректное преобразование типов
private adaptSupabaseUserToUser(supabaseUser: Tables<'users'>): User {
  return {
    id: supabaseUser.id,
    username: supabaseUser.username,
    email: supabaseUser.email,
    authId: supabaseUser.auth_id,
    has2FA: supabaseUser.has_2fa,
    isDarkTheme: supabaseUser.is_dark_theme,
    soundSettings: supabaseUser.sound_settings,
    apiToken: supabaseUser.api_token,
    cadToken: supabaseUser.cad_token,
    discordId: supabaseUser.discord_id,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at)
  };
}
```

### 3. Валидация данных
```typescript
// Проверка на этапе компиляции
const userSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  authId: z.string().uuid(),
  has2FA: z.boolean().default(false),
  isDarkTheme: z.boolean().default(false)
});
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 1. Тесты схемы
```typescript
describe('Database Schema', () => {
  it('should have correct users table structure', async () => {
    const columns = await getTableColumns('users');
    expect(columns).toContain('has_2fa');
    expect(columns).toContain('is_dark_theme');
    expect(columns).toContain('api_token');
  });
});
```

### 2. Тесты миграций
```typescript
describe('Migrations', () => {
  it('should apply all migrations without errors', async () => {
    const result = await applyMigrations();
    expect(result.success).toBe(true);
  });
});
```

### 3. Тесты целостности
```typescript
describe('Data Integrity', () => {
  it('should maintain foreign key constraints', async () => {
    const fks = await getForeignKeys();
    expect(fks.every(fk => fk.references === 'public.users')).toBe(true);
  });
});
```

---

## 🚨 ЧАСТЫЕ ОШИБКИ

### 1. Дублирование таблиц
```sql
-- ❌ НЕПРАВИЛЬНО: две таблицы users
CREATE TABLE users (...);  -- в одной схеме
CREATE TABLE users (...);  -- в другой схеме

-- ✅ ПРАВИЛЬНО: только одна таблица users в public
CREATE TABLE public.users (...);
```

### 2. Неправильные типы
```sql
-- ❌ НЕПРАВИЛЬНО: UUID для ссылки на INTEGER
owner_id UUID REFERENCES public.users(id)

-- ✅ ПРАВИЛЬНО: INTEGER для ссылки на INTEGER
owner_id INTEGER REFERENCES public.users(id)
```

### 3. Отсутствие полей
```typescript
// ❌ НЕПРАВИЛЬНО: поле используется в коде, но отсутствует в БД
user.has2FA = true;  // Ошибка компиляции

// ✅ ПРАВИЛЬНО: поле существует в БД и коде
user.has2FA = true;  // Работает корректно
```

---

## 📚 РЕСУРСЫ

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/)
- [TypeScript Database Types](https://www.typescriptlang.org/docs/)
- [Architecture Audit Report](./ARCHITECTURE_AUDIT_REPORT.md)

---

**Последнее обновление:** 2024-12-19  
**Версия:** 1.0  
**Автор:** Senior Developer Assistant 