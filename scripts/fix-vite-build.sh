#!/bin/bash

echo "🔧 БЫСТРОЕ ИСПРАВЛЕНИЕ VITE BUILD ОШИБКИ"
echo "======================================="

cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем статус PM2
echo "📊 Текущий статус PM2:"
pm2 status

# Останавливаем приложение
echo "🛑 Останавливаем приложение..."
pm2 delete roleplayidentity 2>/dev/null || echo "Приложение не было запущено"

# Удаляем старые файлы сборки
echo "🧹 Очищаем старые файлы сборки..."
rm -f dist/index.js dist/production-entry.js

# Собираем только сервер (без frontend)
echo "🔨 Собираем только сервер..."
npm run build:server-only

# Проверяем что server.js создан
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js не найден после сборки!"
    exit 1
fi

echo "✅ dist/server.js создан успешно"

# Проверяем что в server.js нет vite
echo "🔍 Проверяем импорты vite в dist/server.js:"
if grep -q "vite" dist/server.js; then
    echo "❌ В dist/server.js все еще есть импорты vite!"
    echo "📋 Первые 3 строки с vite:"
    grep -n "vite" dist/server.js | head -3
    exit 1
else
    echo "✅ Импорты vite не найдены в dist/server.js"
fi

# Запускаем с правильным файлом
echo "🚀 Запускаем приложение с dist/server.js..."
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию
pm2 save

# Ждем инициализации
echo "⏳ Ждем инициализации..."
sleep 3

# Проверяем статус
echo "📊 Статус:"
pm2 status

# Проверяем логи на ошибки vite
echo "📋 Проверяем логи на ошибки vite:"
pm2 logs roleplayidentity --lines 5 --nostream | grep -i "vite\|error" || echo "Ошибок vite не найдено"

# Тестируем API
echo "🔍 Тестируем API..."
response=$(curl -s http://localhost:5000/api/health)
echo "📋 Ответ API: $response"

if echo "$response" | grep -q "status.*ok"; then
    echo "✅ API отвечает корректно!"
    echo "🎉 VITE BUILD ОШИБКА ИСПРАВЛЕНА!"
else
    echo "❌ API не отвечает корректно"
    echo "📋 Полный ответ:"
    curl -s http://localhost:5000/api/health
fi

echo "🎯 БЫСТРОЕ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО" 