#!/bin/bash

echo "🔍 ДИАГНОСТИКА ПРОБЛЕМЫ С VITE"
echo "==============================="

cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем PM2 конфигурацию
echo "📋 PM2 конфигурация:"
pm2 list

# Проверяем какой файл запущен
echo "🔍 Проверяем какой файл запущен..."
pm2 show roleplayidentity | grep "script"

# Проверяем содержимое dist/
echo "📁 Содержимое dist/:"
ls -la dist/

# Проверяем размер файлов
echo "📊 Размер файлов:"
ls -lh dist/server.js dist/index.js 2>/dev/null || echo "Некоторые файлы отсутствуют"

# Проверяем импорты vite в файлах
echo "🔍 Проверяем импорты vite в dist/index.js:"
if [ -f "dist/index.js" ]; then
    if grep -q "vite" dist/index.js; then
        echo "❌ НАЙДЕНЫ ИМПОРТЫ VITE в dist/index.js!"
        echo "📋 Первые 5 строк с vite:"
        grep -n "vite" dist/index.js | head -5
    else
        echo "✅ Импорты vite не найдены в dist/index.js"
    fi
else
    echo "ℹ️ dist/index.js не существует"
fi

echo "🔍 Проверяем импорты vite в dist/server.js:"
if [ -f "dist/server.js" ]; then
    if grep -q "vite" dist/server.js; then
        echo "❌ НАЙДЕНЫ ИМПОРТЫ VITE в dist/server.js!"
        echo "📋 Первые 5 строк с vite:"
        grep -n "vite" dist/server.js | head -5
    else
        echo "✅ Импорты vite не найдены в dist/server.js"
    fi
else
    echo "ℹ️ dist/server.js не существует"
fi

# Проверяем логи на ошибки
echo "📋 Последние ошибки в логах:"
pm2 logs roleplayidentity --lines 10 --nostream | grep -i error || echo "Ошибок не найдено"

echo "🎯 ДИАГНОСТИКА ЗАВЕРШЕНА" 