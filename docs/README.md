# RolePlayIdentity - Supabase Migration

Система управления департаментами для ролевого сервера, мигрированная на Supabase.

## 🚀 Деплой на VPS

### Автоматический деплой через GitHub Actions

Проект настроен для автоматического развертывания на VPS через GitHub Actions.

**Быстрый старт:**
1. Настройте [GitHub Secrets](docs/QUICK_DEPLOY_SETUP.md)
2. Подготовьте VPS согласно [руководству](VPS_DEPLOYMENT_GUIDE.md)
3. Push в ветку `main` → автоматический деплой

### Ручной деплой на Supabase Cloud

#### Предварительные требования

1. **Supabase CLI** установлен
2. **PostgreSQL client tools** (psql) для загрузки данных
3. **Node.js** для запуска скриптов

### Шаг 1: Подключение к облачному проекту

```bash
# Войти в Supabase
npx supabase login

# Подключиться к проекту
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Шаг 2: Применение миграций

```bash
# Применить миграции к облачной базе данных
npx supabase db push
```

### Шаг 3: Загрузка тестовых данных

#### Способ 1: Через PowerShell (Windows)
```powershell
# Запустить PowerShell скрипт
.\scripts\upload-seed-data.ps1
```

#### Способ 2: Через psql напрямую
```bash
# Замените [PASSWORD] на ваш пароль базы данных
psql \"postgresql://postgres.YOUR_PROJECT_REF:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres\" < supabase/seed.sql
```

#### Способ 3: Автоматический скрипт
```bash
# Запустить скрипт деплоя
node scripts/deploy-to-cloud.js
```

### Шаг 4: Настройка переменных окружения

Создайте файл `.env.production` на основе `.env.production.example`:

```env
# Базовые настройки
NODE_ENV="production"
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Приложение
APP_URL="https://your-domain.com"
JWT_SECRET="your-production-jwt-secret"
```

### Шаг 5: Настройка аутентификации

1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard/project/YOUR_PROJECT_REF)
2. Настройте **Settings > Authentication**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`
3. Настройте провайдеров OAuth при необходимости

### Шаг 6: Проверка Row Level Security

Политики RLS уже настроены в миграции. Проверьте их в Dashboard:

1. Перейдите в **Authentication > Policies**
2. Убедитесь, что все политики применены
3. Протестируйте доступ к данным

## 📊 Структура базы данных

### Таблицы

- **users** - Пользователи системы
- **departments** - Департаменты
- **applications** - Заявки на вступление/повышение
- **support_tickets** - Тикеты поддержки
- **complaints** - Жалобы
- **reports** - Отчеты
- **notifications** - Уведомления
- **tests** - Тесты для пользователей

### Особенности

- **Row Level Security (RLS)** включен для всех таблиц
- **Связь с auth.users** через поле `auth_id`
- **Политики безопасности** для разных ролей пользователей
- **Индексы** для оптимизации производительности

## 🔧 Разработка

### Локальная разработка

```bash
# Запустить локальный Supabase
npx supabase start

# Сбросить локальную базу данных
npx supabase db reset

# Создать новую миграцию
npx supabase migration new migration_name
```

### Синхронизация с облаком

```bash
# Посмотреть различия
npx supabase db diff --schema public

# Создать миграцию из различий
npx supabase db diff --schema public --file migration_name
```

## 📈 Мониторинг

### Supabase Dashboard

- **Logs**: Просмотр логов API и базы данных
- **Metrics**: Мониторинг производительности
- **Realtime**: Отслеживание активности в реальном времени

### Backup

```bash
# Создать backup
npx supabase db dump --project-ref YOUR_PROJECT_REF > backup.sql

# Восстановить из backup
psql "connection-string" < backup.sql
```

## 🛠️ Полезные команды

```bash
# Посмотреть проекты
npx supabase projects list

# Получить API ключи
npx supabase projects api-keys

# Статус локального окружения
npx supabase status

# Остановить локальное окружение
npx supabase stop
```

## 🔐 Безопасность

### Важные моменты

1. **Никогда не коммитьте** файлы с продакшн переменными
2. **Используйте SSL** для продакшн подключений
3. **Настройте RLS политики** для защиты данных
4. **Ограничьте доступ по IP** в настройках Supabase
5. **Мониторьте логи** на подозрительную активность

### Роли пользователей

- **candidate** - Кандидат на вступление
- **member** - Член департамента
- **supervisor** - Супервайзер
- **admin** - Администратор

## 🚨 Troubleshooting

### Проблемы с подключением

1. Проверьте пароль базы данных
2. Убедитесь, что IP разрешен в Supabase
3. Проверьте настройки SSL

### Проблемы с RLS

1. Убедитесь, что пользователь авторизован
2. Проверьте политики безопасности
3. Используйте service_role для отладки

### Медленные запросы

1. Добавьте индексы для часто используемых полей
2. Оптимизируйте SQL запросы
3. Используйте EXPLAIN ANALYZE для анализа

## 🔄 CI/CD с GitHub Actions

### Автоматический деплой

Проект настроен для автоматического развертывания на VPS при каждом push в ветку `main`.

**Файлы конфигурации:**
- `.github/workflows/deploy.yml` - основной workflow
- `docs/QUICK_DEPLOY_SETUP.md` - быстрая инструкция по настройке
- `docs/GITHUB_ACTIONS_SETUP.md` - подробная инструкция

**Возможности:**
- ✅ Автоматическая сборка и деплой
- ✅ Проверка здоровья приложения
- ✅ Уведомления о статусе деплоя
- ✅ Откат к предыдущим версиям
- ✅ Мониторинг и логирование

**Настройка:**
1. Создайте SSH ключ для деплоя
2. Настройте GitHub Secrets (VPS_HOST, VPS_USER, DEPLOY_KEY)
3. Подготовьте VPS с PM2
4. Настройте переменные окружения

Быстрая инструкция: [Quick Deploy Setup](docs/QUICK_DEPLOY_SETUP.md)
Подробная инструкция: [GitHub Actions Setup](docs/GITHUB_ACTIONS_SETUP.md)

## 📞 Поддержка

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://github.com/supabase/supabase/discussions
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 🎯 Roadmap

- [x] Настройка CI/CD pipeline
- [ ] Добавление мониторинга и алертов
- [ ] Интеграция с Discord API
- [ ] Добавление unit тестов
- [ ] Оптимизация производительности
