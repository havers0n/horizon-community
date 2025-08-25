# Интеграция чата поддержки

## Обзор

Реализован интерфейс чата со службой поддержки, который активируется через "Ленту событий". Система включает в себя:

1. **Глобальный контейнер чата** - модальное окно внизу экрана
2. **Интерактивную ленту уведомлений** - с возможностью клика по уведомлениям о тикетах
3. **Полноценный интерфейс чата** - с отображением переписки и формой отправки сообщений

## Архитектура

### Глобальное состояние (Zustand)

```typescript
// shared/lib/support-chat-store.ts
interface SupportChatState {
  isChatOpen: boolean
  activeTicketId: string | null
}

interface SupportChatActions {
  openChat: (ticketId: string) => void
  closeChat: () => void
  setActiveTicketId: (ticketId: string | null) => void
}
```

### Компоненты

1. **SupportChatContainer** (`widgets/support-chat-container`) - глобальный контейнер
2. **SupportChatView** (`features/support-chat-view`) - содержимое чата
3. **NotificationList** (`features/notifications`) - обновленная лента уведомлений

### API и хуки

1. **useSupportTicketDetails** - получение деталей тикета
2. **useAddSupportMessage** - отправка сообщений
3. **useNotifications** - получение уведомлений
4. **useNotificationClick** - обработка кликов по уведомлениям

## Использование

### Открытие чата через уведомление

1. Пользователь видит уведомление о новом ответе в тикете
2. Кликает на уведомление
3. Автоматически открывается чат с соответствующим тикетом

### Программное открытие чата

```typescript
import { useSupportChatStore } from '@/shared/lib/support-chat-store'

const { openChat } = useSupportChatStore()

// Открыть чат с конкретным тикетом
openChat('ticket-id-123')
```

## База данных

### RPC функция

```sql
-- supabase/migrations/20250120000000_add_get_my_notifications_rpc.sql
CREATE OR REPLACE FUNCTION public.get_my_notifications()
RETURNS TABLE (
  id uuid,
  content text,
  link text,
  is_read boolean,
  created_at timestamptz,
  type text,
  metadata jsonb
)
```

### Структура уведомлений

Уведомления о тикетах поддержки содержат в `metadata`:
```json
{
  "type": "support",
  "ticketId": "uuid-тикета"
}
```

## Интеграция с существующими системами

### Лента событий

- Обновлен компонент `NotificationList` для работы с реальными данными
- Добавлена поддержка кликабельных уведомлений
- Интеграция с глобальным состоянием чата

### Админка

- Переиспользован код из админки для отображения чата
- Адаптирован под пользовательский интерфейс

## Стилизация

### Позиционирование

Чат позиционируется внизу экрана:
```css
position: fixed;
bottom: 0;
left: 50%;
transform: translateX(-50%);
```

### Адаптивность

- Максимальная ширина: `max-w-2xl`
- Максимальная высота: `max-h-[80vh]`
- Автоматическое масштабирование на мобильных устройствах

## Тестирование

### 🚀 Быстрый старт для тестирования

1. **Получите UUID пользователя:**
   ```sql
   -- Выполните в Supabase SQL Editor
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
   ```

2. **Обновите тестовые данные:**
   ```sql
   -- Замените 'test-user-id' на реальный UUID в файле:
   -- supabase/migrations/20250120000002_add_real_test_data.sql
   ```

3. **Примените миграции:**
   ```bash
   supabase db reset
   # или
   supabase migration up
   ```

4. **Запустите приложение:**
   ```bash
   cd apps/personal-cabinet
   npm run dev
   ```

### Тестовые данные

Создана миграция с тестовыми уведомлениями:
```sql
-- supabase/migrations/20250120000002_add_real_test_data.sql
INSERT INTO mdt.notifications (
  recipient_user_id,
  content,
  metadata
) VALUES (
  'real-user-uuid', -- Замените на реальный UUID
  'Новый ответ в тикете поддержки #12345',
  '{"type": "support", "ticketId": "550e8400-e29b-41d4-a716-446655440000"}'
);
```

### Что вы увидите

После настройки тестовых данных в ленте уведомлений появятся:
- ✅ Уведомления о тикетах поддержки (кликабельные)
- ✅ Уведомления об одобрении заявок
- ✅ Уведомления о новых сообщениях в форуме
- ✅ Предупреждения

### Отладка

Если уведомления не загружаются:

1. **Проверьте консоль браузера** на ошибки
2. **Проверьте переменные окружения:**
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Проверьте RPC функцию:**
   ```sql
   SELECT * FROM get_my_notifications();
   ```

## Безопасность

- Все API вызовы защищены аутентификацией
- RPC функции используют `SECURITY DEFINER`
- Проверка прав доступа к тикетам

## Производительность

- Кеширование данных через React Query
- Автообновление уведомлений каждые 2 минуты
- Ленивая загрузка компонентов
- Оптимизированные запросы к базе данных

## Статус реализации

### ✅ Завершено:
- [x] Глобальное состояние (Zustand)
- [x] Контейнер чата
- [x] Интерфейс чата
- [x] RPC функция для уведомлений
- [x] API интеграция
- [x] Тестовые данные

### 🔄 В процессе:
- [ ] Бэкенд API для тикетов поддержки
- [ ] Интеграция с реальными тикетами

### 📋 Планируется:
- [ ] Real-time обновления через WebSocket
- [ ] Уведомления в браузере (Push API)
- [ ] Экспорт истории чатов
