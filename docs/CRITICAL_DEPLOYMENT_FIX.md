# КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ ДЕПЛОЯ

## Проблема
При деплое приложения возникала ошибка:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /var/www/app/dist/index.js
```

## Причина
- В production среде запускался файл `dist/index.js`, собранный из `server/index.ts`
- `server/index.ts` содержит условный импорт vite для development режима
- esbuild включал vite зависимости в production bundle, даже если они не должны использоваться в runtime

## Исправление

### 1. Изменены build скрипты в package.json
```json
{
  "scripts": {
    "build": "vite build && npm run build:server",
    "build:server": "esbuild server/production-entry.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify --outfile=dist/server.js",
    "start": "set NODE_ENV=production && node dist/server.js"
  }
}
```

### 2. Обновлены GitHub Actions workflows
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-optimized.yml`

Команда PM2 изменена с:
```bash
pm2 start dist/index.js --name roleplayidentity
```

На:
```bash
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity
```

### 3. Обновлена документация
- `VPS_DEPLOYMENT_GUIDE.md`
- `docs/DEPLOYMENT_OPTIMIZATIONS.md`

## Разница между файлами

### server/index.ts (для development)
- Содержит условный импорт `./development` с vite
- Используется только в development режиме

### server/production-entry.ts (для production)
- НЕ содержит vite импортов
- Использует только `./production` модуль
- Создан специально для production сборки

## Немедленные действия для VPS

Если деплой уже выполнен, но приложение не работает:

```bash
cd /var/www/app

# Пересобираем с правильным production entry point
npm run build

# Перезапускаем с правильным файлом
pm2 delete roleplayidentity
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity
pm2 save

# Проверяем статус
pm2 status
pm2 logs roleplayidentity --lines 10
```

## Проверка исправления

Приложение должно:
1. Запускаться без ошибок vite зависимостей
2. Отвечать на `http://localhost:5000/api/health`
3. Обслуживать статические файлы из `dist/public`

## Профилактика

- Всегда использовать `server/production-entry.ts` для production сборки
- Никогда не импортировать vite в production коде
- Тестировать production сборку локально перед деплоем

## Безопасность

Это исправление:
- ✅ Не изменяет бизнес-логику
- ✅ Не ослабляет проверки безопасности
- ✅ Следует архитектурным паттернам проекта
- ✅ Совместимо с существующими данными 