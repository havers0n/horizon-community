# PowerShell скрипт для применения архитектурных исправлений
# RolePlayIdentity - Архитектурный аудит и исправления

Write-Host "🔧 ПРИМЕНЕНИЕ ИСПРАВЛЕНИЙ АРХИТЕКТУРЫ" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Устанавливаем переменные окружения
$env:SUPABASE_URL = "https://axgtvvcimqoyxbfvdrok.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U"

Write-Host "✅ Переменные окружения настроены" -ForegroundColor Green
Write-Host ""

# Функция для применения миграции
function Apply-Migration {
    param(
        [string]$MigrationFile,
        [string]$Description
    )
    
    Write-Host "📋 Применение: $Description" -ForegroundColor Yellow
    Write-Host "   Файл: $MigrationFile" -ForegroundColor Gray
    
    if (-not (Test-Path $MigrationFile)) {
        Write-Host "   ❌ Файл миграции не найден: $MigrationFile" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "   🔄 Применение через Supabase CLI..." -ForegroundColor Cyan
        
        # Применяем миграцию
        $result = supabase db push --file $MigrationFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Миграция применена успешно" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ Ошибка при применении миграции:" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Исключение при применении миграции: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
}

# Функция для проверки статуса
function Test-Connection {
    Write-Host "🔍 Проверка статуса базы данных..." -ForegroundColor Yellow
    
    try {
        $status = supabase status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Подключение к БД успешно" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ Ошибка подключения к БД" -ForegroundColor Red
            Write-Host "   $status" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Исключение при проверке подключения: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
}

# Основной процесс
Write-Host "🚀 Начало процесса исправления архитектуры..." -ForegroundColor Green
Write-Host ""

# Проверяем статус
if (-not (Test-Connection)) {
    Write-Host "❌ Не удалось подключиться к базе данных. Проверьте переменные окружения." -ForegroundColor Red
    exit 1
}

# Создаем резервную копию (если возможно)
Write-Host "💾 Создание резервной копии..." -ForegroundColor Yellow
try {
    $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    supabase db dump --data-only > $backupFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Резервная копия создана: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Резервная копия не создана (supabase CLI не найден)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ⚠️  Резервная копия не создана: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Применяем миграции в правильном порядке
Write-Host "📦 Применение миграций..." -ForegroundColor Yellow
Write-Host ""

$success = $true

# 1. Исправление owner_id в common.characters
if (-not (Apply-Migration -MigrationFile "supabase/migrations/015_fix_common_characters_owner_id.sql" -Description "Исправление типа owner_id в common.characters")) {
    $success = $false
}

# 2. Добавление недостающих полей в users
if (-not (Apply-Migration -MigrationFile "supabase/migrations/016_add_missing_user_fields.sql" -Description "Добавление недостающих полей в таблицу users")) {
    $success = $false
}

# 3. Проверка целостности
if (-not (Apply-Migration -MigrationFile "supabase/migrations/017_verify_integrity.sql" -Description "Проверка целостности схемы")) {
    $success = $false
}

if ($success) {
    Write-Host "✅ Все миграции применены успешно!" -ForegroundColor Green
    Write-Host ""
    
    # Финальная проверка
    Write-Host "🔍 Финальная проверка..." -ForegroundColor Yellow
    Test-Connection
    
    Write-Host ""
    Write-Host "🎉 ИСПРАВЛЕНИЯ АРХИТЕКТУРЫ ЗАВЕРШЕНЫ!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Что было исправлено:" -ForegroundColor White
    Write-Host "   ✅ Тип owner_id в common.characters изменен с UUID на INTEGER" -ForegroundColor Green
    Write-Host "   ✅ Добавлены недостающие поля в таблицу users" -ForegroundColor Green
    Write-Host "   ✅ Созданы уникальные индексы для токенов" -ForegroundColor Green
    Write-Host "   ✅ Проверена целостность схемы" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Следующие шаги:" -ForegroundColor White
    Write-Host "   1. Обновите типы TypeScript в коде" -ForegroundColor Cyan
    Write-Host "   2. Исправьте адаптеры в SupabaseStorage" -ForegroundColor Cyan
    Write-Host "   3. Реализуйте реальную WebSocket аутентификацию" -ForegroundColor Cyan
    Write-Host "   4. Запустите тесты для проверки функциональности" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 Подробности в отчете: ARCHITECTURE_AUDIT_REPORT.md" -ForegroundColor Cyan
} else {
    Write-Host "❌ Произошли ошибки при применении миграций. Проверьте логи выше." -ForegroundColor Red
    exit 1
} 