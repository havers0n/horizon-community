# 🚀 Оптимизации деплоя

## Обзор

Доступны две версии workflow для деплоя с разными уровнями оптимизации.

## 📁 Доступные workflow

### 1. `deploy.yml` - Стандартная версия
- ✅ Включает node_modules в архив
- ✅ Быстрый деплой (без установки зависимостей на VPS)
- ✅ Больший размер архива

### 2. `deploy-optimized.yml` - Оптимизированная версия
- ✅ Исключает node_modules из архива
- ✅ Устанавливает зависимости на VPS
- ✅ Меньший размер архива
- ✅ Более гибкая настройка зависимостей

## 🔧 Оптимизации

### Исключение лишних файлов

**Стандартная версия включает:**
```
dist/           # Собранное приложение
package.json    # Зависимости
package-lock.json
env.example     # Пример переменных
scripts/        # Скрипты
public/         # Статические файлы
supabase/       # Конфигурация Supabase
migrations/     # Миграции БД
docs/           # Документация
README.md       # README
node_modules/   # Зависимости (включены)
```

**Оптимизированная версия включает:**
```
dist/           # Собранное приложение
package.json    # Зависимости
package-lock.json
env.example     # Пример переменных
scripts/        # Скрипты
public/         # Статические файлы
supabase/       # Конфигурация Supabase
migrations/     # Миграции БД
docs/           # Документация
README.md       # README
# node_modules/ НЕ включены
```

### Безопасный рестарт PM2

**Старый подход:**
```bash
pm2 stop roleplayidentity
pm2 delete roleplayidentity
pm2 start dist/server.js --name roleplayidentity --env production
```

**Новый подход:**
```bash
if pm2 list | grep -q "roleplayidentity"; then
  pm2 reload roleplayidentity  # Безопасный рестарт
else
  pm2 start dist/server.js --name roleplayidentity --env production
fi
```

**Преимущества:**
- ✅ Нет downtime
- ✅ Сохраняется состояние приложения
- ✅ Быстрее выполняется
- ✅ Меньше ошибок

### Оптимизация установки зависимостей

**Стандартная версия:**
- Устанавливает зависимости в GitHub Actions
- Включает node_modules в архив
- Быстрая передача на VPS

**Оптимизированная версия:**
- Устанавливает только production зависимости на VPS
- Использует флаги оптимизации:
  ```bash
  npm ci --production --no-audit --no-fund
  ```

## 📊 Сравнение производительности

| Метрика | Стандартная | Оптимизированная |
|---------|-------------|------------------|
| Размер архива | ~50-100MB | ~10-20MB |
| Время передачи | 30-60 сек | 5-15 сек |
| Время установки на VPS | 0 сек | 30-60 сек |
| Общее время деплоя | 2-3 мин | 2-3 мин |
| Гибкость зависимостей | Низкая | Высокая |
| Использование диска | Высокое | Низкое |

## 🎯 Рекомендации по выбору

### Используйте стандартную версию если:
- ✅ VPS имеет медленное интернет-соединение
- ✅ Хотите минимизировать время установки на VPS
- ✅ Используете стабильные зависимости
- ✅ Имеете достаточно места на диске

### Используйте оптимизированную версию если:
- ✅ VPS имеет быстрое интернет-соединение
- ✅ Хотите сэкономить место на диске
- ✅ Часто обновляете зависимости
- ✅ Нужна гибкость в управлении зависимостями

## 🔄 Переключение между версиями

### Активация стандартной версии:
```yaml
# В .github/workflows/deploy.yml
name: Deploy to VPS
```

### Активация оптимизированной версии:
```yaml
# В .github/workflows/deploy-optimized.yml
name: Deploy to VPS (Optimized)
```

### Переименование файлов:
```bash
# Для активации оптимизированной версии
mv .github/workflows/deploy.yml .github/workflows/deploy-standard.yml
mv .github/workflows/deploy-optimized.yml .github/workflows/deploy.yml
```

## 🚨 Troubleshooting

### Проблема: Большой размер архива
```bash
# Проверьте размер node_modules
du -sh node_modules/

# Исключите ненужные файлы
tar -czf test.tar.gz --exclude='node_modules/*' --exclude='.git/*' .
```

### Проблема: Медленная установка зависимостей
```bash
# Используйте кэш npm
npm config set cache /path/to/cache

# Используйте yarn вместо npm
yarn install --production
```

### Проблема: Ошибки при reload PM2
```bash
# Проверьте логи PM2
pm2 logs roleplayidentity

# Принудительный рестарт
pm2 restart roleplayidentity
```

## 📈 Дополнительные оптимизации

### Кэширование зависимостей на VPS:
```bash
# Создание кэша
mkdir -p ~/.npm-cache
npm config set cache ~/.npm-cache

# Использование кэша в workflow
npm ci --production --cache ~/.npm-cache
```

### Сжатие архива:
```bash
# Использование pigz для параллельного сжатия
tar -I pigz -cf deployment.tar.gz dist/ package.json ...
```

### Параллельная загрузка:
```yaml
# Разделение на несколько архивов
- name: Create core package
  run: tar -czf core.tar.gz dist/ package.json

- name: Create assets package  
  run: tar -czf assets.tar.gz public/ scripts/
```

## 🎉 Заключение

Обе версии workflow обеспечивают надежный и быстрый деплой. Выбор зависит от ваших приоритетов:

- **Скорость передачи** → Стандартная версия
- **Экономия места** → Оптимизированная версия
- **Гибкость** → Оптимизированная версия
- **Простота** → Стандартная версия

Рекомендуется начать со стандартной версии и перейти на оптимизированную при необходимости. 