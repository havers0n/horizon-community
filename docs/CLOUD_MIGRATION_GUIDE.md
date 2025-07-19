# Руководство по переводу на облачный Supabase

## 1. Создание облачного проекта

1. Перейдите на [https://supabase.com](https://supabase.com)
2. Войдите в свой аккаунт или создайте новый
3. Нажмите "New Project"
4. Выберите организацию и регион (рекомендуется Europe (West) для пользователей из РФ)
5. Введите название проекта: "RolePlayIdentity"
6. Создайте надежный пароль для базы данных
7. Дождитесь создания проекта (обычно 2-3 минуты)

## 2. Получение конфигурационных данных

После создания проекта в разделе Settings > API найдите:
- **Project URL**: https://your-project-id.supabase.co
- **anon (public) key**: начинается с eyJ...
- **service_role (secret) key**: начинается с eyJ...

## 3. Настройка переменных окружения

Создайте файл `.env.production` или обновите существующий:

```env
# Production Configuration
NODE_ENV=production

# Supabase Cloud Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL для сервера
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# Client Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# JWT Secret (из настроек Supabase)
JWT_SECRET=your-jwt-secret

# Application URL
APP_URL=https://your-domain.com
```

## 4. Применение миграций

Необходимо применить существующие миграции к облачной базе данных:

```bash
# Связать локальный проект с облачным
supabase link --project-ref your-project-id

# Применить миграции
supabase db push
```

## 5. Настройка аутентификации

В панели Supabase перейдите в Authentication > Settings:

### URL Configuration
- Site URL: https://your-domain.com
- Redirect URLs: 
  - https://your-domain.com/auth/callback
  - https://your-domain.com/dashboard

### Email Settings
- Enable email confirmations: включить/отключить по необходимости
- Secure email change: рекомендуется включить

## 6. Настройка SMTP (для email-уведомлений)

В Authentication > Settings > SMTP Settings:
- Enable custom SMTP: Включить
- SMTP Host: smtp.gmail.com
- SMTP Port: 587
- SMTP Username: your-email@gmail.com
- SMTP Password: your-app-password

## 7. Настройка Row Level Security (RLS)

RLS политики уже включены в миграции, но проверьте их в разделе Authentication > Policies.

## 8. Обновление кода приложения

Миграции уже применены в предыдущих шагах, но убедитесь, что:
- Используется правильный URL и ключи
- Обновлены переменные окружения
- Настроен правильный импорт конфигурации

## 9. Деплой приложения

### Для Vercel/Netlify:
1. Добавьте переменные окружения в настройках проекта
2. Задеплойте приложение
3. Обновите URL в настройках Supabase

### Для собственного сервера:
1. Установите переменные окружения
2. Соберите приложение: `npm run build`
3. Запустите: `npm start`

## 10. Тестирование

1. Проверьте регистрацию пользователей
2. Проверьте вход в систему
3. Проверьте отправку email-уведомлений
4. Проверьте работу всех функций приложения

## 11. Мониторинг

В панели Supabase доступны:
- Logs: для отслеживания ошибок
- Metrics: для мониторинга производительности
- Usage: для контроля использования ресурсов

## Полезные команды

```bash
# Проверка статуса подключения
supabase status

# Просмотр логов
supabase logs

# Синхронизация схемы
supabase db pull

# Создание новой миграции
supabase migration new migration_name
```

## Troubleshooting

### Проблема: Ошибка подключения к базе данных
**Решение**: Проверьте правильность DATABASE_URL и доступность сервера

### Проблема: Ошибки аутентификации
**Решение**: Убедитесь, что SUPABASE_URL и SUPABASE_ANON_KEY правильно настроены

### Проблема: Не отправляются email-уведомления
**Решение**: Настройте SMTP в настройках Authentication

### Проблема: RLS блокирует запросы
**Решение**: Проверьте политики RLS в разделе Authentication > Policies
