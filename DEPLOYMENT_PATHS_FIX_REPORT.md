# Отчет об исправлении путей в CI deployment

## Проблема
CI успешно собирал проект, но падал на этапе создания архива с ошибкой:
```
tar: dist: Cannot stat: No such file or directory
tar: client: Cannot stat: No such file or directory
tar: shared: Cannot stat: No such file or directory
tar: vite.config.ts: Cannot stat: No such file or directory
```

## Причина
1. CI workflow использовал неправильные пути для архивирования
2. Проект использует Nx workspace, который собирает все приложения в `dist/apps/`
3. PM2 пытался запустить несуществующий файл `dist/server.js`

## Структура сборки Nx
После выполнения `npm run build:production`:
```
dist/
├── apps/
│   ├── client/          # Frontend приложение
│   │   ├── index.html
│   │   ├── js/
│   │   ├── css/
│   │   └── package.json
│   ├── mdtclient/       # MDT интерфейс
│   │   └── supabase-generated.d.ts
│   └── server/          # Backend сервер
│       ├── index.js     # Основной файл сервера
│       ├── index.js.map
│       ├── package.json
│       └── [другие файлы]
├── libs/                # Общие библиотеки
├── packages/            # Пакеты
└── bundle-analysis.html
```

## Исправления

### 1. Обновлен шаг диагностики
Добавлен шаг `List workspace files` для проверки структуры Nx:
```yaml
- name: List workspace files
  run: |
    echo "Current directory:"
    pwd
    echo "Root directory contents:"
    ls -la
    echo "Nx dist structure:"
    ls -la dist/ 2>/dev/null || echo "Root dist not found"
    echo "Nx apps dist:"
    ls -la dist/apps/ 2>/dev/null || echo "dist/apps not found"
    echo "Server build:"
    ls -la dist/apps/server/ 2>/dev/null || echo "dist/apps/server not found"
    echo "Client build:"
    ls -la dist/apps/client/ 2>/dev/null || echo "dist/apps/client not found"
    echo "MDT client build:"
    ls -la dist/apps/mdtclient/ 2>/dev/null || echo "dist/apps/mdtclient not found"
```

### 2. Исправлены пути в архивировании
Обновлен шаг `Create deployment package`:
```yaml
- name: Create deployment package
  run: |
    tar -czf deployment.tar.gz \
      dist/ \
      package.json \
      package-lock.json \
      scripts/ \
      supabase/ \
      migrations/ \
      docs/ \
      README.md \
      node_modules/
```

### 3. Исправлен путь запуска PM2
Обновлен путь запуска сервера:
```yaml
# Было:
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Стало:
NODE_ENV=production pm2 start dist/apps/server/index.js --name roleplayidentity
```

## Результат
- ✅ CI больше не будет падать на создании архива
- ✅ Правильные пути для Nx workspace
- ✅ Корректный запуск сервера через PM2
- ✅ Полная диагностика структуры сборки

## Проверка
Локально проверена структура папки `dist/` и подтверждено, что все приложения собираются в `dist/apps/`. 