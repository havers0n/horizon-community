# 🔧 Отладка клика по уведомлениям

## ❌ Проблема
При клике на уведомление в "Ленте событий" не открывается окно чата.

## ✅ Исправления

### 1. Обновлена логика обработки клика

**Файл:** `apps/personal-cabinet/src/features/notifications/model/useNotifications.ts`

**Было:**
```typescript
export const useNotificationClick = () => {
  const { openChat } = useSupportChatStore()
  return (notification: any) => {
    if (notification.metadata?.ticketId) {
      openChat(notification.metadata.ticketId)
    }
  }
}
```

**Стало:**
```typescript
export const useNotificationClick = () => {
  const { openChat } = useSupportChatStore()
  return (notification: any) => {
    console.log('Notification clicked!', notification);
    
    const link = notification.link; // e.g., "/profile/support/uuid-goes-here"
    
    if (link && link.startsWith('/profile/support/')) {
      const ticketId = link.split('/')[3]; // Извлекаем ID
      console.log('Extracted Ticket ID:', ticketId);
      
      const { openChat } = useSupportChatStore.getState(); 
      console.log('Calling openChat with ID:', ticketId);
      openChat(ticketId);
    }
  }
}
```

### 2. Обновлены тестовые данные

**Файл:** `supabase/migrations/20250120000002_add_real_test_data.sql`

**Было:**
```sql
-- ticketId в metadata
'{"type": "support", "ticketId": "550e8400-e29b-41d4-a716-446655440000"}'
```

**Стало:**
```sql
-- ticketId в link
'/profile/support/550e8400-e29b-41d4-a716-446655440000'
```

## 🧪 Тестирование

### Шаг 1: Примените миграции
```bash
supabase db reset
```

### Шаг 2: Обновите UUID пользователя
В файле `supabase/migrations/20250120000002_add_real_test_data.sql` замените `'test-user-id'` на ваш реальный UUID.

### Шаг 3: Запустите приложение
```bash
cd apps/personal-cabinet
npm run dev
```

### Шаг 4: Откройте консоль браузера
Нажмите F12 → Console

### Шаг 5: Протестируйте клик
1. Откройте дашборд
2. Найдите уведомление о тикете поддержки
3. Кликните на него
4. Проверьте консоль на логи

## 🔍 Ожидаемые логи в консоли

При клике на уведомление должны появиться:

```
Notification clicked! {id: "...", content: "...", link: "/profile/support/550e8400-e29b-41d4-a716-446655440000", ...}
Extracted Ticket ID: 550e8400-e29b-41d4-a716-446655440000
Calling openChat with ID: 550e8400-e29b-41d4-a716-446655440000
```

## 🎯 Ожидаемый результат

После клика:
- ✅ В консоли появляются логи
- ✅ Внизу экрана открывается модальное окно чата
- ✅ В заголовке чата отображается ID тикета

## 🐛 Если логи не появляются

1. **Проверьте, что уведомления загружаются:**
   ```sql
   SELECT * FROM mdt.notifications WHERE recipient_user_id = 'ваш-uuid';
   ```

2. **Проверьте формат link:**
   ```sql
   SELECT link FROM mdt.notifications WHERE link LIKE '/profile/support/%';
   ```

3. **Проверьте консоль на ошибки JavaScript**

## 📋 Чек-лист отладки

- [ ] Миграции применены
- [ ] UUID пользователя обновлен в тестовых данных
- [ ] Приложение перезапущено
- [ ] Уведомления отображаются в ленте событий
- [ ] При клике появляются логи в консоли
- [ ] Открывается модальное окно чата
