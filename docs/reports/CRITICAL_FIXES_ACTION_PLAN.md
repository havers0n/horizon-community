# ПЛАН ИСПРАВЛЕНИЯ КРИТИЧЕСКИХ НАРУШЕНИЙ
## RolePlayIdentity - Детальный Action Plan

**Приоритет:** КРИТИЧНО  
**Время выполнения:** 2-3 дня  
**Статус:** ТРЕБУЕТ НЕМЕДЛЕННОГО ВЫПОЛНЕНИЯ

---

## 🚨 ЭТАП 1: ИСПРАВЛЕНИЕ UUID НАРУШЕНИЙ (ДЕНЬ 1)

### 1.1 Исправить `apps/server/routes.ts`

**Найти и заменить ВСЕ вхождения:**
```typescript
// БЫЛО:
const id = parseInt(req.params.id);
const userId = parseInt(req.params.userId);
const reportId = parseInt(req.params.id);

// ДОЛЖНО БЫТЬ:
const id = req.params.id;
const userId = req.params.userId;
const reportId = req.params.id;
```

**Конкретные строки для исправления:**
- Line 225: `const id = parseInt(req.params.id);`
- Line 458: `const id = parseInt(req.params.id);`
- Line 474: `const id = parseInt(req.params.id);`
- Line 520: `const id = parseInt(req.params.id);`
- Line 547: `const id = parseInt(req.params.id);`
- Line 716: `const id = parseInt(req.params.id);`
- Line 764: `const reportId = parseInt(req.params.id);`
- Line 850: `const userId = parseInt(req.params.userId);`
- Line 897: `const id = parseInt(req.params.id);`

### 1.2 Исправить `apps/server/routes/forum.ts`

**Найти и заменить ВСЕ вхождения:**
```typescript
// БЫЛО:
Number(categoryId)
Number(topicId)
Number(postId)

// ДОЛЖНО БЫТЬ:
categoryId
topicId
postId
```

### 1.3 Исправить `apps/server/routes/filledReports.ts`

**Найти и заменить ВСЕ вхождения:**
```typescript
// БЫЛО:
parseInt(id)

// ДОЛЖНО БЫТЬ:
id
```

### 1.4 Исправить `apps/server/routes/tests.ts`

**Найти и заменить ВСЕ вхождения:**
```typescript
// БЫЛО:
parseInt(req.params.id)

// ДОЛЖНО БЫТЬ:
req.params.id
```

### 1.5 Исправить `apps/server/routes/cad.ts`

**Найти и заменить ВСЕ вхождения:**
```typescript
// БЫЛО:
parseInt(req.params.id)

// ДОЛЖНО БЫТЬ:
req.params.id
```

---

## 🚨 ЭТАП 2: СОЗДАНИЕ RPC ФУНКЦИЙ (ДЕНЬ 1-2)

### 2.1 Создать файл `supabase/migrations/20241201_create_rpc_functions.sql`

```sql
-- RPC функции для работы с профилями пользователей
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

-- RPC функция для получения всех пользователей
CREATE OR REPLACE FUNCTION get_all_users()
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
  FROM profiles p ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC функция для обновления профиля пользователя
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  SET search_path TO public;
  
  UPDATE profiles 
  SET 
    username = COALESCE(p_username, username),
    email = COALESCE(p_email, email),
    role = COALESCE(p_role, role)
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT p.id, p.username, p.email, p.role, p.created_at
  FROM profiles p WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC функция для создания уведомления
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_content TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  recipient_user_id UUID,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  SET search_path TO public;
  
  RETURN QUERY 
  INSERT INTO notifications (recipient_user_id, content, link, is_read)
  VALUES (p_recipient_id, p_content, p_link, false)
  RETURNING id, content, recipient_user_id, is_read, created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC функция для получения уведомлений пользователя
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  content TEXT,
  recipient_user_id UUID,
  is_read BOOLEAN,
  link TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  SET search_path TO public;
  
  RETURN QUERY SELECT n.id, n.content, n.recipient_user_id, n.is_read, n.link, n.created_at
  FROM notifications n 
  WHERE n.recipient_user_id = p_user_id
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 Применить миграцию

```bash
cd supabase
supabase db push
```

---

## 🚨 ЭТАП 3: ОБНОВЛЕНИЕ БЭКЕНД СЕРВИСОВ (ДЕНЬ 2)

### 3.1 Обновить `apps/server/services/UserService.ts`

```typescript
// Заменить все .from('profiles') на RPC вызовы

async getUserById(id: string): Promise<User | null> {
  const { data, error } = await this.supabase
    .rpc('get_user_profile', { p_user_id: id });
  
  if (error) throw error;
  return data?.[0] || null;
}

async getAllUsers(): Promise<User[]> {
  const { data, error } = await this.supabase
    .rpc('get_all_users');
  
  if (error) throw error;
  return data || [];
}

async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await this.supabase
    .rpc('update_user_profile', {
      p_user_id: id,
      p_username: updates.username,
      p_email: updates.email,
      p_role: updates.role
    });
  
  if (error) throw error;
  return data?.[0] || null;
}
```

### 3.2 Обновить `apps/server/services/AuthService.ts`

```typescript
// Заменить все .from('profiles') на RPC вызовы

async getUserById(id: string): Promise<AuthUser | null> {
  const { data, error } = await this.supabase
    .rpc('get_user_profile', { p_user_id: id });
  
  if (error) throw error;
  return data?.[0] ? this.adaptProfileToAuthUser(data[0]) : null;
}
```

### 3.3 Обновить `apps/server/middleware/auth.middleware.ts`

```typescript
// Заменить .from('profiles') на RPC вызов

async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .rpc('get_user_profile', { p_user_id: userId });
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data?.[0] || null;
}
```

---

## 🚨 ЭТАП 4: ОБНОВЛЕНИЕ ФРОНТЕНДА (ДЕНЬ 2-3)

### 4.1 Обновить `apps/client/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../packages/db-types/src/index'

// СТРОГАЯ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ДЛЯ БЕЗОПАСНОСТИ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// КРИТИЧЕСКАЯ ПРОВЕРКА БЕЗОПАСНОСТИ
if (!supabaseUrl) {
  console.error('[SECURITY] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_URL отсутствует!')
  throw new Error('VITE_SUPABASE_URL environment variable is required')
}

if (!supabaseAnonKey) {
  console.error('[SECURITY] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_ANON_KEY отсутствует!')
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 4.2 Обновить `apps/mdtclient/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../packages/db-types/src/index'

// СТРОГАЯ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ДЛЯ БЕЗОПАСНОСТИ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// КРИТИЧЕСКАЯ ПРОВЕРКА БЕЗОПАСНОСТИ
if (!supabaseUrl) {
  console.error('[SECURITY] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_URL отсутствует!')
  throw new Error('VITE_SUPABASE_URL environment variable is required')
}

if (!supabaseAnonKey) {
  console.error('[SECURITY] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_ANON_KEY отсутствует!')
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
export const mdtClient = supabase
```

### 4.3 Создать API сервисы для фронтенда

#### 4.3.1 Создать `apps/client/src/services/api.ts`

```typescript
import type { Database } from '../../../packages/db-types/src/index'

type Profile = Database['public']['Tables']['profiles']['Row']
type Character = Database['common']['Tables']['characters']['Row']

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Профили пользователей
  async getUserProfile(userId: string): Promise<Profile> {
    return this.request<Profile>(`/users/${userId}`)
  }

  async updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Персонажи
  async getCharacters(): Promise<Character[]> {
    return this.request<Character[]>('/characters')
  }

  async getCharacter(id: string): Promise<Character> {
    return this.request<Character>(`/characters/${id}`)
  }

  async createCharacter(data: Partial<Character>): Promise<Character> {
    return this.request<Character>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const apiService = new ApiService()
```

#### 4.3.2 Создать `apps/mdtclient/src/services/api.ts`

```typescript
import type { Database } from '../../../packages/db-types/src/index'

type Character = Database['common']['Tables']['characters']['Row']
type Call = Database['mdt']['Tables']['calls']['Row']
type Vehicle = Database['common']['Tables']['vehicles']['Row']
type Weapon = Database['common']['Tables']['weapons']['Row']

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class MDTApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Персонажи
  async getCharacters(): Promise<Character[]> {
    return this.request<Character[]>('/characters')
  }

  async getCharacter(id: string): Promise<Character> {
    return this.request<Character>(`/characters/${id}`)
  }

  async createCharacter(data: Partial<Character>): Promise<Character> {
    return this.request<Character>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Вызовы
  async getCalls(): Promise<Call[]> {
    return this.request<Call[]>('/calls')
  }

  async createCall(data: Partial<Call>): Promise<Call> {
    return this.request<Call>('/calls', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Транспорт
  async getVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicles')
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Оружие
  async getWeapons(): Promise<Weapon[]> {
    return this.request<Weapon[]>('/weapons')
  }

  async createWeapon(data: Partial<Weapon>): Promise<Weapon> {
    return this.request<Weapon>('/weapons', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const mdtApiService = new MDTApiService()
```

### 4.4 Обновить `apps/mdtclient/src/features/citizen-portal/api/citizenApi.ts`

```typescript
import { mdtApiService } from '../../../services/api'
import type { Database } from '../../../../packages/db-types/src/index'

type Character = Database['common']['Tables']['characters']['Row']
type Call = Database['mdt']['Tables']['calls']['Row']
type Vehicle = Database['common']['Tables']['vehicles']['Row']
type Weapon = Database['common']['Tables']['weapons']['Row']

export class CitizenApi {
  // Создание персонажа
  static async createCharacter(data: Partial<Character>): Promise<Character> {
    console.log('[CitizenApi] Создание персонажа:', data)
    
    try {
      const character = await mdtApiService.createCharacter(data)
      console.log('[CitizenApi] Персонаж создан успешно:', character)
      return character
    } catch (error) {
      console.error('[CitizenApi] Ошибка при создании персонажа:', error)
      throw error
    }
  }

  // Обновление персонажа
  static async updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
    console.log('[CitizenApi] Обновление персонажа:', id, data)
    
    try {
      const character = await mdtApiService.updateCharacter(id, data)
      console.log('[CitizenApi] Персонаж обновлен успешно:', character)
      return character
    } catch (error) {
      console.error('[CitizenApi] Ошибка при обновлении персонажа:', error)
      throw error
    }
  }

  // Получение персонажа по ID
  static async getCharacter(id: string): Promise<Character> {
    console.log('[CitizenApi] Получение персонажа по ID:', id)
    
    try {
      const character = await mdtApiService.getCharacter(id)
      console.log('[CitizenApi] Персонаж получен успешно:', character)
      return character
    } catch (error) {
      console.error('[CitizenApi] Ошибка при получении персонажа:', error)
      throw error
    }
  }

  // Получение персонажей пользователя
  static async getUserCharacters(ownerId: string): Promise<Character[]> {
    console.log('[CitizenApi] Получение персонажей пользователя:', ownerId)
    
    try {
      const characters = await mdtApiService.getCharacters()
      const userCharacters = characters.filter(c => c.owner_id === ownerId)
      console.log('[CitizenApi] Персонажи пользователя получены успешно:', userCharacters)
      return userCharacters
    } catch (error) {
      console.error('[CitizenApi] Ошибка при получении персонажей пользователя:', error)
      throw error
    }
  }

  // Создание экстренного вызова
  static async createEmergencyCall(data: Partial<Call>): Promise<Call> {
    try {
      const call = await mdtApiService.createCall(data)
      return call
    } catch (error) {
      console.error('[CitizenApi] Ошибка при создании вызова:', error)
      throw error
    }
  }

  // Регистрация транспорта
  static async registerVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const vehicle = await mdtApiService.createVehicle(data)
      return vehicle
    } catch (error) {
      console.error('[CitizenApi] Ошибка при регистрации транспорта:', error)
      throw error
    }
  }

  // Регистрация оружия
  static async registerWeapon(data: Partial<Weapon>): Promise<Weapon> {
    try {
      const weapon = await mdtApiService.createWeapon(data)
      return weapon
    } catch (error) {
      console.error('[CitizenApi] Ошибка при регистрации оружия:', error)
      throw error
    }
  }
}
```

---

## 🚨 ЭТАП 5: ИСПРАВЛЕНИЕ АДАПТЕРОВ (ДЕНЬ 3)

### 5.1 Обновить `apps/client/src/lib/adapters.ts`

```typescript
import type { Database } from '../../../packages/db-types/src/index'

type Profile = Database['public']['Tables']['profiles']['Row']
type Application = Database['mdt']['Tables']['applications']['Row']

export interface User {
  id: string // UUID
  username: string | null
  email: string | null
  role: string
  createdAt: string | null
}

export interface ApplicationData {
  id: string // UUID
  authorId: string // UUID
  type: string
  status: string
  data: any
  createdAt: string | null
}

// Адаптер для пользователя - UUID остается UUID
export const adaptBackendUser = (backendUser: Profile): User => ({
  id: backendUser.id, // UUID остается UUID
  username: backendUser.username,
  email: backendUser.email,
  role: backendUser.role,
  createdAt: backendUser.created_at,
})

// Адаптер для заявки - UUID остается UUID
export const adaptBackendApplication = (backendApp: Application): ApplicationData => ({
  id: backendApp.id, // UUID остается UUID
  authorId: backendApp.author_user_id, // UUID остается UUID
  type: backendApp.type,
  status: backendApp.status,
  data: backendApp.data,
  createdAt: backendApp.created_at,
})
```

---

## 🔧 КОМАНДЫ ДЛЯ ВЫПОЛНЕНИЯ

### 1. Обновить типы БД
```bash
cd supabase
supabase gen types typescript --linked > ../packages/db-types/src/index.ts
```

### 2. Применить миграции
```bash
cd supabase
supabase db push
```

### 3. Пересобрать проект
```bash
npm run build
```

### 4. Запустить тесты
```bash
npm run test
```

---

## ✅ КРИТЕРИИ УСПЕШНОГО ВЫПОЛНЕНИЯ

1. **Все `parseInt()` для ID заменены на прямые строки**
2. **Все `.from()` запросы в бэкенде заменены на `.rpc()`**
3. **Фронтенд использует API вместо прямых запросов к БД**
4. **Все клиенты Supabase типизированы с `Database`**
5. **Адаптеры не используют `parseInt()` для UUID**
6. **Проект собирается без ошибок TypeScript**
7. **Все тесты проходят**

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **НЕ ИСПОЛЬЗУЙТЕ `parseInt()` для UUID**
2. **ВСЕ ID должны быть типа `string`**
3. **Бэкенд должен использовать только RPC функции**
4. **Фронтенд должен использовать только API**
5. **Все типы должны импортироваться из `packages/db-types`**

---

**Статус:** Готов к выполнению  
**Приоритет:** КРИТИЧНО  
**Время выполнения:** 2-3 дня 