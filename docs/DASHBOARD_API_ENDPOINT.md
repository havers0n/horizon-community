# API Эндпоинт: GET /api/v1/dashboard-data

## Описание
Единый эндпоинт для получения всех данных дашборда пользователя. Возвращает структурированные данные в зависимости от роли пользователя.

## URL
```
GET /api/v1/dashboard-data
```

## Аутентификация
Требуется валидный JWT токен в заголовке Authorization:
```
Authorization: Bearer <jwt_token>
```

## Параметры
Нет

## Ответы

### Успешный ответ (200 OK)

#### Для кандидатов (candidate, cadet_test, cadet_practice)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "role": "candidate",
      "avatarUrl": null,
      "firstName": "Иван",
      "lastName": "Иванов",
      "department": null,
      "division": null,
      "isActive": true,
      "gameWarnings": 0,
      "adminWarnings": 0,
      "attemptsLeft": 3,
      "profileImageUrl": null
    },
    "activities": [
      {
        "id": "app_1",
        "type": "application",
        "status": "awaiting_interview",
        "title": "Заявка на вступление в LSPD",
        "createdAt": "2025-08-06T15:54:45.396Z"
      }
    ],
    "announcements": [
      {
        "id": "1",
        "title": "Обновление правил сообщества",
        "preview": "Внесены изменения в правила поведения участников...",
        "priority": "high",
        "createdAt": "2025-08-05T15:54:45.396Z"
      }
    ],
    "usefulLinks": [
      {
        "id": "1",
        "title": "Discord сервер",
        "url": "https://discord.gg/horizoncommunity",
        "icon": "discord",
        "description": "Присоединяйтесь к нашему Discord серверу"
      }
    ],
    "applicationStatus": {
      "attemptsLeft": 3,
      "applicationsCount": 1,
      "testsPassed": 0
    },
    "nextSteps": [
      {
        "id": "1",
        "title": "Подать заявку на вступление",
        "description": "Заполните форму заявки для вступления в сообщество",
        "completed": true,
        "link": "/entry-application"
      }
    ]
  }
}
```

#### Для участников сообщества
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "role": "member",
      "avatarUrl": null,
      "firstName": "Иван",
      "lastName": "Иванов",
      "department": "LSPD",
      "division": "Patrol",
      "isActive": true,
      "gameWarnings": 0,
      "adminWarnings": 0,
      "attemptsLeft": 3,
      "profileImageUrl": "https://example.com/mugshot.jpg"
    },
    "activities": [
      {
        "id": "report_1",
        "type": "report",
        "status": "pending",
        "title": "Рапорт о нарушении ПДД",
        "createdAt": "2025-08-06T15:54:45.396Z"
      }
    ],
    "announcements": [
      {
        "id": "1",
        "title": "Обновление правил сообщества",
        "preview": "Внесены изменения в правила поведения участников...",
        "priority": "high",
        "createdAt": "2025-08-05T15:54:45.396Z"
      }
    ],
    "usefulLinks": [
      {
        "id": "1",
        "title": "Discord сервер",
        "url": "https://discord.gg/horizoncommunity",
        "icon": "discord",
        "description": "Присоединяйтесь к нашему Discord серверу"
      }
    ],
    "statistics": {
      "playtime": 120,
      "reputation": 85,
      "reports": 5,
      "achievements": 3
    },
    "departments": [
      {
        "id": "1",
        "name": "LSPD",
        "full_name": "Los Santos Police Department",
        "description": "Департамент полиции Лос-Сантоса",
        "logo_url": null,
        "created_at": "2025-08-06T15:54:45.396Z",
        "updated_at": "2025-08-06T15:54:45.396Z",
        "gallery": []
      }
    ],
    "complaints": [
      {
        "id": "1",
        "title": "Жалоба на нарушение",
        "status": "open",
        "created_at": "2025-08-06T15:54:45.396Z"
      }
    ],
    "reports": [
      {
        "id": "1",
        "title": "Рапорт о нарушении ПДД",
        "status": "pending",
        "created_at": "2025-08-06T15:54:45.396Z"
      }
    ]
  }
}
```

### Ошибки

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Profile not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Ключевые особенности

### 1. Ролевая логика
- **Кандидаты**: Получают `applicationStatus` и `nextSteps`, НЕ получают `statistics`
- **Участники**: Получают `statistics`, `departments`, `complaints`, `reports`

### 2. Базовые данные
Все пользователи получают:
- `user` - профиль пользователя
- `activities` - активность (заявки, рапорты, жалобы)
- `announcements` - объявления
- `usefulLinks` - полезные ссылки

### 3. Обработка ошибок
- Если не удается получить character данные - используется null
- Если не удается получить дополнительные данные участника - возвращаются пустые массивы
- Все ошибки логируются, но не прерывают выполнение

## Примеры использования

### JavaScript (fetch)
```javascript
const response = await fetch('/api/v1/dashboard-data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data.user.role); // 'candidate' или 'member'
console.log(data.data.statistics); // undefined для кандидатов
```

### cURL
```bash
curl -X GET http://localhost:5000/api/v1/dashboard-data \
  -H "Authorization: Bearer your_jwt_token"
```

## Зависимости
- `CabinetService` - основной сервис для получения данных
- `AuthService` - для аутентификации
- `CharacterService` - для данных персонажа
- `ApplicationService` - для заявок
- `ReportService` - для рапортов

## Безопасность
- Все запросы требуют валидный JWT токен
- Пользователь может получить только свои данные
- Роль определяется из профиля пользователя
- Все SQL запросы защищены от инъекций через Supabase 