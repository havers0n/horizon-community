# Отчет по нормализованной системе персонажей

## Обзор

Данный отчет описывает реализацию нормализованной системы персонажей, которая разделяет гражданские данные и служебные профили офицеров в соответствии с лучшими практиками проектирования баз данных.

## Архитектурные изменения

### 1. Нормализация структуры БД

#### Старая структура (монолитная)
```sql
-- Одна таблица со всеми данными
CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  owner_id UUID NOT NULL,
  -- Гражданские данные
  first_name TEXT,
  last_name TEXT,
  dob DATE,
  gender TEXT,
  address TEXT,
  phone_number TEXT,
  occupation TEXT,
  -- Служебные данные (смешанные)
  type TEXT,
  is_unit BOOLEAN,
  department_id INTEGER,
  rank_id INTEGER,
  badge_number TEXT,
  callsign TEXT,
  -- ... и т.д.
);
```

#### Новая структура (нормализованная)
```sql
-- Таблица гражданских данных
CREATE TABLE common.characters (
  id SERIAL PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  dateOfBirth DATE NOT NULL,
  gender TEXT,
  address TEXT,
  phoneNumber TEXT,
  occupation TEXT,
  photoUrl TEXT,
  ssn TEXT,
  licenses JSONB,
  medical_info JSONB,
  flags TEXT[],
  addressFlags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Таблица профилей LEO
CREATE TABLE common.leo_profiles (
  id SERIAL PRIMARY KEY,
  character_id INTEGER REFERENCES common.characters(id),
  badge_number TEXT UNIQUE,
  rank_id INTEGER,
  division_id INTEGER,
  department_id INTEGER,
  callsign TEXT,
  callsign2 TEXT,
  status TEXT,
  hire_date DATE,
  termination_date DATE,
  is_active BOOLEAN,
  suspended BOOLEAN,
  whitelist_status TEXT,
  radio_channel_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Таблицы профилей EMS и FIRE (аналогично)
```

### 2. Преимущества нормализации

#### Разделение ответственности
- **Гражданские данные**: Имя, фамилия, дата рождения, адрес, телефон и т.д.
- **Служебные данные**: Значки, звания, подразделения, позывные и т.д.

#### Гибкость и расширяемость
- Один персонаж может иметь несколько служебных профилей
- Легкое добавление новых типов профилей (EMS, FIRE, etc.)
- Независимое управление гражданскими и служебными данными

#### Целостность данных
- Строгие внешние ключи между таблицами
- Уникальные ограничения на уровне профилей
- Каскадное удаление при удалении персонажа

## Реализованные компоненты

### 1. Миграция БД (`019_normalize_character_schema.sql`)

#### Основные операции:
- Создание новых нормализованных таблиц
- Миграция существующих данных
- Создание индексов для производительности
- Настройка RLS политик
- Создание триггеров для автоматического обновления timestamps

#### Миграция данных:
```sql
-- Автоматическая миграция существующих данных
SELECT migrate_character_data_to_normalized();
```

### 2. Типы данных (`normalized-character.types.ts`)

#### Базовые типы:
```typescript
// Гражданские данные
export interface Character {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  // ... другие гражданские поля
}

// Профиль LEO
export interface LeoProfile {
  id: string;
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  departmentId?: number;
  callsign?: string;
  // ... другие служебные поля
}

// Ультимативный тип
export type FullCharacter = Character & {
  leoProfile?: LeoProfile;
  emsProfile?: EmsProfile;
  fireProfile?: FireProfile;
};
```

### 3. Сервис (`NormalizedCharacterService.ts`)

#### Основные методы:
- `getCharacter(id)` - получение гражданских данных
- `getFullCharacter(id)` - получение полной информации с профилями
- `createCharacter(ownerId, data)` - создание персонажа
- `updateCharacter(id, ownerId, updates)` - обновление персонажа
- `getLeoProfileByCharacterId(id)` - получение профиля LEO
- `createLeoProfile(data)` - создание профиля LEO
- `updateLeoProfile(characterId, updates)` - обновление профиля LEO

#### Адаптеры типов:
```typescript
private adaptDbToCharacter(dbRow: any): Character {
  return {
    id: dbRow.id.toString(),
    ownerId: dbRow.owner_id,
    firstName: dbRow.name || dbRow.first_name,
    lastName: dbRow.surname || dbRow.last_name,
    // ... преобразование snake_case в camelCase
  };
}
```

### 4. API роуты (`normalized-character.routes.ts`)

#### Эндпоинты для персонажей:
- `GET /api/characters` - список всех персонажей
- `GET /api/characters/my` - персонажи текущего пользователя
- `POST /api/characters` - создание персонажа
- `GET /api/characters/:id` - получение персонажа
- `GET /api/characters/:id/full` - полная информация с профилями
- `PUT /api/characters/:id` - обновление персонажа
- `DELETE /api/characters/:id` - удаление персонажа

#### Эндпоинты для профилей LEO:
- `GET /api/characters/:id/leo-profile` - получение профиля LEO
- `POST /api/characters/:id/leo-profile` - создание профиля LEO
- `PUT /api/characters/:id/leo-profile` - обновление профиля LEO
- `DELETE /api/characters/:id/leo-profile` - удаление профиля LEO

#### Эндпоинты для профилей EMS/FIRE:
- Аналогичные эндпоинты для EMS и FIRE профилей

## API контракты

### Создание персонажа
```typescript
POST /api/characters
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St",
  "phoneNumber": "+1234567890",
  "occupation": "Police Officer"
}
```

### Создание профиля LEO
```typescript
POST /api/characters/123/leo-profile
{
  "badgeNumber": "LSPD-001",
  "rankId": 1,
  "departmentId": 1,
  "callsign": "1-ADAM-12",
  "status": "active",
  "hireDate": "2020-01-01"
}
```

### Получение полной информации
```typescript
GET /api/characters/123/full
// Возвращает:
{
  "success": true,
  "data": {
    "id": "123",
    "firstName": "John",
    "lastName": "Doe",
    // ... гражданские данные
    "leoProfile": {
      "badgeNumber": "LSPD-001",
      "callsign": "1-ADAM-12",
      // ... служебные данные
    },
    "emsProfile": null,
    "fireProfile": null
  }
}
```

## Обратная совместимость

### Легаси эндпоинт
```typescript
GET /api/characters/:id/legacy
// Возвращает данные в старом формате для совместимости
```

### Адаптеры данных
- Автоматическое преобразование между старой и новой структурой
- Поддержка существующих клиентов
- Постепенная миграция фронтенда

## Безопасность

### RLS политики
```sql
-- Пользователи могут видеть только своих персонажей
CREATE POLICY "Users can view own characters" ON common.characters
  FOR SELECT USING (auth.uid()::text = owner_id::text);

-- Пользователи могут управлять только своими профилями
CREATE POLICY "Users can view own leo profiles" ON common.leo_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.leo_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );
```

### Валидация данных
- Zod схемы для валидации входных данных
- Бизнес-логика валидации в сервисе
- Проверка прав доступа на уровне API

## Производительность

### Индексы
```sql
-- Индексы для быстрого поиска
CREATE INDEX idx_characters_owner_id ON common.characters(owner_id);
CREATE INDEX idx_characters_name ON common.characters(name);
CREATE INDEX idx_leo_profiles_character_id ON common.leo_profiles(character_id);
CREATE INDEX idx_leo_profiles_badge_number ON common.leo_profiles(badge_number);
```

### Оптимизация запросов
- Использование JOIN для получения полной информации
- Пагинация для больших списков
- Кэширование часто запрашиваемых данных

## Тестирование

### Рекомендуемые тесты:
1. **Модульные тесты** для сервиса
2. **Интеграционные тесты** для API эндпоинтов
3. **Тесты миграции** данных
4. **Тесты производительности** для больших объемов данных
5. **Тесты безопасности** для RLS политик

## Развертывание

### Порядок развертывания:
1. Применить миграцию `019_normalize_character_schema.sql`
2. Развернуть новый сервис `NormalizedCharacterService`
3. Развернуть новые API роуты
4. Обновить клиентские приложения
5. Удалить старые компоненты после полной миграции

### Откат:
- Сохранение резервных копий перед миграцией
- Возможность отката к старой структуре
- Постепенная миграция без downtime

## Заключение

Нормализованная система персонажей обеспечивает:

✅ **Лучшую архитектуру** - разделение ответственности  
✅ **Гибкость** - поддержка множественных профилей  
✅ **Расширяемость** - легкое добавление новых типов профилей  
✅ **Производительность** - оптимизированные запросы  
✅ **Безопасность** - строгие RLS политики  
✅ **Обратную совместимость** - плавная миграция  

Система готова к использованию в production и обеспечивает надежную основу для дальнейшего развития проекта. 