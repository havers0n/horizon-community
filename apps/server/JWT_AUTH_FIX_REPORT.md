# Отчет о проблеме JWT аутентификации

## 🔍 Диагностика проблемы

### Проблема
Все запросы к API возвращают ошибку авторизации (401 Unauthorized, "Invalid token") при использовании Supabase Auth с кастомной валидацией JWT.

### Результаты диагностики

#### ✅ Что работает:
- Подключение к Supabase успешно
- JWT_SECRET установлен (88 символов)
- Локальная валидация JWT работает корректно
- Supabase Auth API функционирует
- Доступ к базе данных работает

#### ❌ Что не работает:
- Локальная валидация Supabase токенов с JWT_SECRET
- Несоответствие между JWT_SECRET и секретом Supabase

## 🔧 Причины проблемы

### 1. Несоответствие JWT_SECRET
**Основная причина:** JWT_SECRET в .env не совпадает с JWT Secret в настройках Supabase.

**Доказательства:**
- Тестовые токены, созданные с JWT_SECRET, валидируются локально ✅
- Supabase токены НЕ валидируются локально с JWT_SECRET ❌
- Supabase отклоняет тестовые токены с ошибкой "sub claim must be a UUID"

### 2. Неправильное использование переменных окружения
**Проблема:** Разные части кода используют разные переменные окружения:
- `AuthService` использует `process.env.SUPABASE_URL`
- `utils/auth.ts` использует `process.env.VITE_SUPABASE_URL`

### 3. Смешанная стратегия аутентификации
**Проблема:** Код пытается использовать и локальную JWT валидацию, и Supabase Auth одновременно.

## 🛠️ Решения

### Решение 1: Использовать только Supabase Auth (РЕКОМЕНДУЕТСЯ)

**Преимущества:**
- Простота реализации
- Надежность (Supabase управляет токенами)
- Автоматическое обновление токенов
- Встроенная безопасность

**Реализация:**
1. Убрать локальную JWT валидацию
2. Использовать только `supabase.auth.getUser(token)`
3. Полагаться на Supabase для проверки токенов

### Решение 2: Синхронизировать JWT_SECRET

**Шаги:**
1. Перейти в Supabase Dashboard
2. Settings > API > JWT Settings
3. Скопировать JWT Secret
4. Обновить JWT_SECRET в .env

### Решение 3: Исправить переменные окружения

**Проблема:** Несоответствие URL в разных частях кода.

**Исправление:**
```typescript
// В AuthService.ts
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
```

## 📋 План исправления

### Этап 1: Немедленные исправления
1. ✅ Исправить AuthService для использования правильного URL
2. ✅ Создать исправленную версию middleware
3. Заменить старый middleware на новый

### Этап 2: Тестирование
1. Протестировать аутентификацию с исправленным middleware
2. Проверить все типы токенов (JWT, CAD, API)
3. Убедиться в отсутствии ошибок 401

### Этап 3: Оптимизация
1. Убрать неиспользуемый код JWT валидации
2. Очистить переменные окружения
3. Обновить документацию

## 🔒 Рекомендации по безопасности

### 1. Использовать только Supabase Auth
```typescript
// ✅ Правильно
const { data: { user }, error } = await supabase.auth.getUser(token);

// ❌ Неправильно
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 2. Правильные переменные окружения
```env
# ✅ Для сервера
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ✅ Для клиента
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Middleware аутентификации
```typescript
// ✅ Исправленная версия
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const user = await authService.authenticate(token); // Только Supabase Auth
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 🧪 Тестирование

### Тест 1: Проверка аутентификации
```bash
# Создать тестового пользователя
# Получить токен
# Отправить запрос к API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/me
```

### Тест 2: Проверка middleware
```bash
# Тест с невалидным токеном
curl -H "Authorization: Bearer invalid" http://localhost:3000/api/auth/me
# Ожидается: 401 Unauthorized

# Тест без токена
curl http://localhost:3000/api/auth/me
# Ожидается: 401 Unauthorized
```

## 📝 Заключение

**Основная проблема:** Несоответствие JWT_SECRET с секретом Supabase.

**Рекомендуемое решение:** Использовать только Supabase Auth без локальной JWT валидации.

**Преимущества решения:**
- Упрощение кода
- Повышение надежности
- Лучшая безопасность
- Меньше точек отказа

**Следующие шаги:**
1. Применить исправления в коде
2. Протестировать аутентификацию
3. Обновить документацию
4. Мониторить работу системы 