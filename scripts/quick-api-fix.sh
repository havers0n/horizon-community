#!/bin/bash

echo "⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ API"
echo "========================="

cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем что server.js существует
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js не найден!"
    echo "💡 Нужно сначала выполнить полную пересборку"
    exit 1
fi

echo "✅ dist/server.js найден"

# Останавливаем приложение
echo "🛑 Останавливаем приложение..."
pm2 delete roleplayidentity 2>/dev/null || echo "Приложение не было запущено"

# Запускаем с правильным файлом
echo "🚀 Запускаем приложение..."
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию
pm2 save

# Ждем инициализации
echo "⏳ Ждем инициализации..."
sleep 3

# Проверяем статус
echo "📊 Статус:"
pm2 status

# Проверяем логи
echo "📋 Логи:"
pm2 logs roleplayidentity --lines 5 --nostream

# Тестируем API
echo "🔍 Тестируем API..."
response=$(curl -s http://localhost:5000/api/health)
echo "📋 Ответ API: $response"

if echo "$response" | grep -q "status.*ok"; then
    echo "✅ API отвечает корректно!"
else
    echo "❌ API не отвечает корректно"
    echo "📋 Полный ответ:"
    curl -s http://localhost:5000/api/health
fi

echo "🎉 Быстрое исправление API завершено!" 