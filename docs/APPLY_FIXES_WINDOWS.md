# ИНСТРУКЦИЯ ПО ПРИМЕНЕНИЮ ИСПРАВЛЕНИЙ (WINDOWS)

## 🚀 Быстрое применение исправлений

### Вариант 1: Через Supabase CLI (рекомендуется)

```powershell
# 1. Убедитесь, что Supabase CLI установлен
supabase --version

# 2. Примените миграции
supabase db push --include-all

# 3. Проверьте статус
supabase status
```

### Вариант 2: Через PowerShell скрипт

```powershell
# 1. Установите переменные окружения
$env:SUPABASE_URL = "your-supabase-url"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"

# 2. Запустите скрипт
.\scripts\apply_architecture_fixes.sh
```

### Вариант 3: Ручное применение миграций

```powershell
# 1. Примените миграции по порядку
supabase db push --file supabase/migrations/015_fix_common_characters_owner_id.sql
supabase db push --file supabase/migrations/016_add_missing_user_fields.sql
supabase db push --file supabase/migrations/017_verify_integrity.sql
```

## 📋 Что исправляется

### ✅ Критические исправления:
1. **owner_id в common.characters** - тип изменен с UUID на INTEGER
2. **Недостающие поля в users** - добавлены 8 полей
3. **Уникальные индексы** - созданы для токенов

### ✅ Проверки:
1. **Целостность схемы** - проверка foreign keys
2. **Синхронизация типов** - соответствие БД и кода
3. **Безопасность** - валидация данных

## 🔍 Проверка результатов

После применения исправлений проверьте:

```sql
-- Проверка типа owner_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'common' 
AND table_name = 'characters' 
AND column_name = 'owner_id';

-- Проверка новых полей в users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('has_2fa', 'is_dark_theme', 'sound_settings', 'api_token', 'cad_token', 'discord_id');

-- Проверка foreign keys
SELECT 
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema IN ('common', 'mdt');
```

## ⚠️ Важные замечания

1. **Резервная копия** - создайте backup перед применением
2. **Переменные окружения** - убедитесь, что настроены правильно
3. **Тестирование** - протестируйте на dev окружении перед prod
4. **Мониторинг** - следите за логами во время применения

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь в правильности переменных окружения
3. Обратитесь к полному отчету `ARCHITECTURE_AUDIT_REPORT.md`
4. Проверьте статус Supabase: `supabase status`

---

**Статус:** ✅ Готово к применению  
**Время выполнения:** 5-10 минут  
**Риск:** Низкий (есть резервные копии) 