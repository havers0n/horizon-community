import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Send, MessageCircle, User, Shield } from 'lucide-react'
import { useSupportTicketDetails, useAddSupportMessage } from '@/entities/support-ticket'
import { useSupportChatStore } from '@/shared/lib/support-chat-store'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface SupportChatViewProps {
  onClose: () => void
}

// Функция для безопасного форматирования даты
const safeFormatDistanceToNow = (dateString: string | null | undefined): string => {
  if (!dateString) return 'недавно'
  
  try {
    const date = new Date(dateString)
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return 'недавно'
    }
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ru 
    })
  } catch (error) {
    console.warn('Ошибка форматирования даты:', dateString, error)
    return 'недавно'
  }
}

export function SupportChatView({ onClose }: SupportChatViewProps) {
  const { activeTicketId } = useSupportChatStore()
  const [message, setMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { data: ticketDetails, isLoading, error } = useSupportTicketDetails(activeTicketId)
  const addMessageMutation = useAddSupportMessage()

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [ticketDetails?.messages])

  // Автофокус на поле ввода при открытии чата
  useEffect(() => {
    if (inputRef.current && !isLoading && ticketDetails?.ticket) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isLoading, ticketDetails?.ticket])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeTicketId) return

    try {
      addMessageMutation.mutate(
        { ticketId: activeTicketId, message: message.trim() },
        {
          onSuccess: () => {
            setMessage('')
            // Возвращаем фокус на поле ввода после отправки
            setTimeout(() => {
              inputRef.current?.focus()
            }, 100)
          },
        }
      )
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error)
    }
  }

  // Отладочная информация
  const isInputDisabled = addMessageMutation.isPending || (ticketDetails?.ticket?.status === 'closed')
  const isButtonDisabled = !message.trim() || addMessageMutation.isPending || (ticketDetails?.ticket?.status === 'closed')

  // Временное решение для тестирования - разрешаем ввод даже если тикет закрыт
  const allowInputForTesting = true
  const finalInputDisabled = allowInputForTesting ? addMessageMutation.isPending : isInputDisabled
  const finalButtonDisabled = allowInputForTesting ? (!message.trim() || addMessageMutation.isPending) : isButtonDisabled

  console.log('SupportChatView Debug:', {
    activeTicketId,
    isLoading,
    error: !!error,
    ticketStatus: ticketDetails?.ticket?.status,
    isInputDisabled,
    isButtonDisabled,
    finalInputDisabled,
    finalButtonDisabled,
    messageLength: message.length,
    mutationPending: addMessageMutation.isPending
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Ошибка при загрузке тикета</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Закрыть
        </Button>
      </div>
    )
  }

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

  const ticket = ticketDetails.ticket
  const messages = ticketDetails.messages || []

  return (
    <div className="flex flex-col h-full">
      {/* Область сообщений */}
      <div className="flex-1 p-0">
        <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Сообщений пока нет</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex gap-2 ${
                    msg.isFromUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!msg.isFromUser && (
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Shield className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-lg p-2 text-sm ${
                      msg.isFromUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs">{msg.content || 'Пустое сообщение'}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.isFromUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {safeFormatDistanceToNow(msg.createdAt)}
                    </p>
                  </div>

                  {msg.isFromUser && (
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Форма отправки сообщения */}
      <div className="p-3 border-t bg-muted/30">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={finalInputDisabled}
            className="flex-1 text-sm h-8"
            onFocus={() => console.log('Input focused')}
            onBlur={() => console.log('Input blurred')}
            onClick={() => {
              console.log('Input clicked, focusing...')
              inputRef.current?.focus()
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={finalButtonDisabled}
            className="h-8 w-8 p-0"
          >
            <Send className="h-3 w-3" />
          </Button>
        </form>
        
        {ticket.status === 'closed' && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Этот тикет закрыт. Новые сообщения не принимаются.
          </p>
        )}
        
        {/* Отладочная информация */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
            <div>Статус: {ticket.status}</div>
            <div>Мутация: {addMessageMutation.isPending ? 'В процессе' : 'Готова'}</div>
            <div>Поле заблокировано: {finalInputDisabled ? 'Да' : 'Нет'}</div>
            <div>Кнопка заблокирована: {finalButtonDisabled ? 'Да' : 'Нет'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
