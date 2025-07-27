# Руководство по развертыванию FiveM MDT на VPS

## 🎯 Цель
Настроить работу MDT системы в FiveM с вашим backend на одном VPS.

## 📋 Предварительные требования

1. **VPS с установленным:**
   - Node.js 18+
   - PM2 или другой process manager
   - Nginx (для проксирования)
   - FiveM Server

2. **Домен** (например: `your-domain.com`)

## 🚀 Пошаговое развертывание

### Шаг 1: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
# Основные настройки
NODE_ENV=production
PORT=5000
APP_URL=https://your-domain.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-very-long-secret-key

# Таймзона
TZ=Europe/Moscow
```

### Шаг 2: Обновление конфигурации MDT

В файле `apps/mdtclient/src/config.ts` замените `your-domain.com` на ваш реальный домен:

```typescript
apiUrl: (() => {
  if (typeof window !== 'undefined' && window.invokeNative) {
    return 'https://your-real-domain.com/api'; // ← Замените здесь
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-real-domain.com/api'; // ← И здесь
  }
  
  return 'http://localhost:5000/api';
})(),
```

### Шаг 3: Сборка проекта

```bash
# Установка зависимостей
npm install

# Сборка всех приложений
npm run build:deploy
```

### Шаг 4: Настройка Nginx

Создайте конфигурацию Nginx `/etc/nginx/sites-available/your-domain.com`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL сертификаты (получите через Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Проксирование API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS для FiveM
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CAD-Token" always;
    }

    # Статические файлы клиента
    location / {
        root /var/www/app/dist/apps/client;
        try_files $uri $uri/ /index.html;
        
        # Кэширование
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # MDT для веба
    location /mdt {
        alias /var/www/app/dist/apps/mdtclient;
        try_files $uri $uri/ /index.html;
    }
}
```

### Шаг 5: Запуск backend

```bash
# Переходим в папку проекта
cd /var/www/app

# Устанавливаем PM2 если не установлен
npm install -g pm2

# Запускаем backend
pm2 start apps/server/dist/server.js --name "roleplay-backend"

# Сохраняем конфигурацию PM2
pm2 save
pm2 startup
```

### Шаг 6: Настройка FiveM Server

1. **Скопируйте ресурс на FiveM сервер:**
```bash
# На вашем VPS
cp -r apps/resources_fivem/mdt-system /path/to/fivem/server/resources/
```

2. **Добавьте в server.cfg:**
```cfg
# MDT System
ensure mdt-system
```

3. **Настройте права доступа в server.cfg:**
```cfg
# Разрешаем доступ к API
add_ace resource.mdt-system http.request allow
```

### Шаг 7: Тестирование

1. **Проверьте API:**
```bash
curl https://your-domain.com/api/health
```

2. **Проверьте веб-клиент:**
```
https://your-domain.com
```

3. **Проверьте MDT в браузере:**
```
https://your-domain.com/mdt
```

4. **Проверьте в FiveM:**
- Подключитесь к серверу
- Нажмите F6 для открытия MDT
- Проверьте аутентификацию

## 🔧 Устранение проблем

### Проблема: CORS ошибки в FiveM
**Решение:** Убедитесь что в Nginx конфигурации есть правильные CORS заголовки.

### Проблема: API недоступен из FiveM
**Решение:** Проверьте что:
1. Backend запущен на порту 5000
2. Nginx правильно проксирует `/api` запросы
3. Файрвол разрешает входящие соединения

### Проблема: MDT не открывается в FiveM
**Решение:** Проверьте:
1. Ресурс добавлен в server.cfg
2. Файлы UI скопированы в правильную папку
3. Права доступа настроены

## 📝 Полезные команды

```bash
# Пересборка MDT для FiveM
npm run build:fivem

# Перезапуск backend
pm2 restart roleplay-backend

# Просмотр логов
pm2 logs roleplay-backend

# Проверка статуса
pm2 status
```

## 🔒 Безопасность

1. **Используйте HTTPS** для всех соединений
2. **Настройте файрвол** для ограничения доступа
3. **Регулярно обновляйте** зависимости
4. **Мониторьте логи** на подозрительную активность

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи PM2: `pm2 logs roleplay-backend`
2. Проверьте логи Nginx: `tail -f /var/log/nginx/error.log`
3. Проверьте логи FiveM сервера 