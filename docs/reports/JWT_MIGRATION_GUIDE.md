# Руководство по миграции: Локальная JWT → Supabase Auth

## Обзор изменений

Система аутентификации была полностью переведена с локальной JWT валидации на использование исключительно `supabase.auth.getUser()`.

## Что изменилось

### ❌ Удалено
- Локальная JWT валидация через `jsonwebtoken`
- Метод `verifyToken()` в `SecurityManager`
- Зависимости `jsonwebtoken` и `@types/jsonwebtoken`
- Переменная окружения `JWT_SECRET`

### ✅ Добавлено
- Улучшенное логирование аутентификации
- Детальная обработка ошибок Supabase Auth
- Тестовые endpoints для проверки аутентификации

## Для разработчиков

### Обновление клиентского кода

#### Старый способ (больше не работает):
```javascript
// ❌ Старый способ - больше не работает
const token = localStorage.getItem('jwt_token');
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Новый способ:
```javascript
// ✅ Новый способ - используйте Supabase Auth
import { supabase } from './supabase-client';

// Получение сессии
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Использование токена
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Обработка ошибок аутентификации

#### Новые коды ошибок:
```javascript
// Пример ответа сервера при ошибке аутентификации
{
  "error": "Invalid or expired token",
  "code": "INVALID_TOKEN",
  "details": "Supabase auth error: Invalid JWT"
}
```

#### Обработка в клиенте:
```javascript
if (response.status === 401) {
  const errorData = await response.json();
  
  switch (errorData.code) {
    case 'MISSING_TOKEN':
      // Перенаправить на страницу входа
      window.location.href = '/login';
      break;
    case 'INVALID_TOKEN':
      // Обновить токен или перенаправить на вход
      await supabase.auth.refreshSession();
      break;
    default:
      console.error('Auth error:', errorData);
  }
}
```

## Для тестирования

### Тестовые endpoints

1. **Health check** (без аутентификации):
   ```
   GET /api/test/health
   ```

2. **Тест аутентификации** (требует валидный токен):
   ```
   GET /api/test/auth-test
   Authorization: Bearer <your-supabase-token>
   ```

### Пример тестирования с curl:

```bash
# Health check
curl http://localhost:5000/api/test/health

# Тест аутентификации (замените TOKEN на реальный токен)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/test/auth-test
```

## Отладка проблем

### Логи сервера

Сервер теперь выводит подробные логи аутентификации:

```
🔍 Authenticating token...
✅ Token authenticated successfully for user: john_doe
```

При ошибках:
```
❌ Token authentication error: Supabase auth error: Invalid JWT
❌ No token provided in request
```

### Частые проблемы

1. **"Invalid token" ошибки**:
   - Убедитесь, что используете токен от Supabase Auth
   - Проверьте, что токен не истек
   - Убедитесь, что `SUPABASE_SERVICE_ROLE_KEY` настроен

2. **"No user found for token"**:
   - Пользователь может не существовать в локальной БД
   - Проверьте синхронизацию между Supabase и локальной БД

3. **"Supabase auth error"**:
   - Проверьте настройки Supabase проекта
   - Убедитесь, что Auth включен в проекте

## Миграция существующих токенов

### Для существующих пользователей

1. **Пользователи должны перелогиниться** - старые JWT токены больше не работают
2. **Новые токены** будут автоматически создаваться через Supabase Auth
3. **Синхронизация** пользователей происходит автоматически

### Для API интеграций

1. **Обновите токены** - используйте новые Supabase токены
2. **Проверьте формат** - токены должны быть в формате Supabase JWT
3. **Обновите документацию** - укажите новые требования к аутентификации

## Безопасность

### Преимущества новой системы:

- ✅ **Единый источник истины** - только Supabase проверяет токены
- ✅ **Автоматическое управление** жизненным циклом токенов
- ✅ **Встроенная защита** от подделки токенов
- ✅ **Централизованное управление** пользователями

### Рекомендации:

1. **Регулярно обновляйте** Supabase SDK
2. **Мониторьте логи** аутентификации
3. **Используйте HTTPS** в продакшене
4. **Настройте rate limiting** для аутентификации

## Заключение

Миграция завершена успешно. Система теперь полностью полагается на Supabase Auth, что повышает безопасность и упрощает архитектуру. Все существующие функции сохранены, включая поддержку CAD и API токенов для игровой интеграции. 