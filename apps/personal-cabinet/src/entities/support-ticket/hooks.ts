import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cabinetApi } from '@/shared/api/cabinet-service'
import { toast } from 'sonner'

/**
 * Хук для получения деталей тикета поддержки
 */
export const useSupportTicketDetails = (ticketId: string | null) => {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null
      return await cabinetApi.getSupportTicketById(ticketId)
    },
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}

/**
 * Хук для отправки сообщения в тикет поддержки
 */
export const useAddSupportMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      return await cabinetApi.addSupportMessage(ticketId, { message })
    },
    onSuccess: (_, { ticketId }) => {
      // Инвалидируем кеш тикета для обновления данных
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
      toast.success('Сообщение отправлено')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.message || 'Ошибка при отправке сообщения'
      toast.error(errorMessage)
    },
  })
}

/**
 * Хук для получения списка тикетов пользователя
 */
export const useMySupportTickets = () => {
  return useQuery({
    queryKey: ['my-support-tickets'],
    queryFn: async () => {
      return await cabinetApi.getMySupportTickets()
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}
