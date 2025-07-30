#!/bin/bash

# Скрипт для применения миграций по исправлению архитектуры
# RolePlayIdentity - Архитектурный аудит и исправления

set -e  # Остановка при ошибке

echo "🔧 ПРИМЕНЕНИЕ ИСПРАВЛЕНИЙ АРХИТЕКТУРЫ"
echo "======================================"
echo ""

# Проверяем наличие переменных окружения
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Ошибка: Не установлены переменные окружения SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY"
    echo "Установите переменные окружения и повторите попытку"
    exit 1
fi

echo "✅ Переменные окружения настроены"
echo ""

# Функция для применения миграции
apply_migration() {
    local migration_file=$1
    local description=$2
    
    echo "📋 Применение: $description"
    echo "   Файл: $migration_file"
    
    if [ ! -f "$migration_file" ]; then
        echo "   ❌ Файл миграции не найден: $migration_file"
        return 1
    fi
    
    # Применяем миграцию через psql или supabase CLI
    if command -v supabase &> /dev/null; then
        echo "   🔄 Применение через Supabase CLI..."
        supabase db push --include-all
    else
        echo "   🔄 Применение через psql..."
        PGPASSWORD=$SUPABASE_SERVICE_ROLE_KEY psql -h $SUPABASE_URL -U postgres -d postgres -f "$migration_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Миграция применена успешно"
    else
        echo "   ❌ Ошибка при применении миграции"
        return 1
    fi
    echo ""
}

# Функция для проверки статуса
check_status() {
    echo "🔍 Проверка статуса базы данных..."
    
    # Проверяем подключение к БД
    if command -v supabase &> /dev/null; then
        supabase status
    else
        echo "   Проверка подключения к $SUPABASE_URL..."
        PGPASSWORD=$SUPABASE_SERVICE_ROLE_KEY psql -h $SUPABASE_URL -U postgres -d postgres -c "SELECT version();" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "   ✅ Подключение к БД успешно"
        else
            echo "   ❌ Ошибка подключения к БД"
            return 1
        fi
    fi
    echo ""
}

# Основной процесс
main() {
    echo "🚀 Начало процесса исправления архитектуры..."
    echo ""
    
    # Проверяем статус
    check_status
    
    # Создаем резервную копию (если возможно)
    echo "💾 Создание резервной копии..."
    if command -v supabase &> /dev/null; then
        supabase db dump --data-only > backup_$(date +%Y%m%d_%H%M%S).sql
        echo "   ✅ Резервная копия создана"
    else
        echo "   ⚠️  Резервная копия не создана (supabase CLI не найден)"
    fi
    echo ""
    
    # Применяем миграции в правильном порядке
    echo "📦 Применение миграций..."
    echo ""
    
    # 1. Исправление owner_id в common.characters
    apply_migration \
        "supabase/migrations/015_fix_common_characters_owner_id.sql" \
        "Исправление типа owner_id в common.characters"
    
    # 2. Добавление недостающих полей в users
    apply_migration \
        "supabase/migrations/016_add_missing_user_fields.sql" \
        "Добавление недостающих полей в таблицу users"
    
    # 3. Проверка целостности
    apply_migration \
        "supabase/migrations/017_verify_integrity.sql" \
        "Проверка целостности схемы"
    
    echo "✅ Все миграции применены успешно!"
    echo ""
    
    # Финальная проверка
    echo "🔍 Финальная проверка..."
    check_status
    
    echo ""
    echo "🎉 ИСПРАВЛЕНИЯ АРХИТЕКТУРЫ ЗАВЕРШЕНЫ!"
    echo "======================================"
    echo ""
    echo "📋 Что было исправлено:"
    echo "   ✅ Тип owner_id в common.characters изменен с UUID на INTEGER"
    echo "   ✅ Добавлены недостающие поля в таблицу users"
    echo "   ✅ Созданы уникальные индексы для токенов"
    echo "   ✅ Проверена целостность схемы"
    echo ""
    echo "📚 Следующие шаги:"
    echo "   1. Обновите типы TypeScript в коде"
    echo "   2. Исправьте адаптеры в SupabaseStorage"
    echo "   3. Реализуйте реальную WebSocket аутентификацию"
    echo "   4. Запустите тесты для проверки функциональности"
    echo ""
    echo "📖 Подробности в отчете: ARCHITECTURE_AUDIT_REPORT.md"
}

# Обработка ошибок
trap 'echo "❌ Произошла ошибка. Проверьте логи выше."; exit 1' ERR

# Запуск основного процесса
main "$@" 