# 🔧 Быстрое исправление ошибки "require is not defined"

## ❌ Проблема
```
Uncaught ReferenceError: require is not defined
    at cabinet-service.ts:144:30
    at cabinet-service.ts:153:3
```

## ✅ Решение

### Шаг 1: Проверьте переменные окружения

Убедитесь, что в файле `.env` (или `.env.local`) настроены переменные:

```bash
# apps/personal-cabinet/.env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Шаг 2: Перезапустите приложение

```bash
cd apps/personal-cabinet
npm run dev
```

### Шаг 3: Проверьте консоль браузера

Ошибка должна исчезнуть. Если остались другие ошибки, проверьте:

1. **Правильность URL Supabase** - должен начинаться с `https://`
2. **Правильность ключа** - должен быть длинным строковым значением
3. **Подключение к интернету** - для загрузки Supabase клиента

## 🔍 Если ошибка остается

### Проверьте package.json
Убедитесь, что `@supabase/supabase-js` установлен:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.52.0"
  }
}
```

### Переустановите зависимости
```bash
cd apps/personal-cabinet
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Результат

После исправления:
- ✅ Ошибка "require is not defined" исчезнет
- ✅ Supabase клиент будет корректно инициализирован
- ✅ Лента событий начнет загружать реальные уведомления
- ✅ Система чата поддержки будет работать

## 📞 Если нужна помощь

1. Проверьте консоль браузера на другие ошибки
2. Убедитесь, что Supabase проект доступен
3. Проверьте права доступа к RPC функции `get_my_notifications`
