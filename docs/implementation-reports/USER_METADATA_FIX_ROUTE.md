# Роут для исправления метаданных пользователя

## Обзор

Создан новый административный роут для исправления JWT claims пользователей в Supabase Auth. Этот роут решает проблему с аутентификацией, когда у пользователей отсутствуют или повреждены метаданные.

## Файлы

### 1. Основной роут
- **Файл**: `apps/server/routes/admin/user-metadata.ts`
- **Описание**: Содержит три эндпоинта для работы с метаданными пользователей

### 2. Подключение роута
- **Файл**: `apps/server/routes/admin/index.ts`
- **Изменения**: Добавлен импорт и подключение нового роута

### 3. Тестовый скрипт
- **Файл**: `scripts/fix-user-metadata.js`
- **Описание**: Скрипт для тестирования роута

## Эндпоинты

### 1. POST `/api/admin/user-metadata/fix`
Исправляет метаданные пользователя по ID.

**Параметры:**
```json
{
  "userId": "uuid-пользователя"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Metadata fixed successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "username": "user",
      "first_name": "",
      "last_name": ""
    },
    "app_metadata": {
      "roles": ["user"],
      "department": "civil"
    }
  }
}
```

### 2. GET `/api/admin/user-metadata/check/:userId`
Проверяет состояние метаданных пользователя.

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {...},
    "app_metadata": {...}
  },
  "needsFix": {
    "user_metadata": false,
    "app_metadata": true
  },
  "canFix": true
}
```

### 3. POST `/api/admin/user-metadata/fix-by-email`
Исправляет метаданные пользователя по email.

**Параметры:**
```json
{
  "email": "user@example.com"
}
```

## Логика исправления

### user_metadata
Если `user_metadata` равен `null` или не является объектом:
```json
{
  "username": "email-username",
  "first_name": "",
  "last_name": ""
}
```

### app_metadata
Если `app_metadata` равен `null` или не является объектом:
```json
{
  "roles": ["user"],
  "department": "civil"
}
```

## Использование

### 1. Запуск сервера
```bash
cd apps/server
npm run dev
```

### 2. Исправление метаданных через скрипт
```bash
cd scripts
node fix-user-metadata.js danypetrov2000@gmail.com
```

### 3. Исправление через API
```bash
curl -X POST http://localhost:3001/api/admin/user-metadata/fix-by-email \
  -H "Content-Type: application/json" \
  -d '{"email": "danypetrov2000@gmail.com"}'
```

### 4. Проверка состояния
```bash
curl http://localhost:3001/api/admin/user-metadata/check/USER_ID
```

## Безопасность

- Роут доступен только администраторам
- Все операции логируются
- Валидация входных данных
- Обработка ошибок

## Логирование

Все операции логируются с префиксом `[Admin]`:
```
[Admin] Attempting to fix metadata for user: danypetrov2000@gmail.com
[Admin] User found: { id: '...', email: '...', ... }
[Admin] Will fix user_metadata
[Admin] Updating user metadata: { user_metadata: {...} }
[Admin] User metadata updated successfully
```

## Обработка ошибок

- **400**: Отсутствуют обязательные параметры
- **404**: Пользователь не найден
- **500**: Ошибка сервера или Supabase

## Тестирование

1. Создайте пользователя с поврежденными метаданными
2. Запустите скрипт исправления
3. Проверьте, что пользователь может залогиниться
4. Убедитесь, что JWT содержит правильные claims

## Решение проблемы

Этот роут решает проблему с аутентификацией, когда:
- JWT не содержит необходимые claims
- `user_metadata` или `app_metadata` равны `null`
- Пользователи не могут залогиниться из-за отсутствующих метаданных

После исправления метаданных пользователи смогут нормально аутентифицироваться в системе. 