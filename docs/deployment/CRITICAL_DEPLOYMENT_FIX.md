# КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ ДЕПЛОЯ

## Проблема
При деплое приложения возникали ошибки:
1. ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /var/www/app/dist/index.js
   ```
2. ```
   Error: Cannot use both "outfile" and "outdir"
   ```

## Причины
- В production среде запускался файл `dist/index.js`, собранный из `server/index.ts`
- `server/index.ts` содержит условный импорт vite для development режима
- esbuild включал vite зависимости в production bundle, даже если они не должны использоваться в runtime
- Конфликт параметров esbuild: нельзя использовать одновременно `--outfile` и `--outdir`

## Исправления

### 1. Изменены build скрипты в package.json
```json
{
  "scripts": {
    "build": "vite build && npm run build:server",
    "build:server": "esbuild server/production-entry.ts --platform=node --packages=external --bundle --format=esm --minify --outfile=dist/server.js",
    "start": "set NODE_ENV=production && node dist/server.js"
  }
}
```

### 2. Обновлены GitHub Actions workflows
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-optimized.yml`

**Изменения:**
- Команда PM2: `NODE_ENV=production pm2 start dist/server.js --name roleplayidentity`
- Убраны переменные окружения из секции build (используется существующий .env на сервере)
- Добавлена проверка существующего .env файла

### 3. Обновлена документация
- `VPS_DEPLOYMENT_GUIDE.md`
- `docs/DEPLOYMENT_OPTIMIZATIONS.md`

## Подход к .env файлам

**Старый подход (проблемный):**
- Создание .env из GitHub Secrets во время деплоя
- Передача переменных окружения в build процесс

**Новый подход (рекомендуемый):**
- .env файл уже существует на VPS по пути `/var/www/app/.env`
- Проверка наличия .env файла перед запуском
- Переменные окружения загружаются из существующего файла

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

# Убедитесь что .env файл существует
ls -la .env

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

Или используйте автоматический скрипт исправления:
```bash
bash scripts/fix-production-deployment.sh
```

## Проверка исправления

Приложение должно:
1. Запускаться без ошибок vite зависимостей
2. Отвечать на `http://localhost:5000/api/health`
3. Обслуживать статические файлы из `dist/public`
4. Корректно собираться без ошибок esbuild

## Профилактика

- Всегда использовать `server/production-entry.ts` для production сборки
- Никогда не импортировать vite в production коде
- Тестировать production сборку локально перед деплоем
- Не использовать одновременно `--outfile` и `--outdir` в esbuild
- Поддерживать .env файл на сервере, а не создавать его во время деплоя

## Безопасность

Это исправление:
- ✅ Не изменяет бизнес-логику
- ✅ Не ослабляет проверки безопасности
- ✅ Следует архитектурным паттернам проекта
- ✅ Совместимо с существующими данными
- ✅ Использует существующие .env файлы на сервере 