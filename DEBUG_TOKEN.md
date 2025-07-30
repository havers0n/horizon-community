# ОТЛАДКА ТОКЕНОВ АУТЕНТИФИКАЦИИ

## 🔍 ПРОБЛЕМА

Ошибка `Invalid token` возникает из-за несоответствия ключей токенов в localStorage.

## 🔧 ИСПРАВЛЕНИЯ

### 1. Синхронизированы ключи токенов:
- **auth.ts**: `localStorage.setItem('auth_token', token)`
- **api.ts**: `localStorage.getItem('auth_token')` ✅ ИСПРАВЛЕНО
- **ApiService**: `localStorage.setItem('auth_token', token)` ✅ ИСПРАВЛЕНО

### 2. Проверка токенов в браузере:

Откройте консоль браузера и выполните:

```javascript
// Проверить все токены в localStorage
console.log('auth_token:', localStorage.getItem('auth_token'));
console.log('authToken:', localStorage.getItem('authToken'));

// Очистить старые токены
localStorage.removeItem('authToken');

// Проверить, что токен сохранен правильно
console.log('Текущий токен:', localStorage.getItem('auth_token'));
```

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Обновите страницу** после исправлений
2. **Попробуйте войти** снова
3. **Проверьте консоль** на ошибки
4. **Проверьте Network** в DevTools - токен должен отправляться в заголовке Authorization

## 📋 ПРОВЕРКА

После входа в систему:
- Токен должен сохраниться в `localStorage['auth_token']`
- API запросы должны включать заголовок `Authorization: Bearer <token>`
- Сервер должен успешно аутентифицировать токен

## 🔄 ЕСЛИ ПРОБЛЕМА ОСТАЕТСЯ

1. Проверьте, что пользователь существует в Supabase
2. Убедитесь, что токен не истек
3. Проверьте настройки Supabase в сервере
4. Посмотрите логи сервера для деталей ошибки 