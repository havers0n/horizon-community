import React from 'react'
import { Button } from '@/shared/ui/button'
import { MessageCircle, X } from 'lucide-react'
import { useSupportChatStore } from '@/shared/lib/support-chat-store'
import { SupportChatView } from '@/features/support-chat-view'
import { useMySupportTickets } from '@/entities/support-ticket'
import { Badge } from '@/shared/ui/badge'

export function SupportChatContainer() {
  const { isChatOpen, closeChat, openChat, activeTicketId } = useSupportChatStore()
  const { data: myTickets } = useMySupportTickets()

  // Подсчитываем количество непрочитанных тикетов
  const unreadCount = myTickets?.filter(ticket => 
    ticket.status === 'open' || ticket.status === 'in_progress'
  ).length || 0

  const handleOpenChat = () => {
    console.log('handleOpenChat called:', { activeTicketId, myTickets: myTickets?.length })
    
    // Если есть активный тикет, открываем его
    if (activeTicketId) {
      console.log('Opening existing ticket:', activeTicketId)
      openChat(activeTicketId)
      return
    }

    // Если есть тикеты пользователя, открываем последний
    if (myTickets && myTickets.length > 0) {
      const lastTicket = myTickets[0] // Предполагаем, что тикеты отсортированы по дате создания
      console.log('Opening last ticket:', lastTicket.id)
      openChat(lastTicket.id)
      return
    }

    // Если нет тикетов, создаем тестовый тикет
    console.log('No tickets found, creating demo ticket')
    openChat('demo-ticket-id')
  }

  return (
    <>
      {/* Кнопка-триггер для открытия чата */}
      {!isChatOpen && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={handleOpenChat}
            className="relative h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110"
            size="icon"
          >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Компактный поп-ап виджет чата */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[350px] h-[500px] bg-background border rounded-lg shadow-lg flex flex-col animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          {/* Заголовок виджета */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg pointer-events-auto">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Чат поддержки</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} {unreadCount === 1 ? 'тикет' : unreadCount < 5 ? 'тикета' : 'тикетов'}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChat}
              className="h-6 w-6 p-0 hover:bg-background transition-colors pointer-events-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Контент чата */}
          <div className="flex-1 overflow-hidden pointer-events-auto">
            <SupportChatView onClose={closeChat} />
          </div>
        </div>
      )}
    </>
  )
}
