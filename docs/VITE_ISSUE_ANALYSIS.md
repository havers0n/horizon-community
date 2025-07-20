# АНАЛИЗ ПРОБЛЕМЫ С VITE ИМПОРТАМИ

## Проблема
В логах PM2 все еще появляются ошибки:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /var/www/app/dist/index.js
```

## Причина
Приложение все еще запускает **старый файл `dist/index.js`** вместо **нового `dist/server.js`**.

### Почему это происходит:

1. **PM2 кэширует конфигурацию** - даже после изменения команды запуска
2. **Старый файл `dist/index.js`** содержит динамические импорты vite
3. **`dist/index.js`** собран из `server/index.ts` с условными импортами
4. **esbuild включает vite** в bundle, даже если код не выполняется

## Дополнительная проблема: Vite Build Error

### Ошибка:
```
Could not resolve entry module "index.html".
```

### Причина:
- `npm run build` пытается собрать frontend через vite
- На сервере frontend уже собран и загружен
- Нужна только сборка сервера

### Решение:
Использовать `npm run build:server-only` вместо `npm run build`

## Диагностика

### Проверка PM2 конфигурации:
```bash
pm2 show roleplayidentity | grep "script"
```

### Проверка файлов в dist/:
```bash
ls -la dist/
ls -lh dist/server.js dist/index.js
```

### Проверка импортов vite:
```bash
grep -n "vite" dist/index.js
grep -n "vite" dist/server.js
```

## Решение

### Вариант 1: Быстрое исправление
```bash
bash scripts/fix-vite-build.sh
```

### Вариант 2: Принудительное исправление
```bash
# Останавливаем приложение
pm2 delete roleplayidentity

# Удаляем старые файлы
rm -f dist/index.js dist/production-entry.js

# Собираем только сервер (без frontend)
npm run build:server-only

# Запускаем с правильным файлом
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity
pm2 save
```

### Вариант 3: Автоматический скрипт
```bash
bash scripts/force-fix-vite.sh
```

### Вариант 4: Диагностика
```bash
bash scripts/diagnose-vite-issue.sh
```

## Проверка исправления

### Ожидаемый результат:
```bash
# PM2 должен показывать dist/server.js
pm2 show roleplayidentity | grep "script"
# script: /var/www/app/dist/server.js

# В логах не должно быть ошибок vite
pm2 logs roleplayidentity --lines 5 | grep -i vite
# (пустой вывод)

# API должен отвечать JSON
curl http://localhost:5000/api/health
# {"status":"ok","timestamp":"...","environment":"production"}
```

### Не должно быть:
- ❌ Ошибок "Cannot find package 'vite'"
- ❌ Ошибок "Could not resolve entry module 'index.html'"
- ❌ Запуска `dist/index.js`
- ❌ Импортов vite в production коде

## Профилактика

1. **Всегда использовать `dist/server.js`** для production
2. **Использовать `npm run build:server-only`** на сервере
3. **Проверять PM2 конфигурацию** после изменений
4. **Очищать старые файлы** перед новой сборкой
5. **Тестировать локально** перед деплоем

## Архитектурное решение

### Правильная структура:
```
server/
├── index.ts          # Development entry (с vite)
├── production-entry.ts # Production entry (без vite)
└── production.ts     # Production static serving
```

### Build процесс:
```json
{
  "build:server-only": "npm run build:server",
  "build:server": "esbuild server/production-entry.ts --outfile=dist/server.js"
}
```

### PM2 команда:
```bash
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity
```

## Мониторинг

### Регулярные проверки:
```bash
# Проверка файла запуска
pm2 show roleplayidentity | grep "script"

# Проверка логов на ошибки
pm2 logs roleplayidentity --lines 10 | grep -i error

# Проверка API
curl http://localhost:5000/api/health
```

### Автоматизация:
```bash
# Добавить в crontab для регулярной проверки
0 */6 * * * cd /var/www/app && curl -f http://localhost:5000/api/health || pm2 restart roleplayidentity
``` 