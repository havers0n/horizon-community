# 🚀 Правильная конфигурация Nginx для продакшена

## 📋 Проблемы в текущей конфигурации

1. **Неправильные пути к статическим файлам**
2. **Отсутствие правильной обработки SPA**
3. **Неправильная конфигурация для нескольких приложений**
4. **Отсутствие оптимизации производительности**

## ✅ Исправленная конфигурация

### Основной файл конфигурации: `/etc/nginx/sites-available/your-domain.com`

```nginx
# HTTP -> HTTPS редирект
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# Основной HTTPS сервер
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL сертификаты (получите через Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL настройки безопасности
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Проксирование API на backend
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
        
        # CORS для FiveM и веб-клиентов
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CAD-Token" always;
        
        # Обработка preflight запросов
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CAD-Token";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # MDT интерфейс
    location /mdt {
        alias /var/www/app/dist/apps/mdtclient;
        try_files $uri $uri/ /mdt/index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Основной клиент (SPA)
    location / {
        root /var/www/app/dist/apps/client;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Без кэширования для HTML файлов
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Логирование
    access_log /var/log/nginx/your-domain.com.access.log;
    error_log /var/log/nginx/your-domain.com.error.log;
}
```

## 🔧 Настройка для нескольких доменов

### Для MDT на отдельном поддомене: `/etc/nginx/sites-available/mdt.your-domain.com`

```nginx
server {
    listen 80;
    server_name mdt.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mdt.your-domain.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/mdt.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mdt.your-domain.com/privkey.pem;

    # SSL настройки (те же, что и выше)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # API проксирование
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
        
        # CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CAD-Token" always;
    }

    # MDT интерфейс
    location / {
        root /var/www/app/dist/apps/mdtclient;
        try_files $uri $uri/ /index.html;
        
        # Кэширование
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Логирование
    access_log /var/log/nginx/mdt.your-domain.com.access.log;
    error_log /var/log/nginx/mdt.your-domain.com.error.log;
}
```

## 🚀 Применение конфигурации

### 1. Создание символических ссылок
```bash
# Основной домен
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/

# MDT поддомен (если используется)
sudo ln -s /etc/nginx/sites-available/mdt.your-domain.com /etc/nginx/sites-enabled/
```

### 2. Проверка конфигурации
```bash
sudo nginx -t
```

### 3. Перезагрузка nginx
```bash
sudo systemctl reload nginx
```

### 4. Проверка статуса
```bash
sudo systemctl status nginx
```

## 🔍 Проверка работоспособности

### Тестирование API
```bash
curl -I https://your-domain.com/api/health
```

### Тестирование клиента
```bash
curl -I https://your-domain.com
```

### Тестирование MDT
```bash
curl -I https://mdt.your-domain.com
```

## 📊 Мониторинг

### Просмотр логов
```bash
# Логи доступа
sudo tail -f /var/log/nginx/your-domain.com.access.log

# Логи ошибок
sudo tail -f /var/log/nginx/your-domain.com.error.log
```

### Проверка портов
```bash
# Проверка что backend работает на порту 5000
sudo netstat -tlnp | grep :5000

# Проверка что nginx слушает порты 80 и 443
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## 🚨 Troubleshooting

### Проблема: 502 Bad Gateway
```bash
# Проверка что backend запущен
pm2 status

# Проверка логов backend
pm2 logs roleplayidentity

# Проверка что порт 5000 открыт
sudo netstat -tlnp | grep :5000
```

### Проблема: 404 Not Found
```bash
# Проверка путей к файлам
ls -la /var/www/app/dist/apps/client/
ls -la /var/www/app/dist/apps/mdtclient/

# Проверка прав доступа
sudo chown -R www-data:www-data /var/www/app/dist/
```

### Проблема: CORS ошибки
```bash
# Проверка заголовков CORS в nginx
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-domain.com/api/health
``` 