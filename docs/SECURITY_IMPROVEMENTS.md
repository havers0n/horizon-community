# 🔐 Улучшения безопасности деплоя

## Обзор

Внесены критические улучшения безопасности в GitHub Actions workflow для защиты конфиденциальных данных.

## 🚨 Проблемы безопасности (исправлены)

### ❌ Старый подход:
1. **env.example в продакшене** - конфиденциальные данные могли попасть в архив
2. **Переменные не передавались при сборке** - приложение собиралось без production переменных
3. **Ручное создание .env** - риск ошибок и утечки данных
4. **Хардкод переменных** - небезопасно и негибко

### ✅ Новый подход:
1. **Автоматическое создание .env из Secrets** - безопасная передача переменных
2. **Переменные доступны при сборке** - корректная сборка для production
3. **Исключение env.example** - конфиденциальные данные не передаются
4. **Централизованное управление** - все переменные в GitHub Secrets

## 🔑 Требуемые GitHub Secrets

### Обязательные для подключения:
| Secret | Описание | Пример |
|--------|----------|--------|
| `VPS_HOST` | IP или домен VPS | `192.168.1.100` |
| `VPS_USER` | Имя пользователя | `root` |
| `DEPLOY_KEY` | SSH приватный ключ | `-----BEGIN OPENSSH PRIVATE KEY-----` |

### Обязательные для приложения:
| Secret | Описание | Пример |
|--------|----------|--------|
| `NODE_ENV` | Окружение | `production` |
| `PORT` | Порт приложения | `5000` |
| `SUPABASE_URL` | URL Supabase | `https://project.supabase.co` |
| `SUPABASE_ANON_KEY` | Публичный ключ Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Приватный ключ Supabase | `eyJ...` |
| `DATABASE_URL` | URL базы данных | `postgresql://...` |
| `JWT_SECRET` | Секрет для JWT | `very-long-secret-32-chars` |

### Дополнительные для клиента:
| Secret | Описание | Пример |
|--------|----------|--------|
| `VITE_SUPABASE_URL` | URL для клиента | `https://project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Ключ для клиента | `eyJ...` |

## 🔧 Технические улучшения

### 1. Передача переменных при сборке

**Старый подход:**
```yaml
- name: Build application
  run: npm run build:production
  env:
    NODE_ENV: production  # Хардкод
```

**Новый подход:**
```yaml
- name: Build application
  run: npm run build:production
  env:
    NODE_ENV: ${{ secrets.NODE_ENV }}
    PORT: ${{ secrets.PORT }}
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### 2. Автоматическое создание .env

**Старый подход:**
```bash
# Копирование примера (небезопасно)
cp env.example .env
```

**Новый подход:**
```bash
# Создание из Secrets (безопасно)
cat > .env <<EOL
NODE_ENV=${{ secrets.NODE_ENV }}
PORT=${{ secrets.PORT }}
SUPABASE_URL=${{ secrets.SUPABASE_URL }}
SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
DATABASE_URL=${{ secrets.DATABASE_URL }}
JWT_SECRET=${{ secrets.JWT_SECRET }}
VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}
EOL
```

### 3. Исключение env.example

**Старый архив:**
```bash
tar -czf deployment.tar.gz \
  dist/ \
  package.json \
  env.example  # ❌ Конфиденциальные данные
  ...
```

**Новый архив:**
```bash
tar -czf deployment.tar.gz \
  dist/ \
  package.json \
  # env.example исключен ✅
  ...
```

## 🛡️ Преимущества безопасности

### ✅ Защита конфиденциальных данных:
- Переменные окружения не попадают в репозиторий
- env.example не передается в продакшен
- Все секреты хранятся в GitHub Secrets

### ✅ Централизованное управление:
- Все переменные в одном месте
- Легко обновлять и отслеживать
- Контроль доступа через GitHub

### ✅ Автоматизация:
- Нет ручных ошибок при настройке
- Воспроизводимый процесс деплоя
- Аудит изменений через GitHub Actions

### ✅ Изоляция окружений:
- Разные переменные для разных окружений
- Легко переключаться между staging/production
- Безопасное тестирование

## 🚨 Рекомендации по безопасности

### 1. Регулярное обновление секретов:
```bash
# Генерация нового JWT секрета
openssl rand -base64 32

# Обновление в GitHub Secrets
# Settings > Secrets and variables > Actions
```

### 2. Ротация SSH ключей:
```bash
# Создание нового ключа
ssh-keygen -t rsa -b 4096 -C "deploy@roleplayidentity" -f ~/.ssh/deploy_key_new

# Обновление на VPS
ssh-copy-id -i ~/.ssh/deploy_key_new.pub username@your-vps-ip

# Обновление в GitHub Secrets
```

### 3. Мониторинг доступа:
```bash
# Проверка SSH логов на VPS
sudo tail -f /var/log/auth.log

# Проверка GitHub Actions логов
# Actions > Deploy to VPS > конкретный run
```

### 4. Ограничение доступа:
```bash
# Настройка fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Ограничение SSH по IP (если возможно)
sudo ufw allow from YOUR_IP to any port 22
```

## 📊 Сравнение безопасности

| Аспект | Старый подход | Новый подход |
|--------|---------------|--------------|
| Хранение секретов | В файлах | GitHub Secrets |
| Передача данных | Через файлы | Через переменные |
| Риск утечки | Высокий | Минимальный |
| Управление | Ручное | Автоматическое |
| Аудит | Нет | Полный |
| Изоляция | Слабая | Сильная |

## 🎯 Заключение

Новый подход обеспечивает максимальную безопасность:

- ✅ **Конфиденциальные данные защищены**
- ✅ **Автоматизация процесса**
- ✅ **Централизованное управление**
- ✅ **Полный аудит изменений**
- ✅ **Простота обновления**

Рекомендуется немедленно перейти на новый workflow для всех production деплоев. 