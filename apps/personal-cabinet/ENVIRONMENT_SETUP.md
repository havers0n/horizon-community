# Настройка переменных окружения для Personal Cabinet

## Обзор

Приложение Personal Cabinet использует переменные окружения для конфигурации подключений к Supabase и API. При запуске приложения в консоли браузера отображаются логи, показывающие статус подключения всех сервисов.

## Переменные окружения

### Обязательные переменные

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:5000/api/v1
```

### Опциональные переменные

```env
# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

## Настройка

1. **Скопируйте файл с примерами:**
   ```bash
   cp env.example .env
   ```

2. **Заполните переменные в файле `.env`:**
   - Получите `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` из вашего проекта Supabase
   - Установите `VITE_API_URL` на адрес вашего API сервера

3. **Запустите приложение:**
   ```bash
   npm run dev
   ```

## Логирование

При запуске приложения в консоли браузера вы увидите:

### ✅ Успешная настройка:
```
🚀 [Personal Cabinet] Запуск приложения...
🔧 [Personal Cabinet] NODE_ENV: development
🔍 [Personal Cabinet] Проверка переменных окружения...
🔧 [Personal Cabinet] VITE_SUPABASE_URL: ✅ Установлен
🔧 [Personal Cabinet] VITE_SUPABASE_ANON_KEY: ✅ Установлен
🔧 [Personal Cabinet] VITE_API_URL: ✅ Установлен
🔧 [Personal Cabinet] VITE_ENABLE_ANALYTICS: false
🔧 [Personal Cabinet] VITE_ENABLE_DEBUG_MODE: false
✅ [Personal Cabinet] Все критичные переменные окружения установлены
✅ [Personal Cabinet] Supabase клиент успешно инициализирован
✅ [Personal Cabinet] Приложение инициализировано
✅ [Personal Cabinet] Все провайдеры подключены
```

### ❌ Проблемы с настройкой:
```
🔴 [Personal Cabinet] ОШИБКА: Отсутствуют переменные окружения Supabase!
🔴 [Personal Cabinet] Убедитесь, что в файле .env установлены:
🔴 [Personal Cabinet] - VITE_SUPABASE_URL
🔴 [Personal Cabinet] - VITE_SUPABASE_ANON_KEY
```

## Проверка подключений

Приложение автоматически проверяет подключения к:
- **Supabase** - база данных и аутентификация
- **API** - основной сервер приложения

### Визуальные индикаторы

В правом верхнем углу приложения отображается индикатор статуса подключений:
- 🔵 **Синий** - проверка подключений
- 🟢 **Зеленый** - все подключения работают (скрыт)
- 🔴 **Красный** - проблемы с подключениями

## Устранение неполадок

### Проблема: "Missing Supabase environment variables"
**Решение:** Проверьте, что в файле `.env` установлены `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`

### Проблема: "Ошибка подключения к Supabase"
**Решение:** 
1. Проверьте правильность URL и ключа Supabase
2. Убедитесь, что проект Supabase активен
3. Проверьте настройки CORS в Supabase

### Проблема: "Ошибка подключения к API"
**Решение:**
1. Убедитесь, что API сервер запущен
2. Проверьте правильность `VITE_API_URL`
3. Проверьте настройки CORS на сервере

## Получение ключей Supabase

1. Войдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY` 