# 🔧 Исправление ошибки "Failed to resolve module specifier zod"

## 📋 Описание проблемы

Ошибка `Uncaught TypeError: Failed to resolve module specifier "zod". Relative references must start with either "/", "./", or "../"` возникает в продакшене когда:

1. **Модуль `zod` исключен из бандла** через `external: ['zod']` в Vite конфигурации
2. **Отсутствует зависимость `zod`** в package.json
3. **Неправильная конфигурация ES модулей**

## ✅ Решение проблемы

### 1. Исправление Vite конфигурации

**Проблема:** В `apps/client/vite.config.ts` была строка:
```typescript
external: ['zod']
```

**Решение:** Удалите или закомментируйте эту строку:
```typescript
// external: ['zod'], // Убираем внешнюю зависимость zod
```

### 2. Проверка зависимостей

Убедитесь что `zod` установлен во всех необходимых пакетах:

```bash
# В корне проекта
npm install zod@^3.24.2

# В shared библиотеке
cd libs/shared/schema
npm install zod@^3.24.2
```

### 3. Проверка package.json

Убедитесь что в `libs/shared/schema/package.json` есть:
```json
{
  "dependencies": {
    "zod": "^3.24.2"
  }
}
```

### 4. Пересборка проекта

```bash
# Очистка
npm run clean

# Установка зависимостей
npm install

# Сборка для продакшена
npm run build:production
```

## 🔍 Диагностика

### Запуск диагностики модулей

```bash
npm run check-modules
```

Этот скрипт проверит:
- ✅ Зависимости в package.json
- ✅ Конфигурацию Vite
- ✅ Импорты в коде
- ✅ Собранные файлы

### Проверка в браузере

1. Откройте консоль разработчика (F12)
2. Перейдите на вкладку Console
3. Обновите страницу
4. Проверьте наличие ошибок модулей

## 🚨 Другие возможные проблемы

### 1. Проблемы с CSP (Content Security Policy)

Если у вас настроен CSP, убедитесь что разрешены inline скрипты:

```nginx
add_header Content-Security-Policy "script-src 'self' 'unsafe-inline' 'unsafe-eval';";
```

### 2. Проблемы с CORS

Проверьте что nginx правильно настроен для статических файлов:

```nginx
location / {
    root /var/www/app/dist/apps/client;
    try_files $uri $uri/ /index.html;
    
    # Добавьте заголовки для модулей
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
}
```

### 3. Проблемы с путями

Убедитесь что все пути к статическим файлам правильные:

```bash
# Проверка структуры
ls -la /var/www/app/dist/apps/client/
ls -la /var/www/app/dist/apps/mdtclient/
```

## 📊 Мониторинг

### Проверка логов

```bash
# Логи nginx
sudo tail -f /var/log/nginx/your-domain.com.error.log

# Логи приложения
pm2 logs roleplayidentity
```

### Проверка файлов

```bash
# Проверка что файлы собраны
ls -la dist/apps/client/
ls -la dist/apps/mdtclient/

# Проверка размера файлов
du -sh dist/apps/client/
du -sh dist/apps/mdtclient/
```

## 🔧 Дополнительные исправления

### 1. Оптимизация бандла

Если размер бандла слишком большой, используйте manualChunks:

```typescript
rollupOptions: {
  output: {
    manualChunks: {
      'zod-vendor': ['zod'],
      'forms-vendor': ['react-hook-form', '@hookform/resolvers'],
      'ui-vendor': ['@radix-ui/react-dialog', 'lucide-react'],
    }
  }
}
```

### 2. Проверка импортов

Убедитесь что все импорты используют правильный синтаксис:

```typescript
// ✅ Правильно
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ❌ Неправильно
import zod from "zod";
```

### 3. Проверка версий

Убедитесь что все пакеты совместимы:

```bash
npm ls zod
npm ls @hookform/resolvers
```

## 🚀 Быстрое исправление

Для быстрого исправления выполните:

```bash
# 1. Диагностика
npm run check-modules

# 2. Установка зависимостей
npm install

# 3. Пересборка
npm run build:production

# 4. Перезапуск
pm2 restart roleplayidentity

# 5. Проверка
curl -I https://your-domain.com
```

## 📋 Чек-лист

- [ ] Удален `external: ['zod']` из vite.config.ts
- [ ] Установлен `zod` во всех пакетах
- [ ] Пересобран проект
- [ ] Проверена консоль браузера
- [ ] Проверены логи nginx
- [ ] Проверены логи приложения

## 🆘 Если проблема остается

1. **Проверьте консоль браузера** на другие ошибки
2. **Проверьте Network вкладку** на ошибки загрузки файлов
3. **Проверьте логи сервера** на ошибки
4. **Запустите диагностику** `npm run check-modules`
5. **Проверьте версии** всех зависимостей 