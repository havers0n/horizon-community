# 🚀 Быстрая настройка автодеплоя

## Обзор

Улучшенный GitHub Actions workflow для автоматического развертывания на VPS с безопасной передачей переменных окружения.

## 📋 Требования

### На VPS:
- ✅ Node.js 20+ установлен
- ✅ PM2 установлен (`npm install -g pm2`)
- ✅ SSH доступ настроен
- ✅ Директория `/var/www/app` создана

### В GitHub:
- ✅ SSH ключ для деплоя
- ✅ GitHub Secrets настроены

## 🔑 Настройка GitHub Secrets

### 1. Создание SSH ключа:

```bash
# Создаем SSH ключ
ssh-keygen -t rsa -b 4096 -C "deploy@roleplayidentity" -f ~/.ssh/deploy_key

# Копируем публичный ключ на VPS
ssh-copy-id -i ~/.ssh/deploy_key.pub username@your-vps-ip
```

### 2. Настройка Secrets в GitHub:

Перейдите в **Settings > Secrets and variables > Actions** и добавьте:

#### **Обязательные Secrets для подключения:**
| Secret | Значение |
|--------|----------|
| `VPS_HOST` | `your-vps-ip-or-domain.com` |
| `VPS_USER` | `username` |
| `DEPLOY_KEY` | Содержимое приватного ключа `~/.ssh/deploy_key` |

#### **Обязательные Secrets для приложения:**
| Secret | Значение |
|--------|----------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `SUPABASE_URL` | `https://axgtvvcimqoyxbfvdrok.supabase.co` |
| `SUPABASE_ANON_KEY` | `your-anon-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` |
| `DATABASE_URL` | `postgresql://postgres.axgtvvcimqoyxbfvdrok:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `your-very-long-and-secure-jwt-secret-at-least-32-characters` |

#### **Дополнительные Secrets для клиента:**
| Secret | Значение |
|--------|----------|
| `VITE_SUPABASE_URL` | `https://axgtvvcimqoyxbfvdrok.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |

## 🛠️ Подготовка VPS

### 1. Создание директории:

```bash
sudo mkdir -p /var/www/app
sudo chown $USER:$USER /var/www/app
```

### 2. Установка PM2:

```bash
sudo npm install -g pm2
pm2 startup
# Выполните команду, которую предложит PM2
```

### 3. Настройка переменных окружения:

**Теперь .env файл создается автоматически из GitHub Secrets!**

## 🔄 Тестирование

### Ручной запуск:
1. Перейдите в **Actions** → **Deploy to VPS**
2. Нажмите **Run workflow**
3. Выберите ветку `main`
4. Нажмите **Run workflow**

### Автоматический запуск:
При каждом push в ветку `main` деплой запустится автоматически.

## 📊 Мониторинг

### Проверка статуса:
```bash
# На VPS
pm2 status
pm2 logs roleplayidentity

# Проверка порта
netstat -tlnp | grep :5000

# Проверка .env файла
cat /var/www/app/.env
```

### Логи GitHub Actions:
- Перейдите в **Actions** → **Deploy to VPS**
- Просматривайте логи каждого шага

## 🚨 Troubleshooting

### Проблема: SSH не работает
```bash
# Проверка подключения
ssh -i ~/.ssh/deploy_key username@your-vps-ip

# Проверка прав
chmod 600 ~/.ssh/deploy_key
```

### Проблема: PM2 не установлен
```bash
sudo npm install -g pm2
pm2 --version
```

### Проблема: Приложение не запускается
```bash
# Проверка логов
pm2 logs roleplayidentity --lines 50

# Проверка переменных
pm2 env roleplayidentity

# Проверка .env файла
cat /var/www/app/.env
```

### Проблема: Отсутствуют GitHub Secrets
```bash
# Проверьте, что все Secrets настроены в GitHub
# Перейдите в Settings > Secrets and variables > Actions
```

## ⚡ Что делает workflow:

1. **Checkout** - клонирует код
2. **Setup Node.js** - устанавливает Node.js 20 с кэшированием
3. **Install dependencies** - устанавливает зависимости
4. **Build** - собирает приложение с переменными из Secrets
5. **Install production dependencies** - устанавливает только production зависимости
6. **Create deployment package** - создает оптимизированный архив (без env.example)
7. **Deploy** - копирует архив на VPS
8. **Setup & Restart** - создает .env из Secrets и безопасно перезапускает приложение
9. **Health check** - проверяет работоспособность

## 🚀 Улучшения безопасности:

- ✅ **Передача Secrets при сборке** - переменные доступны во время сборки
- ✅ **Автоматическое создание .env** - файл создается из GitHub Secrets
- ✅ **Исключение env.example** - не передается в продакшен
- ✅ **Безопасный рестарт** - `pm2 reload` вместо stop/delete/start
- ✅ **Кэширование** - npm кэш для ускорения сборки
- ✅ **Оптимизированная передача** - сжатый архив вместо всех файлов

Подробнее: [Оптимизации деплоя](DEPLOYMENT_OPTIMIZATIONS.md)

## 🎉 Готово!

После настройки ваш проект будет автоматически развертываться на VPS при каждом push в ветку `main`.

**Время настройки:** ~15 минут
**Сложность:** Низкая
**Надежность:** Высокая
**Безопасность:** Максимальная 