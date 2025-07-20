# 🔄 Настройка GitHub Actions для автоматического деплоя

## Обзор

GitHub Actions workflow автоматически развертывает приложение на VPS при каждом push в ветку `main`.

## 📋 Требования

### На VPS:
- ✅ Node.js 20+ установлен
- ✅ PM2 установлен (`npm install -g pm2`)
- ✅ SSH доступ настроен
- ✅ Директория `/var/www/roleplayidentity` создана
- ✅ Переменные окружения настроены

### В GitHub:
- ✅ SSH ключ для деплоя
- ✅ GitHub Secrets настроены

## 🔑 Настройка GitHub Secrets

### Шаг 1: Создание SSH ключа для деплоя

```bash
# На локальной машине создаем SSH ключ
ssh-keygen -t rsa -b 4096 -C "deploy@roleplayidentity" -f ~/.ssh/deploy_key

# Копируем публичный ключ на VPS
ssh-copy-id -i ~/.ssh/deploy_key.pub username@your-vps-ip

# Или вручную добавить в ~/.ssh/authorized_keys на VPS
cat ~/.ssh/deploy_key.pub
```

### Шаг 2: Настройка GitHub Secrets

Перейдите в **Settings > Secrets and variables > Actions** вашего репозитория и добавьте:

#### `VPS_HOST`
```
your-vps-ip-or-domain.com
```

#### `VPS_USER`
```
username
```

#### `DEPLOY_KEY`
```
-----BEGIN OPENSSH PRIVATE KEY-----
(содержимое приватного ключа deploy_key)
-----END OPENSSH PRIVATE KEY-----
```

## 🛠️ Подготовка VPS

### Создание директории и настройка прав:

```bash
# Создание директории
sudo mkdir -p /var/www/roleplayidentity
sudo chown $USER:$USER /var/www/roleplayidentity

# Установка PM2
sudo npm install -g pm2

# Настройка автозапуска PM2
pm2 startup
# Выполните команду, которую предложит PM2
```

### Настройка переменных окружения:

```bash
cd /var/www/roleplayidentity

# Создание .env файла
nano .env
```

**Содержимое .env:**
```env
NODE_ENV=production
PORT=5000
APP_URL=https://your-domain.com

# Supabase
DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://axgtvvcimqoyxbfvdrok.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Безопасность
JWT_SECRET=your-very-long-and-secure-jwt-secret-at-least-32-characters
```

## 🔄 Тестирование деплоя

### Ручной запуск:

1. Перейдите в **Actions** вашего репозитория
2. Выберите workflow **Deploy to VPS**
3. Нажмите **Run workflow**
4. Выберите ветку `main`
5. Нажмите **Run workflow**

### Автоматический запуск:

При каждом push в ветку `main` деплой запустится автоматически.

## 📊 Мониторинг деплоя

### В GitHub Actions:
- Перейдите в **Actions** → **Deploy to VPS**
- Просматривайте логи каждого шага
- Проверяйте статус выполнения

### На VPS:
```bash
# Проверка статуса PM2
pm2 status

# Просмотр логов
pm2 logs roleplayidentity

# Проверка процесса
ps aux | grep node

# Проверка порта
netstat -tlnp | grep :5000
```

## 🚨 Troubleshooting

### Проблема: SSH подключение не работает

```bash
# Проверка SSH ключа
ssh -i ~/.ssh/deploy_key username@your-vps-ip

# Проверка прав на ключ
chmod 600 ~/.ssh/deploy_key

# Проверка authorized_keys на VPS
cat ~/.ssh/authorized_keys
```

### Проблема: PM2 не установлен

```bash
# Установка PM2
sudo npm install -g pm2

# Проверка установки
pm2 --version
```

### Проблема: Переменные окружения не настроены

```bash
# Проверка .env файла
cat /var/www/roleplayidentity/.env

# Проверка переменных в PM2
pm2 env roleplayidentity
```

### Проблема: Приложение не запускается

```bash
# Проверка логов PM2
pm2 logs roleplayidentity --lines 50

# Проверка логов системы
journalctl -u pm2-root -f

# Проверка прав доступа
ls -la /var/www/roleplayidentity/
```

## 🔧 Дополнительные настройки

### Настройка Nginx (если используется):

```bash
# Создание конфигурации Nginx
sudo nano /etc/nginx/sites-available/roleplayidentity

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Активация сайта
sudo ln -sf /etc/nginx/sites-available/roleplayidentity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Настройка SSL (Let's Encrypt):

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Оптимизация

### Кэширование зависимостей:

GitHub Actions автоматически кэширует `node_modules` для ускорения сборки.

### Параллельные деплои:

Workflow настроен так, чтобы избежать конфликтов при параллельных деплоях.

### Откат к предыдущей версии:

```bash
# Откат к предыдущей версии в PM2
pm2 rollback roleplayidentity

# Или перезапуск с предыдущим кодом
cd /var/www/roleplayidentity
git log --oneline -5
git checkout <previous-commit>
pm2 restart roleplayidentity
```

## 🔒 Безопасность

### Рекомендации:

1. **Используйте отдельного пользователя** для деплоя
2. **Ограничьте SSH доступ** по IP
3. **Регулярно обновляйте** SSH ключи
4. **Мониторьте логи** на подозрительную активность
5. **Используйте fail2ban** для защиты от брутфорса

### Настройка fail2ban:

```bash
# Установка
sudo apt install fail2ban -y

# Настройка
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📞 Поддержка

### Полезные команды:

```bash
# Информация о деплое
pm2 show roleplayidentity

# Перезапуск приложения
pm2 restart roleplayidentity

# Остановка приложения
pm2 stop roleplayidentity

# Удаление приложения из PM2
pm2 delete roleplayidentity

# Сохранение конфигурации PM2
pm2 save

# Восстановление конфигурации PM2
pm2 resurrect
```

### Логи для диагностики:

```bash
# Логи GitHub Actions
# Перейдите в Actions → Deploy to VPS → конкретный run

# Логи PM2
pm2 logs roleplayidentity --lines 100

# Логи системы
journalctl -u pm2-root -f

# Логи Nginx (если используется)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 Заключение

После настройки GitHub Actions ваш проект будет автоматически развертываться на VPS при каждом push в ветку `main`.

**Преимущества:**
- ✅ Автоматический деплой
- ✅ Откат к предыдущим версиям
- ✅ Мониторинг и логирование
- ✅ Безопасность и контроль доступа
- ✅ Простота обновлений

**Время настройки:** ~30 минут
**Сложность:** Средняя
**Надежность:** Высокая 