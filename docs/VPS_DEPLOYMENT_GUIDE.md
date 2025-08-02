# 🚀 Руководство по развертыванию на VPS

## Обзор

Проект **RolePlayIdentity** готов к развертыванию на VPS. Система использует:
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript  
- **Database**: Supabase Cloud (PostgreSQL)
- **Authentication**: JWT + Supabase Auth

## ✅ Готовность к продакшену

### ✅ Что готово:
- ✅ Архитектура production-ready
- ✅ Supabase Cloud интеграция
- ✅ Безопасность (RLS, JWT, CORS)
- ✅ Система сборки
- ✅ Документация
- ✅ Скрипты автоматизации

### ⚠️ Что исправлено:
- ✅ Конфигурация сервера для VPS
- ✅ Переменные окружения
- ✅ Production сборка
- ✅ Systemd сервис
- ✅ Nginx конфигурация

## 📋 Требования к VPS

### Минимальные требования:
- **OS**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 2GB
- **CPU**: 1 vCore
- **Storage**: 20GB
- **Node.js**: 18+

### Рекомендуемые требования:
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 4GB
- **CPU**: 2 vCore
- **Storage**: 40GB SSD
- **Node.js**: 20+

## 🛠️ Пошаговое развертывание

### Шаг 1: Подготовка VPS

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Nginx
sudo apt install nginx -y

# Установка PM2 (альтернатива systemd)
sudo npm install -g pm2

# Установка Git
sudo apt install git -y
```

### Шаг 2: Клонирование проекта

```bash
# Создание пользователя для приложения
sudo useradd -m -s /bin/bash appuser
sudo usermod -aG sudo appuser

# Переключение на пользователя
sudo su - appuser

# Клонирование проекта
git clone https://github.com/your-username/RolePlayIdentity.git
cd RolePlayIdentity
```

### Шаг 3: Настройка переменных окружения

```bash
# Копирование примера
cp env.example .env

# Редактирование переменных
nano .env
```

**Обязательные переменные:**
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

### Шаг 4: Автоматическая настройка

```bash
# Запуск автоматической настройки
npm run setup:vps
```

**Что делает скрипт:**
- ✅ Проверяет переменные окружения
- ✅ Устанавливает зависимости
- ✅ Собирает приложение
- ✅ Создает systemd сервис
- ✅ Настраивает Nginx
- ✅ Настраивает файрвол

### Шаг 5: Ручная настройка (если нужно)

#### Настройка systemd сервиса:
```bash
sudo systemctl start roleplayidentity
sudo systemctl enable roleplayidentity
sudo systemctl status roleplayidentity
```

#### Настройка Nginx:
```bash
# Редактирование конфигурации
sudo nano /etc/nginx/sites-available/roleplayidentity

# Активация сайта
sudo ln -sf /etc/nginx/sites-available/roleplayidentity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Настройка SSL (Let's Encrypt):
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Управление приложением

### Команды systemd:
```bash
# Запуск
sudo systemctl start roleplayidentity

# Остановка
sudo systemctl stop roleplayidentity

# Перезапуск
sudo systemctl restart roleplayidentity

# Статус
sudo systemctl status roleplayidentity

# Логи
sudo journalctl -u roleplayidentity -f
```

### Команды PM2 (альтернатива):
```bash
# Запуск
pm2 start dist/server.js --name roleplayidentity

# Остановка
pm2 stop roleplayidentity

# Перезапуск
pm2 restart roleplayidentity

# Статус
pm2 status

# Логи
pm2 logs roleplayidentity
```

## 📊 Мониторинг

### Проверка работоспособности:
```bash
# Проверка порта
sudo netstat -tlnp | grep :5000

# Проверка процесса
ps aux | grep node

# Проверка логов
sudo journalctl -u roleplayidentity --since "1 hour ago"
```

### Настройка мониторинга:
```bash
# Установка htop для мониторинга
sudo apt install htop -y

# Установка logrotate
sudo nano /etc/logrotate.d/roleplayidentity
```

## 🔒 Безопасность

### Настройка файрвола:
```bash
# Включение UFW
sudo ufw enable

# Разрешенные порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Проверка статуса
sudo ufw status
```

### Настройка fail2ban:
```bash
# Установка
sudo apt install fail2ban -y

# Настройка
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🚨 Troubleshooting

### Проблема: Приложение не запускается
```bash
# Проверка логов
sudo journalctl -u roleplayidentity -f

# Проверка переменных окружения
sudo systemctl show roleplayidentity --property=Environment

# Проверка прав доступа
ls -la /path/to/app
```

### Проблема: Nginx не проксирует запросы
```bash
# Проверка конфигурации
sudo nginx -t

# Проверка логов
sudo tail -f /var/log/nginx/error.log

# Проверка портов
sudo netstat -tlnp | grep :5000
```

### Проблема: Ошибки базы данных
```bash
# Проверка подключения
node scripts/check_supabase_connection.js

# Проверка переменных
echo $DATABASE_URL

# Тест API
curl http://localhost:5000/api/health
```

## 📈 Масштабирование

### Горизонтальное масштабирование:
```bash
# Настройка балансировщика нагрузки
sudo apt install haproxy -y

# Конфигурация HAProxy
sudo nano /etc/haproxy/haproxy.cfg
```

### Вертикальное масштабирование:
```bash
# Увеличение лимитов Node.js
sudo nano /etc/systemd/system/roleplayidentity.service
# Добавить: Environment=NODE_OPTIONS="--max-old-space-size=4096"
```

## 🔄 Обновления

### Автоматическое обновление:
```bash
# Создание скрипта обновления
nano update.sh

#!/bin/bash
cd /path/to/app
git pull
npm install
npm run build:production
sudo systemctl restart roleplayidentity
```

### Ручное обновление:
```bash
# Остановка приложения
sudo systemctl stop roleplayidentity

# Обновление кода
git pull

# Пересборка
npm run build:production

# Запуск
sudo systemctl start roleplayidentity
```

## 📞 Поддержка

### Полезные команды:
```bash
# Информация о системе
uname -a
node --version
npm --version

# Статус сервисов
sudo systemctl status nginx
sudo systemctl status roleplayidentity

# Использование ресурсов
htop
df -h
free -h
```

### Логи для диагностики:
```bash
# Логи приложения
sudo journalctl -u roleplayidentity -f

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи системы
sudo dmesg | tail
```

---

## 🎉 Заключение

Проект полностью готов к развертыванию на VPS. Все критические проблемы исправлены, добавлены необходимые скрипты и документация.

**Следующие шаги:**
1. Выберите VPS провайдера
2. Следуйте пошаговому руководству
3. Настройте домен и SSL
4. Настройте мониторинг
5. Протестируйте все функции

**Время развертывания:** ~30-60 минут
**Сложность:** Средняя
**Стабильность:** Высокая 