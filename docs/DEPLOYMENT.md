# Развёртывание в облачной Supabase

## Шаги для переноса данных на облачную Supabase

### 1. Подготовка к деплою

1. **Создать облачный проект Supabase** (уже сделано - проект "horizon")
2. **Подключиться к проекту**: `npx supabase link --project-ref axgtvvcimqoyxbfvdrok`
3. **Применить миграции**: `npx supabase db push` (уже сделано)

### 2. Настройка переменных окружения

Скопируйте файл `.env.production` и заполните следующие значения:

```bash
# Получить пароль базы данных
DATABASE_URL="postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR_PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Обновить URL приложения
APP_URL="https://your-app-domain.com"

# Создать безопасный JWT secret
JWT_SECRET="your-production-jwt-secret-should-be-very-long-and-secure-at-least-32-characters"
```

### 3. Миграция данных

Если у вас есть данные в локальной базе данных, которые нужно перенести:

#### Экспорт данных из локальной базы данных:
```bash
# Экспорт всех данных
npx supabase db dump --local > local_data.sql

# Или экспорт только данных (без структуры)
npx supabase db dump --local --data-only > local_data_only.sql
```

#### Импорт данных в облачную базу данных:
```bash
# Импорт данных в облачную базу данных
psql "postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR_PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres" < local_data_only.sql
```

### 4. Настройка Auth в Supabase Dashboard

1. Перейдите в **Settings > Authentication**
2. Настройте **Site URL**: `https://your-app-domain.com`
3. Добавьте **Redirect URLs**: `https://your-app-domain.com/auth/callback`
4. Настройте **Email templates** при необходимости
5. Включите необходимые **OAuth providers**

### 5. Настройка Row Level Security (RLS)

RLS уже настроен в миграции `001_initial_schema.sql`. Проверьте политики в Supabase Dashboard:

1. Перейдите в **Authentication > Policies**
2. Убедитесь, что все политики применены корректно
3. Протестируйте доступ к данным

### 6. Проверка подключения

Проверьте, что приложение может подключиться к облачной базе данных:

```bash
# Установить переменные окружения для продакшн
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR_PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Запустить приложение
npm run start
```

### 7. Настройка CI/CD

Для автоматического деплоя миграций:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Supabase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to Supabase
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
      run: |
        npx supabase login --token $SUPABASE_ACCESS_TOKEN
        npx supabase link --project-ref axgtvvcimqoyxbfvdrok
        npx supabase db push
```

### 8. Мониторинг и логи

1. **Supabase Dashboard**: Мониторинг запросов, ошибок и производительности
2. **Logs**: Просмотр логов базы данных и API
3. **Metrics**: Отслеживание использования ресурсов

### 9. Резервное копирование

Настройте автоматическое резервное копирование:

```bash
# Создание backup'а
npx supabase db dump --project-ref axgtvvcimqoyxbfvdrok > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из backup'а
psql "postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR_PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres" < backup_file.sql
```

### 10. Полезные команды

```bash
# Посмотреть статус проекта
npx supabase projects list

# Посмотреть API ключи
npx supabase projects api-keys

# Сбросить базу данных (осторожно!)
npx supabase db reset

# Создать новую миграцию
npx supabase migration new migration_name

# Посмотреть различия между локальной и облачной базой
npx supabase db diff --schema public
```

## Важные моменты

1. **Безопасность**: Никогда не коммитьте `.env.production` в репозиторий
2. **SSL**: В продакшене всегда используется SSL подключение
3. **Connection Pooling**: Supabase использует connection pooling автоматически
4. **Rate Limiting**: Настройте лимиты в Dashboard для защиты от злоупотреблений
5. **Monitoring**: Регулярно проверяйте метрики и логи

## Troubleshooting

### Проблема: Ошибка подключения к базе данных
- Проверьте корректность DATABASE_URL
- Убедитесь, что пароль правильный
- Проверьте настройки файрвола

### Проблема: Ошибки RLS
- Убедитесь, что пользователь авторизован
- Проверьте политики безопасности
- Протестируйте с service_role ключом

### Проблема: Медленные запросы
- Добавьте необходимые индексы
- Оптимизируйте запросы
- Используйте EXPLAIN ANALYZE для анализа
