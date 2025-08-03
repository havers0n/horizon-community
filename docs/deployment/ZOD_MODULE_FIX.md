# 🔧 Критическое исправление ошибки "Failed to resolve module specifier zod"

## 🚨 Проблема

Ошибка `Uncaught TypeError: Failed to resolve module specifier "zod". Relative references must start with either "/", "./", or "../"` возникает в продакшене и указывает на то, что модуль `zod` не может быть найден браузером.

## 🔍 Диагностика

### 1. Проверка текущего состояния
```bash
# Запуск диагностики модулей
npm run check-modules

# Проверка продакшн конфигурации
npm run check-production
```

### 2. Проверка в браузере
1. Откройте консоль разработчика (F12)
2. Перейдите на вкладку Console
3. Обновите страницу
4. Найдите ошибку с `zod`

## ✅ Решение

### Шаг 1: Принудительная пересборка

```bash
# Запуск принудительной пересборки
npm run force-rebuild
```

Этот скрипт:
- Очищает все кэши
- Переустанавливает зависимости
- Пересобирает проект с нуля
- Проверяет наличие `zod` в собранных файлах

### Шаг 2: Проверка конфигурации Vite

Убедитесь что в `apps/client/vite.config.ts`:

```typescript
rollupOptions: {
  // external: ['zod'], // ЗАКОММЕНТИРОВАНО
  output: {
    manualChunks: {
      // zod в отдельном чанке
      'zod-vendor': ['zod'],
      // другие чанки...
    }
  }
}
```

### Шаг 3: Проверка зависимостей

Убедитесь что `zod` установлен:

```bash
# В корне проекта
npm install zod@^3.24.2

# В shared библиотеке
cd libs/shared/schema
npm install zod@^3.24.2
```

### Шаг 4: Загрузка на VPS

```bash
# Создание архива
npm run build:archive:correct

# Загрузка на VPS
scp deployment.tar.gz user@your-vps:/tmp/

# На VPS
cd /var/www/app
tar -xzf /tmp/deployment.tar.gz
pm2 restart roleplayidentity
```

## 🔧 Дополнительные исправления

### 1. Проверка nginx конфигурации

Убедитесь что nginx правильно настроен для ES модулей:

```nginx
location / {
    root /var/www/app/dist/apps/client;
    try_files $uri $uri/ /index.html;
    
    # Заголовки для модулей
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    
    # Правильные MIME типы
    location ~* \.js$ {
        add_header Content-Type "application/javascript";
    }
}
```

### 2. Проверка CSP заголовков

Если у вас настроен CSP, убедитесь что разрешены модули:

```nginx
add_header Content-Security-Policy "script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';";
```

### 3. Проверка путей к файлам

```bash
# Проверка структуры
ls -la /var/www/app/dist/apps/client/js/
ls -la /var/www/app/dist/apps/mdtclient/js/

# Проверка что zod-vendor файл существует
find /var/www/app/dist -name "*zod*" -type f
```

## 📊 Мониторинг

### Проверка логов

```bash
# Логи приложения
pm2 logs roleplayidentity

# Логи nginx
sudo tail -f /var/log/nginx/your-domain.com.error.log

# Логи браузера (в консоли разработчика)
```

### Проверка файлов

```bash
# Проверка размера файлов
du -sh /var/www/app/dist/apps/client/js/
du -sh /var/www/app/dist/apps/mdtclient/js/

# Проверка содержимого index.html
grep -n "zod" /var/www/app/dist/apps/client/index.html
```

## 🚀 Быстрое исправление

Для экстренного исправления:

```bash
# 1. Принудительная пересборка
npm run force-rebuild

# 2. Создание архива
npm run build:archive:correct

# 3. Загрузка на VPS
scp deployment.tar.gz user@your-vps:/tmp/

# 4. На VPS
cd /var/www/app
tar -xzf /tmp/deployment.tar.gz
pm2 restart roleplayidentity

# 5. Проверка
curl -I https://your-domain.com
```

## 🔍 Отладка

### Проверка в браузере

1. **Console вкладка** - проверьте ошибки модулей
2. **Network вкладка** - проверьте загрузку JS файлов
3. **Sources вкладка** - проверьте структуру файлов

### Проверка файлов на сервере

```bash
# Проверка что файлы загружены
ls -la /var/www/app/dist/apps/client/js/

# Проверка содержимого zod-vendor файла
grep -n "zod" /var/www/app/dist/apps/client/js/zod-vendor-*.js

# Проверка прав доступа
sudo chown -R www-data:www-data /var/www/app/dist/
```

## 📋 Чек-лист исправления

- [ ] Запущен `npm run force-rebuild`
- [ ] Проверено что `zod` в отдельном чанке
- [ ] Удален `external: ['zod']` из конфигурации
- [ ] Установлен `zod` во всех пакетах
- [ ] Загружены новые файлы на VPS
- [ ] Перезапущено приложение
- [ ] Проверена консоль браузера
- [ ] Проверены логи сервера

## 🆘 Если проблема остается

### 1. Проверьте версии
```bash
npm ls zod
npm ls @hookform/resolvers
```

### 2. Проверьте импорты
```bash
grep -r "import.*zod" apps/client/src/
grep -r "from.*zod" apps/client/src/
```

### 3. Проверьте собранные файлы
```bash
# Проверка что zod включен в бандл
grep -r "zod" dist/apps/client/js/
```

### 4. Проверьте nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Проверьте PM2
```bash
pm2 status
pm2 logs roleplayidentity
```

## 📞 Поддержка

Если проблема не решается:

1. **Соберите логи:**
   ```bash
   pm2 logs roleplayidentity > app.log
   sudo tail -n 100 /var/log/nginx/your-domain.com.error.log > nginx.log
   ```

2. **Соберите информацию о системе:**
   ```bash
   node --version
   npm --version
   pm2 --version
   nginx -v
   ```

3. **Проверьте консоль браузера** и сделайте скриншот ошибок 