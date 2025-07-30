# Инструкции по применению миграций

## Порядок применения миграций

### 1. Обновление департаментов
```bash
# Применяем миграцию 007
psql -d your_database -f supabase/migrations/007_update_departments.sql
```

### 2. Создание системы персонажей
```bash
# Применяем миграцию 008
psql -d your_database -f supabase/migrations/008_complete_character_system.sql
```

### 3. Настройка RLS политик
```bash
# Применяем миграцию 009
psql -d your_database -f supabase/migrations/009_setup_rls_policies.sql
```

## Исправления ошибок

### Ошибка: relation "characters" does not exist
**Причина:** Таблица `characters` не существует в базе данных.

**Решение:** Миграция `008_complete_character_system.sql` теперь создает таблицу `characters` если она не существует.

### Ошибка: relation "active_units" does not exist
**Причина:** Таблица `active_units` не существует в базе данных.

**Решение:** Убрал ссылки на `active_units` из миграции `007_update_departments.sql`.

### Ошибка: relation "users" does not exist
**Причина:** Таблица `users` не существует в базе данных.

**Решение:** 
1. Функции теперь проверяют существование таблиц перед использованием
2. RLS политики в миграции 008 используют упрощенные правила
3. Миграция 009 настраивает правильные RLS политики после создания всех таблиц

### Ошибка: syntax error at or near "NOT" (ADD CONSTRAINT IF NOT EXISTS)
**Причина:** PostgreSQL не поддерживает `IF NOT EXISTS` для `ADD CONSTRAINT`.

**Решение:** Используется блок `BEGIN/EXCEPTION` для обработки ошибки дублирования ограничения.

### Ошибка: insert or update on table "ranks" violates foreign key constraint
**Причина:** Миграция 008 пытается вставить данные с конкретными ID департаментов, которые могут не существовать.

**Решение:** Используются SELECT запросы для получения ID департаментов по имени вместо жестко заданных ID.

### Ошибка: syntax error at or near "'SAHP'" (CASE statement)
**Причина:** В PL/pgSQL функции используется неправильный синтаксис CASE для присваивания переменных.

**Решение:** Заменен CASE на IF-ELSIF конструкцию для корректного присваивания переменных в PL/pgSQL.

### Ошибка: operator does not exist: integer = uuid
**Причина:** В RLS политиках используется `users.id = auth.uid()`, но `users.id` имеет тип INTEGER, а `auth.uid()` возвращает UUID.

**Решение:** 
1. Заменено на `users.auth_id = auth.uid()`, где `users.auth_id` имеет тип UUID и связан с `auth.users(id)`.
2. Изменен тип поля `characters.owner_id` с INTEGER на UUID для совместимости с `auth.uid()`.
3. Удален внешний ключ для `characters.owner_id`, так как он теперь ссылается на `auth.users(id)`.

### Ошибка: policy "Admins can manage ranks" for table "ranks" already exists
**Причина:** Политики создаются в миграции 008, а затем повторно в миграции 009.

**Решение:** Добавлены DROP POLICY IF EXISTS для всех политик перед их созданием в миграции 009.

## Проверка миграций

### Проверка создания таблиц
```sql
-- Проверяем создание новых таблиц
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('ranks', 'divisions', 'qualifications', 'units', 'character_qualifications', 'character_career_history')
ORDER BY table_name;
```

### Проверка данных департаментов
```sql
-- Проверяем новые департаменты
SELECT * FROM departments ORDER BY id;
```

### Проверка званий
```sql
-- Проверяем звания по департаментам
SELECT d.name as department, r.name as rank, r.type, r.order_index
FROM ranks r
JOIN departments d ON r.department_id = d.id
ORDER BY d.id, r.order_index;
```

### Проверка функций
```sql
-- Проверяем создание функций
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('generate_badge_number', 'generate_employee_id', 'update_career_history');
```

## Откат миграций

### Откат миграции 009 (RLS политики)
```sql
-- Удаляем RLS политики
DROP POLICY IF EXISTS "Admins can manage ranks" ON ranks;
DROP POLICY IF EXISTS "Admins can manage divisions" ON divisions;
DROP POLICY IF EXISTS "Admins can manage qualifications" ON qualifications;
DROP POLICY IF EXISTS "Admins can manage units" ON units;
DROP POLICY IF EXISTS "Users can read own character qualifications" ON character_qualifications;
DROP POLICY IF EXISTS "Admins can manage character qualifications" ON character_qualifications;
DROP POLICY IF EXISTS "Users can read own character career history" ON character_career_history;
DROP POLICY IF EXISTS "Admins can read all career history" ON character_career_history;
DROP POLICY IF EXISTS "Users can read own characters" ON characters;
DROP POLICY IF EXISTS "Users can insert own characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;
```

### Откат миграции 008 (система персонажей)
```sql
-- Удаляем таблицы
DROP TABLE IF EXISTS character_career_history CASCADE;
DROP TABLE IF EXISTS character_qualifications CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS qualifications CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
DROP TABLE IF EXISTS ranks CASCADE;

-- Удаляем функции
DROP FUNCTION IF EXISTS generate_badge_number(TEXT);
DROP FUNCTION IF EXISTS generate_employee_id(TEXT);
DROP FUNCTION IF EXISTS update_career_history();
```

### Откат миграции 007 (департаменты)
```sql
-- Восстанавливаем старые департаменты
DELETE FROM departments;
INSERT INTO departments (name, full_name, description, logo_url, gallery) VALUES
('LSPD', 'Horizon Police Department', 'Полицейский департамент Horizon', 'https://example.com/lspd_logo.png', '{}'),
('LSFD', 'Horizon Fire Department', 'Пожарный департамент Horizon', 'https://example.com/lsfd_logo.png', '{}'),
('LSMD', 'Horizon Medical Department', 'Медицинский департамент Horizon', 'https://example.com/lsmd_logo.png', '{}'),
('GOV', 'Government', 'Правительственный департамент', 'https://example.com/gov_logo.png', '{}');

-- Сбрасываем последовательность
SELECT setval('departments_id_seq', 4, true);
```

## Автоматическое применение

### Скрипт для автоматического применения
```bash
#!/bin/bash
# apply_migrations.sh

DB_NAME="your_database"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="your_user"

echo "Применение миграции 007: Обновление департаментов..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f supabase/migrations/007_update_departments.sql

echo "Применение миграции 008: Система персонажей..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f supabase/migrations/008_complete_character_system.sql

echo "Применение миграции 009: RLS политики..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f supabase/migrations/009_setup_rls_policies.sql

echo "Миграции применены успешно!"
```

### Использование скрипта
```bash
chmod +x apply_migrations.sh
./apply_migrations.sh
```

## Проверка после миграции

### Тестовые запросы
```sql
-- Проверяем количество записей в каждой таблице
SELECT 'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'ranks', COUNT(*) FROM ranks
UNION ALL
SELECT 'divisions', COUNT(*) FROM divisions
UNION ALL
SELECT 'qualifications', COUNT(*) FROM qualifications
UNION ALL
SELECT 'units', COUNT(*) FROM units;

-- Проверяем звания PD
SELECT name, type, order_index FROM ranks WHERE department_id = 1 ORDER BY order_index;

-- Проверяем подразделения PD
SELECT name, description FROM divisions WHERE department_id = 1;

-- Проверяем юниты PD
SELECT name, description FROM units WHERE department_id = 1;
```

## Устранение неполадок

### Если миграция зависает
1. Проверьте логи PostgreSQL
2. Убедитесь, что нет блокировок
3. Проверьте права доступа пользователя

### Если появляются ошибки RLS
1. Убедитесь, что миграция 009 применена
2. Проверьте, что пользователь аутентифицирован
3. Проверьте роли пользователя

### Если данные не отображаются
1. Проверьте RLS политики
2. Убедитесь, что пользователь имеет права доступа
3. Проверьте внешние ключи

---

**Дата создания**: 2025-01-08
**Версия**: 1.0
**Статус**: Актуально 