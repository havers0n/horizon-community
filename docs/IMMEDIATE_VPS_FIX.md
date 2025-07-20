# НЕМЕДЛЕННОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ НА VPS

## Проблема
На VPS приложение запускает `dist/index.js` вместо `dist/server.js`, что приводит к ошибке:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /var/www/app/dist/index.js
```

## Причина
- `dist/index.js` содержит динамический импорт `./development` 
- `server/development.ts` импортирует `vite`
- esbuild включает vite в production bundle
- В production vite не установлен

## НЕМЕДЛЕННОЕ РЕШЕНИЕ

### Вариант 1: Быстрое исправление (если dist/server.js уже существует)

```bash
cd /var/www/app

# Останавливаем приложение
pm2 delete roleplayidentity

# Запускаем с правильным файлом
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию
pm2 save

# Проверяем
pm2 status
pm2 logs roleplayidentity --lines 5
```

### Вариант 2: Полная пересборка (если dist/server.js не существует)

```bash
cd /var/www/app

# Останавливаем приложение
pm2 delete roleplayidentity

# Устанавливаем ВСЕ зависимости (включая dev) для сборки
npm ci

# Пересобираем с правильным entry point
npm run build

# Устанавливаем только production зависимости
npm ci --production

# Запускаем с правильным файлом
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию
pm2 save

# Проверяем
pm2 status
pm2 logs roleplayidentity --lines 10
```

### Вариант 3: Автоматические скрипты

**Быстрое исправление:**
```bash
bash scripts/quick-fix.sh
```

**Полная пересборка:**
```bash
bash scripts/emergency-vps-fix.sh
```

## Проверка исправления

```bash
# Проверяем что приложение отвечает JSON, а не HTML
curl http://localhost:5000/api/health

# Должно быть "online" статус
pm2 status

# Не должно быть ошибок vite в логах
pm2 logs roleplayidentity --lines 5
```

## Ожидаемый результат

✅ **Должно быть:**
- PM2 показывает статус "online"
- Логи без ошибок "Cannot find package 'vite'"
- API отвечает JSON на `/api/health`
- Фронтенд загружается корректно

❌ **Не должно быть:**
- Ошибок импорта vite
- Статуса "errored" в PM2
- Возврата HTML вместо API данных

## Диагностика проблем

### Ошибка "vite: not found"
```bash
# Проблема: vite не установлен в production
# Решение: установить все зависимости для сборки
npm ci
npm run build
npm ci --production
```

### API возвращает HTML вместо JSON
```bash
# Проблема: запущен неправильный файл
# Решение: убедиться что запускается dist/server.js
pm2 list
pm2 delete roleplayidentity
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity
```

### Файл dist/server.js не существует
```bash
# Проблема: не была выполнена сборка
# Решение: выполнить полную пересборку
npm ci
npm run build
```

## Профилактика

После исправления:
1. Убедитесь что в GitHub Actions используется `dist/server.js`
2. Проверьте что `package.json` содержит правильные build скрипты
3. Следующий деплой через GitHub Actions будет корректным

## Диагностика

Если проблема остается:

```bash
# Проверяем какой файл запущен
pm2 list

# Проверяем содержимое dist/
ls -la dist/

# Проверяем размер файлов
ls -lh dist/server.js dist/index.js

# Проверяем процессы на порту 5000
netstat -tlnp | grep :5000
``` 