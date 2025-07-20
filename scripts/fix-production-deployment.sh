#!/bin/bash

echo "🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМЫ ДЕПЛОЯ С VITE ЗАВИСИМОСТЯМИ"
echo "=================================================="

# Переходим в директорию приложения
cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем что файлы на месте
if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден в $(pwd)"
    echo "Убедитесь что вы в правильной директории приложения"
    exit 1
fi

echo "✅ package.json найден"

# Проверяем наличие .env
if [ ! -f ".env" ]; then
    echo "❌ .env файл не найден"
    echo "Создайте .env файл с необходимыми переменными окружения"
    exit 1
fi

echo "✅ .env файл найден"

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm ci --production
fi

# Собираем приложение с правильным production entry point
echo "🔨 Пересобираем приложение..."
npm run build

# Проверяем что файл server.js создан
if [ ! -f "dist/server.js" ]; then
    echo "❌ dist/server.js не создан"
    echo "Проверьте ошибки сборки выше"
    exit 1
fi

echo "✅ dist/server.js создан"

# Останавливаем старое приложение
echo "🛑 Останавливаем старое приложение..."
if pm2 list | grep -q "roleplayidentity"; then
    pm2 delete roleplayidentity
    echo "✅ Старое приложение остановлено"
else
    echo "ℹ️ Приложение не было запущено"
fi

# Запускаем с правильным файлом
echo "🚀 Запускаем приложение с правильным файлом..."
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию PM2
pm2 save

# Ждем немного для инициализации
echo "⏳ Ждем инициализации приложения..."
sleep 3

# Проверяем статус
echo "📊 Статус приложения:"
pm2 status

# Проверяем логи на ошибки
echo "📋 Последние 10 строк логов:"
pm2 logs roleplayidentity --lines 10 --nostream

# Проверяем доступность
echo "🔍 Проверяем доступность приложения..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Приложение успешно запущено и отвечает на localhost:5000"
    echo "🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!"
else
    echo "❌ Приложение не отвечает на localhost:5000"
    echo "📋 Проверьте логи выше на наличие ошибок"
    echo "Возможные причины:"
    echo "  - Проблемы с базой данных"
    echo "  - Неправильные переменные окружения в .env"
    echo "  - Отсутствующие зависимости"
    exit 1
fi

echo ""
echo "🔗 Ваше приложение должно быть доступно по адресу вашего VPS на порту 5000"
echo "📝 Убедитесь что порт 5000 открыт в файрволе" 