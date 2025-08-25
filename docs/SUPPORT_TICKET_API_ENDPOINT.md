# 🎯 API эндпоинт для получения деталей тикета поддержки

## 📋 Обзор

Создан новый API эндпоинт `GET /api/v1/support/tickets/:id` для получения пользователем деталей своего тикета поддержки с проверкой авторства.

## 🔧 Реализация

### 1. Маршрут (Route)

**Файл:** `apps/server/src/api/routes/v1/support.ts`

```typescript
/**
 * GET /api/v1/support/tickets/:id
 * Получение деталей конкретного тикета (для автора)
 */
router.get(
  '/tickets/:id',
  authenticateToken,
  (req, res, next) => buildController(req).getSupportTicketDetailsForUser(req, res, next)
);
```

### 2. Контроллер (Controller)

**Файл:** `apps/server/src/core/controllers/CabinetController.ts`

```typescript
/**
 * Получить детали тикета поддержки для автора тикета
 */
public getSupportTicketDetailsForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Получаем ID тикета из параметров и ID пользователя из токена
  const { id } = req.params;
  const userId = req.user.id;
  
  // Вызываем сервис с проверкой авторства
  const ticketDetails = await this.cabinetService.getSupportTicketDetailsForUser(supabase, id, userId);
  
  // Возвращаем результат
  res.status(200).json({
    success: true,
    data: ticketDetails
  });
};
```

### 3. Сервис (Service)

**Файл:** `apps/server/src/core/services/CabinetService.ts`

```typescript
/**
 * Получить детали тикета поддержки для автора тикета
 */
public async getSupportTicketDetailsForUser(
  supabase: SupabaseClient, 
  ticketId: string, 
  userId: string
): Promise<any> {
  // 1. Получаем базовую информацию о тикете
  const { data: ticketData } = await supabase
    .from('support_tickets')
    .select('id, author_user_id, title, status_code, created_at')
    .eq('id', ticketId)
    .single();

  // 2. Проверяем существование тикета
  if (!ticketData) {
    return { ticket: null, messages: [], error: 'Тикет не найден' };
  }

  // 3. Проверяем авторство
  if (ticketData.author_user_id !== userId) {
    throw new AppError('Доступ запрещен', 403);
  }

  // 4. Получаем полные детали через RPC
  return await this.getSupportTicketDetails(supabase, ticketId);
}
```

## 🔒 Безопасность

### Проверки безопасности:

1. **Аутентификация:** Требуется валидный JWT токен
2. **Авторство:** Пользователь может получить доступ только к своим тикетам
3. **Валидация:** Проверка существования тикета и корректности ID

### Обработка ошибок:

- **403 Forbidden:** Пользователь не является автором тикета
- **404 Not Found:** Тикет не существует
- **500 Internal Server Error:** Ошибка базы данных

## 🧪 Тестирование

### 1. Создание тестового тикета

```bash
# Создаем тикет через API
curl -X POST http://localhost:5000/api/v1/support/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "p_title": "Тестовый тикет",
    "p_initial_message": "Это тестовое сообщение"
  }'
```

### 2. Получение деталей тикета

```bash
# Получаем детали тикета (успешный случай)
curl -X GET http://localhost:5000/api/v1/support/tickets/TICKET_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Тестирование доступа

```bash
# Попытка доступа к чужому тикету (должна вернуть 403)
curl -X GET http://localhost:5000/api/v1/support/tickets/ANOTHER_TICKET_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Ожидаемые ответы

### Успешный ответ (200):

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Проблема с авторизацией",
      "status_code": "open",
      "created_at": "2025-01-20T10:00:00Z",
      "author_user_id": "user-uuid-here"
    },
    "messages": [
      {
        "id": "message-uuid-1",
        "content": "Здравствуйте! У меня проблема с авторизацией...",
        "created_at": "2025-01-20T10:00:00Z",
        "author_type": "user"
      },
      {
        "id": "message-uuid-2", 
        "content": "Здравствуйте! Мы рассмотрим вашу проблему...",
        "created_at": "2025-01-20T10:30:00Z",
        "author_type": "admin"
      }
    ]
  }
}
```

### Ошибка доступа (403):

```json
{
  "success": false,
  "error": "Доступ запрещен"
}
```

### Тикет не найден (404):

```json
{
  "success": false,
  "error": "Тикет не найден"
}
```

## 🔗 Интеграция с фронтендом

### Frontend API уже готов:

```typescript
// apps/personal-cabinet/src/shared/api/cabinet-service.ts
getSupportTicketById: async (ticketId: string): Promise<any> => {
  const response = await apiClient.get<CabinetApiResponse<any>>(`/support/tickets/${ticketId}`);
  return response.data || response;
}
```

### React Query хук:

```typescript
// apps/personal-cabinet/src/entities/support-ticket/hooks.ts
export const useSupportTicketDetails = (ticketId: string | null) => {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => cabinetApi.getSupportTicketById(ticketId!),
    enabled: !!ticketId,
  });
};
```

## 🎯 Результат

✅ **Создан защищенный API эндпоинт** для получения деталей тикета поддержки  
✅ **Реализована проверка авторства** - пользователь может получить доступ только к своим тикетам  
✅ **Интегрирован с фронтендом** - готов к использованию в чате поддержки  
✅ **Добавлено логирование** для отладки и мониторинга  
✅ **Обработаны все ошибки** с соответствующими HTTP статусами  

**API готов к использованию!** 🚀
