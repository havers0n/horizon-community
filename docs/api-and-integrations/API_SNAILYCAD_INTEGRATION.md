# API Интеграция с SnailyCAD

## Обзор

Данный документ описывает новые API эндпоинты, добавленные для полной совместимости с SnailyCAD v4. Все эндпоинты поддерживают новые поля из SnailyCAD и используют обновленные схемы валидации.

## Аутентификация

Все эндпоинты требуют аутентификации через JWT токен в заголовке:
```
Authorization: Bearer <jwt_token>
```

Для игровой интеграции используется CAD токен:
```
X-CAD-Token: <cad_token>
```

## Эндпоинты персонажей (Characters)

### Создание персонажа
**POST** `/api/cad/characters`

Создает нового персонажа с поддержкой всех полей SnailyCAD.

**Тело запроса:**
```json
{
  "type": "civilian|leo|fire|ems",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-01",
  "address": "123 Main St",
  "licenses": {},
  "medicalInfo": {},
  "mugshotUrl": "https://example.com/mugshot.jpg",
  "isUnit": false,
  "unitInfo": {},
  
  // === НОВЫЕ ПОЛЯ ДЛЯ SNailyCAD ===
  "gender": "male",
  "ethnicity": "caucasian",
  "height": "180cm",
  "weight": "75kg",
  "hairColor": "brown",
  "eyeColor": "blue",
  "phoneNumber": "+1234567890",
  "postal": "12345",
  "occupation": "Police Officer",
  "dead": false,
  "dateOfDead": null,
  "missing": false,
  "arrested": false,
  "callsign": "1-ADAM-12",
  "callsign2": "1-ADAM-12-2",
  "suspended": false,
  "whitelistStatus": "PENDING",
  "radioChannelId": "channel_1"
}
```

**Ответ:**
```json
{
  "id": 1,
  "ownerId": 1,
  "type": "leo",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-01T00:00:00.000Z",
  "address": "123 Main St",
  "insuranceNumber": "INS-123456789",
  "licenses": {},
  "medicalInfo": {},
  "mugshotUrl": "https://example.com/mugshot.jpg",
  "isUnit": false,
  "unitInfo": null,
  "gender": "male",
  "ethnicity": "caucasian",
  "height": "180cm",
  "weight": "75kg",
  "hairColor": "brown",
  "eyeColor": "blue",
  "phoneNumber": "+1234567890",
  "postal": "12345",
  "occupation": "Police Officer",
  "dead": false,
  "dateOfDead": null,
  "missing": false,
  "arrested": false,
  "callsign": "1-ADAM-12",
  "callsign2": "1-ADAM-12-2",
  "suspended": false,
  "whitelistStatus": "PENDING",
  "radioChannelId": "channel_1",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Получение списка персонажей
**GET** `/api/cad/characters`

Возвращает всех персонажей текущего пользователя.

**Ответ:**
```json
[
  {
    "id": 1,
    "ownerId": 1,
    "type": "leo",
    "firstName": "John",
    "lastName": "Doe",
    // ... все поля персонажа
  }
]
```

### Получение персонажа по ID
**GET** `/api/cad/characters/:id`

Возвращает конкретного персонажа пользователя.

**Параметры:**
- `id` - ID персонажа

### Обновление персонажа
**PUT** `/api/cad/characters/:id`

Обновляет существующего персонажа. Все поля опциональны.

**Тело запроса:**
```json
{
  "firstName": "Jane",
  "gender": "female",
  "occupation": "Detective",
  "callsign": "1-ADAM-13",
  "suspended": true
}
```

### Удаление персонажа
**DELETE** `/api/cad/characters/:id`

Удаляет персонажа.

### Поиск персонажей
**GET** `/api/cad/characters/search/:query`

Поиск персонажей по имени, фамилии или номеру страховки.

**Параметры:**
- `query` - поисковый запрос (минимум 2 символа)

### Получение персонажей по типу
**GET** `/api/cad/characters/type/:type`

Возвращает персонажей определенного типа.

**Параметры:**
- `type` - тип персонажа (`civilian`, `leo`, `fire`, `ems`)

### Статистика персонажей
**GET** `/api/cad/characters/stats`

Возвращает статистику персонажей пользователя.

**Ответ:**
```json
{
  "total": 3,
  "byType": {
    "civilian": 1,
    "leo": 2
  },
  "active": 2,
  "dead": 0,
  "missing": 0,
  "arrested": 1
}
```

## Эндпоинты пользователей (Users)

### Получение профиля пользователя
**GET** `/api/cad/user/profile`

Возвращает профиль пользователя с персонажами.

**Ответ:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "member",
  "status": "active",
  "departmentId": 1,
  "secondaryDepartmentId": null,
  "rank": "Officer",
  "division": "Patrol",
  "qualifications": ["firearms", "driving"],
  "gameWarnings": 0,
  "adminWarnings": 0,
  "cadToken": "cad_token_123",
  "discordId": "123456789",
  "discordUsername": "JohnDoe#1234",
  "has2FA": false,
  "isDarkTheme": true,
  "soundSettings": {
    "volume": 0.8,
    "notifications": true
  },
  "apiToken": "api_token_123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "characters": [
    // массив персонажей пользователя
  ]
}
```

### Обновление профиля пользователя
**PUT** `/api/cad/user/profile`

Обновляет профиль пользователя.

**Тело запроса:**
```json
{
  "username": "jane_doe",
  "isDarkTheme": false,
  "soundSettings": {
    "volume": 0.5,
    "notifications": false
  }
}
```

### Генерация CAD токена
**POST** `/api/cad/user/cad-token`

Генерирует новый CAD токен для игровой интеграции.

**Ответ:**
```json
{
  "cadToken": "new_cad_token_456"
}
```

### Генерация API токена
**POST** `/api/cad/user/api-token`

Генерирует новый API токен для внешних интеграций.

**Ответ:**
```json
{
  "apiToken": "new_api_token_789"
}
```

### Удаление API токена
**DELETE** `/api/cad/user/api-token`

Удаляет API токен пользователя.

### Статистика пользователя
**GET** `/api/cad/user/stats`

Возвращает статистику пользователя и его персонажей.

**Ответ:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "member",
    "status": "active",
    "has2FA": false,
    "isDarkTheme": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "characters": {
    "total": 3,
    "byType": {
      "civilian": 1,
      "leo": 2
    },
    "active": 2,
    "dead": 0,
    "missing": 0,
    "arrested": 1
  }
}
```

## Игровая интеграция

### Получение данных пользователя по CAD токену
**GET** `/api/cad/me`

Возвращает данные пользователя по CAD токену (для игровой интеграции).

**Заголовки:**
```
X-CAD-Token: <cad_token>
```

## Коды ошибок

### 400 - Ошибка валидации
```json
{
  "error": "Validation failed",
  "details": {
    "message": "Validation failed",
    "errors": {
      "firstName": "First name is required",
      "email": "Invalid email format"
    }
  }
}
```

### 401 - Не авторизован
```json
{
  "error": "Unauthorized"
}
```

### 403 - Доступ запрещен
```json
{
  "error": "Access denied"
}
```

### 404 - Не найдено
```json
{
  "error": "Character not found"
}
```

### 409 - Конфликт
```json
{
  "error": "Resource already exists"
}
```

### 500 - Внутренняя ошибка сервера
```json
{
  "error": "Internal server error"
}
```

## Примеры использования

### Создание LEO персонажа
```bash
curl -X POST http://localhost:3000/api/cad/characters \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "leo",
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-01-01",
    "address": "123 Main St",
    "gender": "male",
    "ethnicity": "caucasian",
    "height": "180cm",
    "weight": "75kg",
    "hairColor": "brown",
    "eyeColor": "blue",
    "phoneNumber": "+1234567890",
    "occupation": "Police Officer",
    "callsign": "1-ADAM-12",
    "whitelistStatus": "PENDING"
  }'
```

### Обновление персонажа
```bash
curl -X PUT http://localhost:3000/api/cad/characters/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "callsign": "1-ADAM-13",
    "suspended": true,
    "whitelistStatus": "ACCEPTED"
  }'
```

### Получение статистики
```bash
curl -X GET http://localhost:3000/api/cad/user/stats \
  -H "Authorization: Bearer <jwt_token>"
```

## Миграция с SnailyCAD

Для миграции данных из SnailyCAD в нашу систему:

1. **Экспорт данных** из SnailyCAD
2. **Преобразование формата** данных в соответствии с нашими схемами
3. **Импорт данных** через API эндпоинты
4. **Проверка целостности** данных

### Маппинг полей SnailyCAD → RolePlayIdentity

| SnailyCAD | RolePlayIdentity | Примечания |
|-----------|------------------|------------|
| `Citizen.name` | `Character.firstName` | |
| `Citizen.surname` | `Character.lastName` | |
| `Citizen.gender` | `Character.gender` | |
| `Citizen.ethnicity` | `Character.ethnicity` | |
| `Citizen.height` | `Character.height` | |
| `Citizen.weight` | `Character.weight` | |
| `Citizen.hairColor` | `Character.hairColor` | |
| `Citizen.eyeColor` | `Character.eyeColor` | |
| `Citizen.phoneNumber` | `Character.phoneNumber` | |
| `Citizen.postal` | `Character.postal` | |
| `Citizen.occupation` | `Character.occupation` | |
| `User.isDarkTheme` | `User.isDarkTheme` | |
| `User.soundSettings` | `User.soundSettings` | |
| `User.apiToken` | `User.apiToken` | |
| `Officer.callsign` | `Character.callsign` | |
| `Officer.suspended` | `Character.suspended` | |
| `Officer.whitelistStatus` | `Character.whitelistStatus` | | 