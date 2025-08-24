import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { 
  MessageSquare, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/shared/lib/utils'
import {
  useAllSupportTickets,
  useSupportTicketDetails,
  useAddSupportMessage,
  useChangeSupportTicketStatus,
  filterTicketsByStatus,
  getTicketStatusBadgeVariant,
  getStatusDisplayName,
  SUPPORT_TICKET_STATUSES,
  type SupportTicket
} from '@/features/admin/manage-support'

const AdminSupport: React.FC = () => {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [replyMessage, setReplyMessage] = useState('')

  // Queries
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useAllSupportTickets()
  const { 
    data: ticketDetails, 
    isLoading: detailsLoading, 
    error: detailsError 
  } = useSupportTicketDetails(activeTicketId)

  // Отладочная информация
  useEffect(() => {
    if (ticketDetails) {
      console.log('[AdminSupport] Данные тикета обновлены:', {
        ticketId: ticketDetails.id,
        title: ticketDetails.title,
        messagesCount: ticketDetails.messages?.length || 0,
        messages: ticketDetails.messages?.map(msg => ({
          id: msg.id,
          content: msg.content.substring(0, 30) + '...',
          author: msg.author_username
        }))
      });
    }
  }, [ticketDetails]);

  // Mutations
  const addMessageMutation = useAddSupportMessage()
  const changeStatusMutation = useChangeSupportTicketStatus()

  // Filter tickets by status
  const filteredTickets = filterTicketsByStatus(tickets, statusFilter)

  // Handle ticket selection
  const handleTicketClick = (ticket: SupportTicket) => {
    setActiveTicketId(ticket.id)
  }

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!activeTicketId || !replyMessage.trim()) return

    const messageContent = replyMessage.trim()
    const currentTime = new Date().toISOString()
    
    // Оптимистичное обновление - добавляем сообщение сразу в UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      author_type: 'admin' as const,
      author_username: 'Вы', // Временно, пока не получим данные пользователя
      created_at: currentTime
    }

    // Очищаем поле ввода сразу
    setReplyMessage('')

    try {
      console.log('[AdminSupport] Отправляем сообщение:', { ticketId: activeTicketId, content: messageContent })
      
      await addMessageMutation.mutateAsync({
        ticketId: activeTicketId,
        dto: { content: messageContent }
      })
      
      console.log('[AdminSupport] Сообщение успешно отправлено')
      
      // Прокручиваем к последнему сообщению
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-scroll-area')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
      
    } catch (error) {
      console.error('[AdminSupport] Ошибка отправки сообщения:', error)
      // Возвращаем сообщение в поле ввода при ошибке
      setReplyMessage(messageContent)
    }
  }

  // Handle status change
  const handleStatusChange = async (statusCode: string) => {
    if (!activeTicketId) return

    try {
      await changeStatusMutation.mutateAsync({
        ticketId: activeTicketId,
        dto: { status_code: statusCode }
      })
    } catch (error) {
      console.error('Error changing status:', error)
    }
  }

  // Get status counts for tabs
  const getStatusCount = (status: string) => {
    if (status === 'all') return tickets.length
    return tickets.filter(ticket => ticket.status_code === status).length
  }

  // Автоматическая прокрутка к новым сообщениям
  useEffect(() => {
    if (ticketDetails?.messages && ticketDetails.messages.length > 0) {
      const messagesContainer = document.querySelector('.messages-scroll-area')
      if (messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }, 100)
      }
    }
  }, [ticketDetails?.messages?.length])

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Служба поддержки</h1>
        <p className="text-muted-foreground">Управление тикетами пользователей</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Tickets List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Тикеты</CardTitle>
              
              {/* Status Filter Tabs */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="text-xs">
                    Все ({getStatusCount('all')})
                  </TabsTrigger>
                  <TabsTrigger value={SUPPORT_TICKET_STATUSES.NEW} className="text-xs">
                    Новые ({getStatusCount(SUPPORT_TICKET_STATUSES.NEW)})
                  </TabsTrigger>
                  <TabsTrigger value={SUPPORT_TICKET_STATUSES.IN_PROGRESS} className="text-xs">
                    В работе ({getStatusCount(SUPPORT_TICKET_STATUSES.IN_PROGRESS)})
                  </TabsTrigger>
                  <TabsTrigger value={SUPPORT_TICKET_STATUSES.CLOSED} className="text-xs">
                    Закрытые ({getStatusCount(SUPPORT_TICKET_STATUSES.CLOSED)})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {ticketsLoading ? (
                  // Loading skeleton
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Separator className="my-3" />
                      </div>
                    ))}
                  </div>
                ) : ticketsError ? (
                  <div className="p-4 text-center text-red-500">
                    Ошибка загрузки тикетов
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Нет тикетов для отображения
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket)}
                        className={cn(
                          "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                          activeTicketId === ticket.id && "bg-muted"
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm line-clamp-2 flex-1">
  {ticket.title}
</h3>
                            <Badge 
  variant={getTicketStatusBadgeVariant(ticket.status_code)}
  className="text-xs"
>
  {ticket.status_name}
</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
  <User className="h-3 w-3" />
  {ticket.author_username}
</div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(ticket.updated_at), 'dd.MM HH:mm', { locale: ru })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Ticket Details */}
        <div className="lg:col-span-2">
          {detailsLoading && activeTicketId && (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
              </div>
            </Card>
          )}
          {!detailsLoading && !ticketDetails && activeTicketId && (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-red-500">Не удалось загрузить детали.</p>
              </div>
            </Card>
          )}
          {!activeTicketId && (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Выберите тикет для просмотра</p>
              </div>
            </Card>
          )}
          {!detailsLoading && activeTicketId && (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h2 className="text-lg font-semibold">
                      {ticketDetails?.title || 'Нет данных'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>От: {ticketDetails?.author_username || '—'}</span>
                      <span>
                        {ticketDetails?.created_at ? 
                          (() => {
                            try {
                              const date = new Date(ticketDetails.created_at);
                              if (isNaN(date.getTime())) {
                                console.warn('[AdminSupport] Некорректная дата создания:', ticketDetails.created_at);
                                return 'Некорректная дата';
                              }
                              return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
                            } catch (error) {
                              console.error('[AdminSupport] Ошибка форматирования даты:', error);
                              return 'Некорректная дата';
                            }
                          })()
                          : 'Дата не указана'
                        }
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {ticketDetails && ticketDetails.status_code !== SUPPORT_TICKET_STATUSES.CLOSED && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(SUPPORT_TICKET_STATUSES.CLOSED)}
                        disabled={changeStatusMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Закрыть
                      </Button>
                    )}
                    {ticketDetails && ticketDetails.status_code === SUPPORT_TICKET_STATUSES.NEW && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusChange(SUPPORT_TICKET_STATUSES.IN_PROGRESS)}
                        disabled={changeStatusMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Взять в работу
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="h-full p-4 messages-scroll-area">
                {ticketDetails && ticketDetails.messages && ticketDetails.messages.length > 0 ? (
                  <div className="space-y-4">
                    {ticketDetails.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.author_type === 'admin' ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                            message.author_type === 'admin' 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          )}>
                            {message.author_username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className={cn(
                          "flex-1 space-y-1 max-w-[80%]",
                          message.author_type === 'admin' ? "text-right" : "text-left"
                        )}>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{message.author_username}</span>
                            <span>•</span>
                            <span>
                              {message.created_at ? 
                                (() => {
                                  try {
                                    const date = new Date(message.created_at);
                                    if (isNaN(date.getTime())) {
                                      console.warn('[AdminSupport] Некорректная дата сообщения:', message.created_at);
                                      return 'Некорректная дата';
                                    }
                                    return format(date, 'dd.MM HH:mm', { locale: ru });
                                  } catch (error) {
                                    console.error('[AdminSupport] Ошибка форматирования даты сообщения:', error);
                                    return 'Некорректная дата';
                                  }
                                })()
                                : 'Дата не указана'
                              }
                            </span>
                          </div>
                          <div className={cn(
                            "p-3 rounded-lg text-sm",
                            message.author_type === 'admin'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Сообщений нет
                  </div>
                )}
              </ScrollArea>
              {/* Reply Form */}
              {ticketDetails && ticketDetails.status_code !== SUPPORT_TICKET_STATUSES.CLOSED && (
                <div className="p-4 border-t">
                  <div className="space-y-3">
                    <Label htmlFor="reply">Ваш ответ</Label>
                    <Textarea
                      id="reply"
                      placeholder="Введите ваш ответ..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleReplySubmit()
                        }
                      }}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleReplySubmit}
                        disabled={!replyMessage.trim() || addMessageMutation.isPending}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {addMessageMutation.isPending ? 'Отправка...' : 'Отправить ответ'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSupport