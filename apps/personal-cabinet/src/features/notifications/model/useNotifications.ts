import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAsRead, markAllAsRead } from '../api'
import { useSupportChatStore } from '@/shared/lib/support-chat-store'

/**
 * Хук для получения уведомлений пользователя
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 1, // 1 минута
    refetchInterval: 1000 * 60 * 2, // Обновляем каждые 2 минуты
  })
}

/**
 * Хук для отметки уведомления как прочитанного
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Хук для отметки всех уведомлений как прочитанных
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Хук для обработки клика по уведомлению
 */
export const useNotificationClick = () => {
  const { openChat } = useSupportChatStore()

  return (notification: any) => {
    console.log('Notification clicked!', notification);
    
    const link = notification.link; // e.g., "/profile/support/uuid-goes-here"
    
    if (link && link.startsWith('/profile/support/')) {
      const ticketId = link.split('/')[3]; // Извлекаем ID
      console.log('Extracted Ticket ID:', ticketId);
      
      // Получаем функцию из стора
      const { openChat } = useSupportChatStore.getState(); 
      console.log('Calling openChat with ID:', ticketId);
      openChat(ticketId);
    }
    
    // Дополнительная проверка для metadata (если используется)
    if (notification.metadata?.ticketId) {
      console.log('Found ticketId in metadata:', notification.metadata.ticketId);
      openChat(notification.metadata.ticketId);
    }
  }
}
