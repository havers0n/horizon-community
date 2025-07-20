#!/bin/bash

echo "🔧 ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С VITE"
echo "============================================="

cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Останавливаем приложение
echo "🛑 Останавливаем приложение..."
pm2 delete roleplayidentity 2>/dev/null || echo "Приложение не было запущено"

# Проверяем какой файл запускался
echo "🔍 Проверяем PM2 конфигурацию..."
pm2 show roleplayidentity 2>/dev/null | grep "script" || echo "PM2 конфигурация не найдена"

# Удаляем старые файлы сборки
echo "🧹 Очищаем старые файлы сборки..."
rm -f dist/index.js
rm -f dist/production-entry.js

# Проверяем что server.js существует
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js не найден!"
    echo "💡 Нужно пересобрать приложение"
    
    # Устанавливаем зависимости для сборки
    echo "📦 Устанавливаем зависимости для сборки..."
    npm ci
    
    # Собираем только сервер (без frontend)
    echo "🔨 Собираем только сервер..."
    npm run build:server-only
    
    # Устанавливаем только production зависимости
    echo "📦 Устанавливаем только production зависимости..."
    npm ci --production
fi

# Проверяем что server.js создан
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js все еще не найден после сборки!"
    exit 1
fi

echo "✅ dist/server.js найден"

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
sleep 5

# Проверяем статус
echo "📊 Статус:"
pm2 status

# Проверяем логи на ошибки
echo "📋 Проверяем логи на ошибки vite:"
pm2 logs roleplayidentity --lines 10 --nostream | grep -i "vite\|error" || echo "Ошибок vite не найдено"

# Тестируем API
echo "🔍 Тестируем API..."
response=$(curl -s http://localhost:5000/api/health)
echo "📋 Ответ API: $response"

if echo "$response" | grep -q "status.*ok"; then
    echo "✅ API отвечает корректно!"
    echo "🎉 ПРОБЛЕМА С VITE ПОЛНОСТЬЮ ИСПРАВЛЕНА!"
else
    echo "❌ API не отвечает корректно"
    echo "📋 Полный ответ:"
    curl -s http://localhost:5000/api/health
fi

echo "🎯 ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО" 