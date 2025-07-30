# НАСТРОЙКА РАСШИРЕННОЙ СИСТЕМЫ ШАБЛОНОВ РАПОРТОВ

## Обзор

Мы создали расширенную систему шаблонов рапортов с поддержкой категорий, сложности, тегов и других метаданных. Система включает в себя:

### Новые возможности:
- **Категоризация**: Полиция, Пожарная служба, Медицинская служба, Административные
- **Подкатегории**: incident, arrest, traffic, use_of_force, evidence, etc.
- **Сложность**: Легкий, Средний, Сложный
- **Метаданные**: Назначение, кто заполняет, когда используется
- **Теги**: Для поиска и фильтрации
- **Время заполнения**: Оценка времени в минутах
- **Обязательные поля**: Список обязательных полей для заполнения

### Новые полицейские шаблоны:
1. **Arrest Report** - Рапорт об аресте
2. **Use of Force Report** - Рапорт о применении силы
3. **Evidence/Property Report** - Рапорт об изъятом имуществе
4. **Domestic Violence Report** - Рапорт о домашнем насилии
5. **Field Interview Report (FIR)** - Рапорт о полевом интервью
6. **Death Investigation Report** - Рапорт о расследовании смерти
7. **Juvenile Contact Report** - Рапорт о контакте с несовершеннолетним
8. **Pursuit Report** - Рапорт о полицейской погоне
9. **Supplemental Report** - Дополнительный рапорт

## Что уже сделано:

### 1. Обновлена схема данных (`shared/schema.ts`)
```typescript
export const reportTemplates = pgTable("report_templates", {
  // ... существующие поля ...
  category: text("category").notNull().default("general"),
  subcategory: text("subcategory"),
  purpose: text("purpose"),
  who_fills: text("who_fills"),
  when_used: text("when_used"),
  template_example: text("template_example"),
  filled_example: text("filled_example"),
  difficulty: text("difficulty").default("medium"),
  estimated_time: integer("estimated_time"),
  required_fields: text("required_fields").array().default([]),
  tags: text("tags").array().default([]),
});
```

### 2. Создана миграция (`supabase/migrations/011_enhanced_report_templates.sql`)
- Добавляет новые поля в таблицу `report_templates`
- Создает индексы для оптимизации
- Обновляет существующие шаблоны
- Добавляет новые полицейские шаблоны

### 3. Обновлены React компоненты:
- **TemplateBrowser.tsx** - Улучшенный интерфейс с фильтрацией по категориям, сложности, поиском
- **TemplateEditor.tsx** - Расширенный редактор с поддержкой новых полей
- **Reports.tsx** - Главная страница с табами

### 4. Обновлены API маршруты (`server/routes/reportTemplates.ts`)
- Поддержка фильтрации по новым полям
- Статистика шаблонов
- Популярные теги

## Инструкции по применению:

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Выполните миграцию `010_report_templates_system.sql`:
   ```sql
   -- Скопируйте содержимое файла supabase/migrations/010_report_templates_system.sql
   -- и выполните в SQL Editor
   ```
5. Выполните миграцию `011_enhanced_report_templates.sql`:
   ```sql
   -- Скопируйте содержимое файла supabase/migrations/011_enhanced_report_templates.sql
   -- и выполните в SQL Editor
   ```

### Вариант 2: Через Supabase CLI (если доступен)

```bash
# Применить только миграции шаблонов
npx supabase db push --include-all

# Или применить конкретные миграции
npx supabase db push --include 010_report_templates_system.sql
npx supabase db push --include 011_enhanced_report_templates.sql
```

### Вариант 3: Ручное создание таблицы

Если миграции не работают, создайте таблицу вручную:

```sql
-- Создание базовой таблицы
CREATE TABLE IF NOT EXISTS report_templates (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    category TEXT NOT NULL DEFAULT 'general',
    subcategory TEXT,
    purpose TEXT,
    who_fills TEXT,
    when_used TEXT,
    template_example TEXT,
    filled_example TEXT,
    difficulty TEXT DEFAULT 'medium',
    estimated_time INTEGER,
    required_fields TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_subcategory ON report_templates(subcategory);
CREATE INDEX IF NOT EXISTS idx_report_templates_difficulty ON report_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_report_templates_is_active ON report_templates(is_active);
```

## Проверка установки:

После применения миграций проверьте:

1. **Таблица создана**:
   ```sql
   SELECT * FROM report_templates LIMIT 5;
   ```

2. **Новые поля доступны**:
   ```sql
   SELECT title, category, difficulty, tags FROM report_templates;
   ```

3. **Шаблоны добавлены**:
   ```sql
   SELECT title, category, subcategory FROM report_templates WHERE category = 'police';
   ```

## Использование системы:

### Для пользователей:
1. Перейдите на страницу `/reports`
2. Выберите вкладку "Шаблоны"
3. Используйте фильтры для поиска нужного шаблона
4. Нажмите "Заполнить" для создания рапорта

### Для администраторов:
1. Перейдите на страницу `/reports`
2. Выберите вкладку "Управление"
3. Создавайте и редактируйте шаблоны с новыми полями

## Возможные проблемы:

### 1. Ошибка "relation does not exist"
- Убедитесь, что миграция `010_report_templates_system.sql` выполнена
- Проверьте, что таблица `report_templates` создана

### 2. Ошибка "column does not exist"
- Убедитесь, что миграция `011_enhanced_report_templates.sql` выполнена
- Проверьте, что новые поля добавлены

### 3. Ошибки в React компонентах
- Убедитесь, что TypeScript типы обновлены
- Проверьте, что API маршруты работают корректно

## Дополнительные улучшения:

После базовой настройки можно добавить:

1. **Дополнительные шаблоны** для других департаментов
2. **Валидацию полей** на основе `required_fields`
3. **Автозаполнение** часто используемых значений
4. **Экспорт/импорт** шаблонов
5. **Версионирование** шаблонов
6. **Аналитику** использования шаблонов

## Поддержка:

Если возникли проблемы:
1. Проверьте логи сервера
2. Убедитесь, что все миграции применены
3. Проверьте права доступа к базе данных
4. Обратитесь к документации Supabase 