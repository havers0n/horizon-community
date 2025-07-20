#!/bin/bash

echo "⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ БЕЗ ПЕРЕСБОРКИ"
echo "====================================="

cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем что server.js существует
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js не найден!"
    echo "💡 Нужно сначала выполнить полную пересборку"
    echo "   bash scripts/emergency-vps-fix.sh"
    exit 1
fi

echo "✅ dist/server.js найден"

# Останавливаем приложение
echo "🛑 Останавливаем приложение..."
pm2 delete roleplayidentity 2>/dev/null || echo "Приложение не было запущено"

# Запускаем с правильным файлом
echo "🚀 Запускаем с правильным файлом..."
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
if curl -s http://localhost:5000/api/health | grep -q "health"; then
    echo "✅ API отвечает корректно!"
else
    echo "❌ API не отвечает или возвращает HTML"
    echo "📋 Полный ответ:"
    curl -s http://localhost:5000/api/health
fi

echo "🎉 Быстрое исправление завершено!" 