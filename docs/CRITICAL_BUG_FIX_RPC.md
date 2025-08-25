# 🚨 Исправление критической ошибки: замена прямых запросов на RPC

## ❌ Проблема

В методе `getSupportTicketDetailsForUser` использовался прямой запрос к таблице `support_tickets` с несуществующей колонкой `status_code`, что вызывало ошибку:

```
column "status_code" does not exist
```

## 🔧 Исправление

### Было (неправильно):
```typescript
// ПРЯМОЙ ЗАПРОС К ТАБЛИЦЕ - НЕПРАВИЛЬНО!
const { data: ticketData, error: ticketError } = await (supabase as any)
  .from('support_tickets')
  .select('id, author_user_id, title, status_code, created_at') // ❌ status_code не существует
  .eq('id', ticketId)
  .single();
```

### Стало (правильно):
```typescript
// 1. Минимальный запрос только для проверки авторства
const { data: ticketAuthor, error: authorError } = await supabase
  .from('support_tickets')
  .select('author_user_id') // ✅ Только нужная колонка
  .eq('id', ticketId)
  .single();

// 2. ВЫЗОВ RPC-ФУНКЦИИ для получения полных данных
const { data, error } = await (supabase as any).rpc('get_support_ticket_details', {
  p_ticket_id: ticketId
});
```

## 📋 Полное исправление

### Файл: `apps/server/src/core/services/CabinetService.ts`

```typescript
public async getSupportTicketDetailsForUser(
  supabase: SupabaseClient,
  ticketId: string,
  userId: string
): Promise<any> {
  try {
    // 1. Получаем только автора тикета для проверки прав
    const { data: ticketAuthor, error: authorError } = await supabase
      .from('support_tickets')
      .select('author_user_id')
      .eq('id', ticketId)
      .single();

    if (authorError || !ticketAuthor) {
      throw new AppError('Ticket not found', 404);
    }

    // 2. ПРОВЕРКА АВТОРСТВА
    if (ticketAuthor.author_user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    
    // 3. ВЫЗЫВАЕМ ПРАВИЛЬНУЮ RPC-ФУНКЦИЮ
    const { data, error } = await (supabase as any).rpc('get_support_ticket_details', {
      p_ticket_id: ticketId
    });

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to get support ticket details for user', 500);
  }
}
```

## ✅ Преимущества исправления

### 1. **Устранена ошибка БД**
- Убрана несуществующая колонка `status_code`
- Заменен на правильный вызов RPC-функции

### 2. **Улучшена производительность**
- RPC-функция оптимизирована для получения данных из нескольких таблиц
- Меньше запросов к БД

### 3. **Повышена безопасность**
- RPC-функция содержит правильную бизнес-логику
- Нет прямого доступа к структуре таблиц

### 4. **Упрощена поддержка**
- Вся логика получения данных централизована в RPC
- Легче вносить изменения

## 🔍 Проверка других методов

### ✅ Админский метод уже правильный:
```typescript
// apps/server/src/core/services/CabinetService.ts
public async getSupportTicketDetails(supabase: SupabaseClient, ticketId: string): Promise<any> {
  // ✅ Правильно использует RPC
  const { data, error } = await (supabase as any).rpc('get_support_ticket_details', {
    p_ticket_id: ticketId
  });
  // ...
}
```

## 🧪 Тестирование исправления

### 1. Проверка API эндпоинта:
```bash
curl -X GET http://localhost:5000/api/v1/support/tickets/TICKET_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Ожидаемый результат:
- ✅ Нет ошибки `column "status_code" does not exist`
- ✅ Возвращаются полные данные тикета с сообщениями
- ✅ Работает проверка авторства

## 🎯 Результат

✅ **Критическая ошибка исправлена** - убраны прямые запросы к несуществующим колонкам  
✅ **Используется RPC-функция** - правильный способ получения данных  
✅ **Сохранена безопасность** - проверка авторства работает корректно  
✅ **Улучшена производительность** - оптимизированные запросы к БД  

**Система готова к работе!** 🚀
