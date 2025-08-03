# 🚀 Шаблон .env файла для продакшена

## 📋 Полная конфигурация для VPS с nginx

Создайте файл `.env` в корне проекта на вашем VPS:

```env
# ========================================
# ОСНОВНЫЕ НАСТРОЙКИ ПРИЛОЖЕНИЯ
# ========================================
NODE_ENV=production
PORT=5000
APP_URL=https://your-domain.com

# Таймзона
TZ=Europe/Moscow

# ========================================
# SUPABASE КОНФИГУРАЦИЯ
# ========================================
SUPABASE_URL=https://axgtvvcimqoyxbfvdrok.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# База данных
DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR-PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres

# ========================================
# БЕЗОПАСНОСТЬ
# ========================================
JWT_SECRET=your-very-long-and-secure-jwt-secret-at-least-32-characters-long

# ========================================
# КЛИЕНТСКИЕ ПЕРЕМЕННЫЕ (для сборки)
# ========================================
VITE_SUPABASE_URL=https://axgtvvcimqoyxbfvdrok.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://your-domain.com/api
VITE_APP_URL=https://your-domain.com

# ========================================
# MDT КОНФИГУРАЦИЯ
# ========================================
VITE_MDT_API_URL=https://your-domain.com/api
VITE_MDT_DOMAIN=https://your-domain.com/mdt

# ========================================
# FIVEM КОНФИГУРАЦИЯ
# ========================================
FIVEM_API_URL=https://your-domain.com/api
FIVEM_DOMAIN=https://your-domain.com

# ========================================
# ЛОГИРОВАНИЕ
# ========================================
LOG_LEVEL=info
LOG_FILE=/var/log/roleplayidentity/app.log

# ========================================
# ПРОИЗВОДИТЕЛЬНОСТЬ
# ========================================
# Количество воркеров (по умолчанию количество CPU ядер)
WORKERS=auto

# Размер пула соединений с базой данных
DB_POOL_SIZE=10
DB_POOL_TIMEOUT=30000

# ========================================
# КЭШИРОВАНИЕ
# ========================================
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379

# ========================================
# EMAIL (если используется)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@your-domain.com

# ========================================
# ФАЙЛЫ И ЗАГРУЗКИ
# ========================================
UPLOAD_PATH=/var/www/app/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# ========================================
# МОНИТОРИНГ
# ========================================
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true
```

## 🔧 Инструкция по настройке

### 1. Создание файла на VPS
```bash
cd /var/www/app
nano .env
```

### 2. Заполнение обязательных полей

#### Обязательные поля (замените на ваши значения):
```env
# Замените your-domain.com на ваш реальный домен
APP_URL=https://your-domain.com

# Получите из Supabase Dashboard -> Settings -> API
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Пароль от базы данных (установили при создании проекта)
DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:YOUR_ACTUAL_PASSWORD@aws-0-eu-north-1.pooler.supabase.com:5432/postgres

# Сгенерируйте безопасный JWT секрет
JWT_SECRET=your-very-long-and-secure-jwt-secret-at-least-32-characters-long
```

### 3. Генерация JWT_SECRET
```bash
# Генерация безопасного секрета
openssl rand -base64 32
```

### 4. Проверка конфигурации
```bash
# Проверка что файл создан
ls -la .env

# Проверка прав доступа
chmod 600 .env

# Проверка содержимого (безопасно)
grep -E "^(NODE_ENV|PORT|APP_URL)=" .env
```

## 🚨 Важные замечания

### Безопасность
- **НИКОГДА** не коммитьте `.env` файл в git
- Используйте разные секреты для разных окружений
- Регулярно ротируйте JWT_SECRET

### Производительность
- Установите `WORKERS` в зависимости от количества CPU ядер
- Настройте `DB_POOL_SIZE` в зависимости от нагрузки
- Включите кэширование для улучшения производительности

### Мониторинг
- Включите логирование для отладки
- Настройте health checks
- Мониторьте использование ресурсов

## 🔍 Проверка работоспособности

### Тест подключения к базе данных
```bash
# Проверка подключения
curl -X GET https://your-domain.com/api/health
```

### Тест аутентификации
```bash
# Проверка JWT
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Тест статических файлов
```bash
# Проверка клиента
curl -I https://your-domain.com

# Проверка MDT
curl -I https://your-domain.com/mdt
```

## 📊 Мониторинг переменных

### Проверка загруженных переменных
```bash
# В коде приложения
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('APP_URL:', process.env.APP_URL);
```

### Проверка через PM2
```bash
# Просмотр переменных окружения процесса
pm2 env roleplayidentity
```

## 🚨 Troubleshooting

### Проблема: Переменные не загружаются
```bash
# Проверка что dotenv установлен
npm list dotenv

# Проверка загрузки в ecosystem.config.js
cat ecosystem.config.js
```

### Проблема: Неправильные пути
```bash
# Проверка структуры проекта
ls -la /var/www/app/
ls -la /var/www/app/dist/apps/
```

### Проблема: Права доступа
```bash
# Установка правильных прав
sudo chown -R www-data:www-data /var/www/app/
sudo chmod 600 /var/www/app/.env
``` 