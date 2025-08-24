// React Query hooks for admin support ticket management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAllSupportTickets,
  getSupportTicketDetails,
  addMessageToSupportTicket,
  changeSupportTicketStatus,
  type SupportTicket,
  type SupportTicketDetails,
  type AddMessageDto,
  type ChangeStatusDto
} from '../api'

// Query keys
export const QUERY_KEYS = {
  ALL_TICKETS: ['admin', 'support', 'tickets'] as const,
  TICKET_DETAILS: (id: string) => ['admin', 'support', 'tickets', id] as const,
} as const

// Query hooks
export const useAllSupportTickets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_TICKETS,
    queryFn: getAllSupportTickets,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    select: (data) => data.data, // Извлекаем массив тикетов
  })
}

export const useSupportTicketDetails = (ticketId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.TICKET_DETAILS(ticketId || ''),
    queryFn: () => getSupportTicketDetails(ticketId!),
    enabled: !!ticketId,
    staleTime: 5 * 1000, // 5 seconds for faster updates in chat
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time chat
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  })
}

// Mutation hooks
export const useAddSupportMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ ticketId, dto }: { ticketId: string; dto: AddMessageDto }) =>
      addMessageToSupportTicket(ticketId, dto),
    onSuccess: (updatedTicketData, variables) => {
      console.log('[useAddSupportMessage] Сообщение успешно добавлено, обновляем кэш');
      console.log('[useAddSupportMessage] Обновленные данные:', {
        ticketId: variables.ticketId,
        messagesCount: updatedTicketData.messages?.length || 0
      });
      
      // Обновляем кэш деталей тикета с новыми данными
      queryClient.setQueryData(
        QUERY_KEYS.TICKET_DETAILS(variables.ticketId),
        updatedTicketData
      );
      
      // Инвалидируем общий список тикетов для обновления счетчиков
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ALL_TICKETS 
      });
      
      toast.success('Ответ успешно отправлен');
    },
    onError: (error: any) => {
      console.error('[useAddSupportMessage] Ошибка добавления сообщения:', error);
      toast.error(error?.error || 'Ошибка отправки ответа')
    }
  })
}

export const useChangeSupportTicketStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ ticketId, dto }: { ticketId: string; dto: ChangeStatusDto }) =>
      changeSupportTicketStatus(ticketId, dto),
    onSuccess: (_, { ticketId }) => {
      // Invalidate both the ticket details and the tickets list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TICKET_DETAILS(ticketId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_TICKETS })
      toast.success('Статус тикета изменен')
    },
    onError: (error: any) => {
      toast.error(error?.error || 'Ошибка изменения статуса')
    }
  })
}

// Utility functions for ticket filtering
export const filterTicketsByStatus = (tickets: SupportTicket[], status?: string) => {
  if (!status || status === 'all') return tickets
  return tickets.filter(ticket => ticket.status_code === status)
}

export const getTicketStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'new':
      return 'destructive'
    case 'in_progress':
      return 'default'
    case 'closed':
      return 'secondary'
    case 'pending':
      return 'outline'
    default:
      return 'outline'
  }
}

export const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'new':
      return 'Новые'
    case 'in_progress':
      return 'В работе'
    case 'closed':
      return 'Закрытые'
    case 'pending':
      return 'Ожидание'
    case 'open':
      return 'Открытые'
    case 'resolved':
      return 'Решено'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }
}