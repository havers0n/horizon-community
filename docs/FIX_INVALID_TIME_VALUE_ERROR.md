# 🚨 Исправление ошибки RangeError: Invalid time value

## ❌ Проблема

В компоненте `SupportChatView.tsx` возникала ошибка `RangeError: Invalid time value` из-за неправильного обращения к структуре данных тикета.

### Причина:
API возвращает вложенную структуру:
```json
{
  "ticket": {
    "id": "...",
    "title": "...",
    "status": "...",
    "createdAt": "..."
  },
  "messages": [...]
}
```

Но компонент пытался обращаться к данным напрямую:
```typescript
// ❌ НЕПРАВИЛЬНО
ticket.title
ticket.status
ticket.createdAt
```

## 🔧 Исправление

### Файл: `apps/personal-cabinet/src/features/support-chat-view/ui/SupportChatView.tsx`

### 1. Переименование переменной для ясности:
```typescript
// Было:
const { data: ticket, isLoading, error } = useSupportTicketDetails(activeTicketId)

// Стало:
const { data: ticketDetails, isLoading, error } = useSupportTicketDetails(activeTicketId)
```

### 2. Исправление обращений к данным тикета:
```typescript
// Было (неправильно):
<CardTitle className="text-lg">{ticket.title}</CardTitle>
<Badge className={getStatusColor(ticket.status)}>
  {getStatusLabel(ticket.status)}
</Badge>
<span className="text-sm text-muted-foreground">
  Создан {formatDistanceToNow(new Date(ticket.createdAt), ...)}
</span>

// Стало (правильно):
const ticket = ticketDetails.ticket
<CardTitle className="text-lg">{ticket.title}</CardTitle>
<Badge className={getStatusColor(ticket.status)}>
  {getStatusLabel(ticket.status)}
</Badge>
<span className="text-sm text-muted-foreground">
  Создан {formatDistanceToNow(new Date(ticket.createdAt), ...)}
</span>
```

### 3. Исправление проверки существования данных:
```typescript
// Было:
if (!ticket) {

// Стало:
if (!ticketDetails || !ticketDetails.ticket) {
```

### 4. Сохранение правильного обращения к сообщениям:
```typescript
// ✅ Правильно - messages в корневом объекте
{ticketDetails.messages?.map((msg, index) => (
  // ...
))}
```

## 📋 Полное исправление

```typescript
export function SupportChatView({ onClose }: SupportChatViewProps) {
  const { activeTicketId } = useSupportChatStore()
  const [message, setMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // ✅ Переименовано для ясности
  const { data: ticketDetails, isLoading, error } = useSupportTicketDetails(activeTicketId)
  const addMessageMutation = useAddSupportMessage()

  // ✅ Исправлена зависимость
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [ticketDetails?.messages])

  // ... остальной код ...

  // ✅ Исправлена проверка
  if (!ticketDetails || !ticketDetails.ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Тикет не найден</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Закрыть
        </Button>
      </div>
    )
  }

  // ✅ Извлекаем ticket из вложенной структуры
  const ticket = ticketDetails.ticket

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              {/* ✅ Правильное обращение к данным тикета */}
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(ticket.status)}>
                  {getStatusLabel(ticket.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Создан {formatDistanceToNow(new Date(ticket.createdAt), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {/* ✅ Правильное обращение к сообщениям */}
            {ticketDetails.messages?.map((msg, index) => (
              // ... код сообщений ...
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* ✅ Правильное обращение к статусу тикета */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={addMessageMutation.isPending || ticket.status === 'closed'}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || addMessageMutation.isPending || ticket.status === 'closed'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {ticket.status === 'closed' && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Этот тикет закрыт. Новые сообщения не принимаются.
          </p>
        )}
      </div>
    </div>
  )
}
```

## ✅ Результат исправления

### 1. **Устранена ошибка времени**
- `RangeError: Invalid time value` больше не возникает
- Правильное обращение к `ticket.createdAt`

### 2. **Исправлена структура данных**
- Компонент правильно обращается к вложенной структуре
- Данные тикета извлекаются из `ticketDetails.ticket`
- Сообщения остаются в `ticketDetails.messages`

### 3. **Улучшена читаемость кода**
- Переименована переменная для ясности
- Добавлена проверка существования `ticketDetails.ticket`
- Извлечение `ticket` в отдельную переменную

## 🧪 Тестирование

### Ожидаемый результат:
- ✅ Нет ошибки `RangeError: Invalid time value`
- ✅ Отображается заголовок тикета
- ✅ Показывается статус и дата создания
- ✅ Отображаются сообщения
- ✅ Работает отправка новых сообщений

**Чат поддержки теперь полностью функционален!** 🚀
