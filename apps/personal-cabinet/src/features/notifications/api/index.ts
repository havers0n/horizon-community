// API functions for notifications
import { apiClient } from '@/shared/api/api-client'

export interface ApiNotification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  isRead: boolean
  createdAt: string
  link?: string
  userId: string
}

export const getNotifications = async (): Promise<ApiNotification[]> => {
  return apiClient.get<ApiNotification[]>('/notifications')
}

export const markAsRead = async (id: string): Promise<void> => {
  return apiClient.patch(`/notifications/${id}/read`)
} 