#!/bin/bash

echo "🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С VITE НА VPS"
echo "================================================"

# Переходим в директорию приложения
cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем что файлы на месте
if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден в $(pwd)"
    exit 1
fi

echo "✅ package.json найден"

# Проверяем наличие .env
if [ ! -f ".env" ]; then
    echo "❌ .env файл не найден"
    exit 1
fi

echo "✅ .env файл найден"

# ОСТАНОВКА СТАРОГО ПРИЛОЖЕНИЯ
echo "🛑 Останавливаем старое приложение..."
if pm2 list | grep -q "roleplayidentity"; then
    echo "📋 Текущий статус PM2:"
    pm2 list
    
    echo "🔄 Останавливаем приложение..."
    pm2 delete roleplayidentity
    echo "✅ Приложение остановлено"
else
    echo "ℹ️ Приложение не было запущено"
fi

# ПРОВЕРЯЕМ КАКОЙ ФАЙЛ ЗАПУСКАЛСЯ
echo "🔍 Проверяем какие файлы есть в dist/:"
ls -la dist/

# УСТАНАВЛИВАЕМ ВСЕ ЗАВИСИМОСТИ (включая dev) ДЛЯ СБОРКИ
echo "📦 Устанавливаем все зависимости для сборки..."
npm ci

# ПЕРЕСБИРАЕМ ПРИЛОЖЕНИЕ
echo "🔨 Пересобираем приложение с правильным entry point..."
npm run build

# ПРОВЕРЯЕМ ЧТО ПРАВИЛЬНЫЙ ФАЙЛ СОЗДАН
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js не создан!"
    echo "📋 Проверьте ошибки сборки выше"
    exit 1
fi

echo "✅ dist/server.js создан"

# ПРОВЕРЯЕМ РАЗМЕР ФАЙЛОВ
echo "📊 Размер файлов:"
ls -lh dist/server.js
if [ -f "dist/index.js" ]; then
    ls -lh dist/index.js
fi

# УСТАНАВЛИВАЕМ ТОЛЬКО PRODUCTION ЗАВИСИМОСТИ
echo "📦 Устанавливаем только production зависимости..."
npm ci --production

# ЗАПУСКАЕМ С ПРАВИЛЬНЫМ ФАЙЛОМ
echo "🚀 Запускаем приложение с правильным файлом..."
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию PM2
pm2 save

# Ждем немного для инициализации
echo "⏳ Ждем инициализации приложения..."
sleep 5

# Проверяем статус
echo "📊 Статус приложения:"
pm2 status

# Проверяем логи на ошибки
echo "📋 Последние 15 строк логов:"
pm2 logs roleplayidentity --lines 15 --nostream

# Проверяем доступность
echo "🔍 Проверяем доступность приложения..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Приложение успешно запущено и отвечает на localhost:5000"
    echo "🎉 ПРОБЛЕМА С VITE ИСПРАВЛЕНА!"
else
    echo "❌ Приложение не отвечает на localhost:5000"
    echo "📋 Проверьте логи выше на наличие ошибок"
    
    # Дополнительная диагностика
    echo "🔍 Дополнительная диагностика:"
    echo "📋 Проверяем процессы на порту 5000:"
    netstat -tlnp | grep :5000 || echo "Порт 5000 не используется"
    
    echo "📋 Проверяем права доступа к файлам:"
    ls -la dist/server.js
    ls -la .env
    
    exit 1
fi

echo ""
echo "🔗 Ваше приложение должно быть доступно по адресу вашего VPS на порту 5000"
echo "📝 Убедитесь что порт 5000 открыт в файрволе" 