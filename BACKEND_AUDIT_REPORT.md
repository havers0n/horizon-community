# АУДИТ БЭКЕНДА И БАЗЫ ДАННЫХ
## Отчет по синхронизации с новым фронтендом

**Дата аудита:** $(date)  
**Версия фронтенда:** Новый рефакторинг с "золотыми типами"  
**Статус:** Требует синхронизации

---

## 📋 СОДЕРЖАНИЕ

1. [Аудит API эндпоинтов](#аудит-api-эндпоинтов)
2. [Аудит схемы базы данных](#аудит-схемы-базы-данных)
3. [Критические несоответствия](#критические-несоответствия)
4. [План синхронизации](#план-синхронизации)
5. [Рекомендации](#рекомендации)

---

## 🔍 АУДИТ API ЭНДПОИНТОВ

### 1. MDT API (`/api/mdt/*`)

#### ✅ Соответствует золотым типам:

**GET /api/mdt/units**
- Возвращает: `MDTUnit[]` с полями `id`, `unitNumber`, `departmentId`, `status`, `location`
- Соответствует типу `Unit` из золотых типов
- Статус: ✅ **СООТВЕТСТВУЕТ**

**POST /api/mdt/units**
- Принимает: `CreateUnitData` с `characterId`, `unitNumber`, `departmentId`
- Соответствует типу `Unit` из золотых типов
- Статус: ✅ **СООТВЕТСТВУЕТ**

**PUT /api/mdt/units/:id/status**
- Обновляет статус юнита
- Соответствует типу `UnitStatus` из золотых типов
- Статус: ✅ **СООТВЕТСТВУЕТ**

#### 🟡 Частично соответствует:

**GET /api/mdt/calls**
- Возвращает: `MDTCall911[]` 
- **Проблема:** Поле `caller` вместо `callerName` и `callerPhone`
- **Проблема:** Отсутствует поле `priority` в правильном формате
- Статус: 🟡 **ЧАСТИЧНО СООТВЕТСТВУЕТ**

**POST /api/mdt/calls**
- Принимает: `CreateCallData`
- **Проблема:** Поле `type` вместо `priority` в правильном формате
- Статус: 🟡 **ЧАСТИЧНО СООТВЕТСТВУЕТ**

### 2. CAD API (`/api/cad/*`)

#### 🔴 Не соответствует золотым типам:

**GET /api/cad/characters**
- Возвращает: `Character[]` с полями `firstName`, `lastName`, `departmentId`
- **Проблема:** Поле `firstName` вместо `name`, `lastName` вместо `surname`
- **Проблема:** Отсутствуют поля `dateOfBirth`, `gender`, `address`, `phoneNumber`
- **Проблема:** Отсутствует поле `flags` и `addressFlags`
- Статус: 🔴 **НЕ СООТВЕТСТВУЕТ**

**POST /api/cad/characters**
- Принимает: `{ firstName, lastName, departmentId, rank, status }`
- **Проблема:** Не соответствует типу `CreateCitizenRequest`
- Статус: 🔴 **НЕ СООТВЕТСТВУЕТ**

**GET /api/cad/characters/:id**
- Возвращает: `Character` с неполной структурой
- **Проблема:** Отсутствуют обязательные поля из типа `Citizen`
- Статус: 🔴 **НЕ СООТВЕТСТВУЕТ**

### 3. Другие API эндпоинты

#### 🔴 Не соответствует золотым типам:

**GET /api/forum/*, /api/tests/*, /api/reports/***
- Используют старые типы данных
- Не соответствуют новым золотым типам
- Статус: 🔴 **НЕ СООТВЕТСТВУЕТ**

---

## 🗄️ АУДИТ СХЕМЫ БАЗЫ ДАННЫХ

### 1. Таблица `characters`

#### 🔴 Критические несоответствия:

**Поля в БД vs Золотые типы:**

| Поле в БД | Поле в типе Citizen | Статус |
|-----------|-------------------|---------|
| `first_name` | `name` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| `last_name` | `surname` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| `dob` | `dateOfBirth` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| `insurance_number` | ❌ **ОТСУТСТВУЕТ** | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| ❌ **ОТСУТСТВУЕТ** | `phoneNumber` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| ❌ **ОТСУТСТВУЕТ** | `flags` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| ❌ **ОТСУТСТВУЕТ** | `addressFlags` | 🔴 **НЕ СООТВЕТСТВУЕТ** |

**Структура таблицы:**
```sql
-- Текущая структура (неправильная)
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,        -- Должно быть name
    last_name TEXT NOT NULL,         -- Должно быть surname
    dob DATE NOT NULL,               -- Должно быть dateOfBirth
    insurance_number TEXT NOT NULL,  -- Лишнее поле
    -- Отсутствуют обязательные поля
);

-- Правильная структура (по золотым типам)
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,              -- firstName -> name
    surname TEXT NOT NULL,           -- lastName -> surname
    dateOfBirth DATE NOT NULL,       -- dob -> dateOfBirth
    gender TEXT NOT NULL,            -- Добавить
    address TEXT NOT NULL,           -- Добавить
    phoneNumber TEXT NOT NULL,       -- Добавить
    occupation TEXT,                 -- Добавить
    photoUrl TEXT,                   -- Добавить
    ssn TEXT,                        -- Добавить
    flags TEXT[],                    -- Добавить
    addressFlags TEXT[]              -- Добавить
);
```

### 2. Таблица `vehicles`

#### 🔴 Критические несоответствия:

**Поля в БД vs Золотые типы:**

| Поле в БД | Поле в типе Vehicle | Статус |
|-----------|-------------------|---------|
| `owner_id` | `ownerId` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| ❌ **ОТСУТСТВУЕТ** | `registration` | 🔴 **НЕ СООТВЕТСТВУЕТ** |
| ❌ **ОТСУТСТВУЕТ** | `insurance` | 🔴 **НЕ СООТВЕТСТВУЕТ** |

### 3. Таблица `mdt_units`

#### ✅ Соответствует золотым типам:

- Поля `unit_number`, `department_id`, `status` соответствуют типу `Unit`
- Статус: ✅ **СООТВЕТСТВУЕТ**

### 4. Таблица `mdt_calls_911`

#### 🟡 Частично соответствует:

- Поле `caller_name` должно быть `caller`
- Поле `caller_phone` должно быть отдельным полем
- Статус: 🟡 **ЧАСТИЧНО СООТВЕТСТВУЕТ**

---

## ⚠️ КРИТИЧЕСКИЕ НЕСООТВЕТСТВИЯ

### 1. Типы данных в сервисах

**CharacterService.ts:**
```typescript
// Текущий код (неправильный)
private adaptSupabaseCharacterToCharacter(supabaseCharacter: any): Character {
  return {
    id: supabaseCharacter.id,
    firstName: supabaseCharacter.first_name,  // ❌ Должно быть name
    lastName: supabaseCharacter.last_name,    // ❌ Должно быть surname
    // ... остальные поля
  };
}

// Правильный код
private adaptSupabaseCharacterToCharacter(supabaseCharacter: any): Character {
  return {
    id: supabaseCharacter.id,
    name: supabaseCharacter.name,              // ✅ Правильно
    surname: supabaseCharacter.surname,        // ✅ Правильно
    dateOfBirth: supabaseCharacter.dateOfBirth,
    gender: supabaseCharacter.gender,
    address: supabaseCharacter.address,
    phoneNumber: supabaseCharacter.phoneNumber,
    occupation: supabaseCharacter.occupation,
    photoUrl: supabaseCharacter.photoUrl,
    ssn: supabaseCharacter.ssn,
    flags: supabaseCharacter.flags || [],
    addressFlags: supabaseCharacter.addressFlags || []
  };
}
```

### 2. Внешние ключи

**Проблема:** `vehicles.owner_id` ссылается на `characters.id`, но структура таблиц не соответствует.

### 3. API ответы

**Проблема:** API возвращает данные в старом формате, не соответствующем золотым типам.

---

## 📋 ПЛАН СИНХРОНИЗАЦИИ

### Этап 1: Миграция базы данных (КРИТИЧНО)

#### 1.1 Создать новую миграцию для обновления таблицы `characters`

```sql
-- Миграция: Обновление структуры characters
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS surname TEXT,
ADD COLUMN IF NOT EXISTS dateOfBirth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phoneNumber TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS photoUrl TEXT,
ADD COLUMN IF NOT EXISTS ssn TEXT,
ADD COLUMN IF NOT EXISTS flags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS addressFlags TEXT[] DEFAULT '{}';

-- Перенести данные из старых полей
UPDATE characters 
SET 
  name = first_name,
  surname = last_name,
  dateOfBirth = dob;

-- Удалить старые поля после проверки
-- ALTER TABLE characters DROP COLUMN first_name, DROP COLUMN last_name, DROP COLUMN dob;
```

#### 1.2 Обновить таблицу `vehicles`

```sql
-- Добавить недостающие поля
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS registration TEXT,
ADD COLUMN IF NOT EXISTS insurance TEXT;

-- Переименовать поле
ALTER TABLE vehicles RENAME COLUMN owner_id TO ownerId;
```

### Этап 2: Обновление сервисов (КРИТИЧНО)

#### 2.1 Обновить CharacterService.ts

```typescript
// Обновить адаптеры для соответствия золотым типам
private adaptSupabaseCharacterToCharacter(supabaseCharacter: any): Citizen {
  return {
    id: supabaseCharacter.id,
    name: supabaseCharacter.name,
    surname: supabaseCharacter.surname,
    dateOfBirth: supabaseCharacter.dateOfBirth,
    gender: supabaseCharacter.gender,
    address: supabaseCharacter.address,
    phoneNumber: supabaseCharacter.phoneNumber,
    occupation: supabaseCharacter.occupation,
    photoUrl: supabaseCharacter.photoUrl,
    ssn: supabaseCharacter.ssn,
    flags: supabaseCharacter.flags || [],
    addressFlags: supabaseCharacter.addressFlags || []
  };
}
```

#### 2.2 Обновить MDTService.ts

```typescript
// Обновить маппинг вызовов 911
private mapCallFromDb(row: any): Call911 {
  return {
    id: row.id,
    caller: row.caller_name,           // Обновить поле
    callerName: row.caller_name,       // Добавить
    callerPhone: row.caller_phone,     // Добавить
    location: row.location,
    description: row.description,
    priority: this.mapPriority(row.priority), // Преобразовать
    status: this.mapStatus(row.status),       // Преобразовать
    units: [], // Получить из связанной таблицы
    timestamp: row.created_at,
    createdAt: row.created_at
  };
}
```

### Этап 3: Обновление API эндпоинтов (ВАЖНО)

#### 3.1 Обновить роуты для возврата правильных данных

```typescript
// Обновить GET /api/cad/characters
router.get('/characters', authenticateToken, async (req, res) => {
  try {
    const characters = await characterService.getCharactersByOwner(req.user.id);
    // Преобразовать в формат золотых типов
    const formattedCharacters = characters.map(char => ({
      id: char.id,
      name: char.name,           // Вместо firstName
      surname: char.surname,     // Вместо lastName
      dateOfBirth: char.dateOfBirth,
      gender: char.gender,
      address: char.address,
      phoneNumber: char.phoneNumber,
      occupation: char.occupation,
      photoUrl: char.photoUrl,
      ssn: char.ssn,
      flags: char.flags || [],
      addressFlags: char.addressFlags || []
    }));
    
    res.json(formattedCharacters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});
```

### Этап 4: Обновление типов (ВАЖНО)

#### 4.1 Синхронизировать типы между бэкендом и фронтендом

```typescript
// Обновить apps/server/types.ts
export interface Character {
  id: number;
  name: string;              // Вместо firstName
  surname: string;           // Вместо lastName
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  occupation?: string;
  photoUrl?: string;
  ssn?: string;
  flags?: string[];
  addressFlags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 РЕКОМЕНДАЦИИ

### 1. Приоритеты исправлений

**КРИТИЧНО (Блокирует работу):**
- Миграция таблицы `characters`
- Обновление CharacterService
- Обновление API эндпоинтов для граждан

**ВАЖНО (Влияет на функциональность):**
- Обновление MDTService
- Синхронизация типов
- Обновление валидации

**ЖЕЛАТЕЛЬНО (Улучшение):**
- Обновление остальных сервисов
- Добавление новых полей
- Оптимизация запросов

### 2. Стратегия миграции

1. **Создать резервную копию** базы данных
2. **Выполнить миграцию** в тестовой среде
3. **Обновить сервисы** для работы с новой структурой
4. **Протестировать** все API эндпоинты
5. **Развернуть** в продакшене

### 3. Обратная совместимость

**Рекомендация:** Создать адаптеры для обратной совместимости:

```typescript
// Адаптер для старого формата (временно)
export function adaptToLegacyFormat(citizen: Citizen): any {
  return {
    id: citizen.id,
    firstName: citizen.name,        // Обратная совместимость
    lastName: citizen.surname,      // Обратная совместимость
    // ... остальные поля
  };
}
```

### 4. Тестирование

**Обязательно протестировать:**
- Все API эндпоинты
- Создание/обновление/удаление записей
- Поиск и фильтрацию
- Внешние ключи и связи
- Валидацию данных

---

## 📊 СТАТИСТИКА НЕСООТВЕТСТВИЙ

| Компонент | Соответствует | Частично | Не соответствует |
|-----------|---------------|----------|------------------|
| MDT API | 3 | 2 | 0 |
| CAD API | 0 | 0 | 4 |
| Character Service | 0 | 0 | 1 |
| MDT Service | 1 | 1 | 0 |
| База данных | 1 | 1 | 2 |

**Общий статус:** 🔴 **ТРЕБУЕТ СИНХРОНИЗАЦИИ**

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **Немедленно:** Создать миграцию для таблицы `characters`
2. **В течение дня:** Обновить CharacterService и API эндпоинты
3. **В течение недели:** Протестировать и развернуть изменения
4. **В течение месяца:** Обновить остальные компоненты

**Ответственный:** Backend Team  
**Срок выполнения:** 1 неделя  
**Приоритет:** КРИТИЧЕСКИЙ 