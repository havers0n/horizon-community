// API functions for notifications
import { cabinetApi } from '@/shared/api/cabinet-service'

export interface ApiNotification {
  id: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
  type: string
  metadata?: Record<string, any>
}

export const getNotifications = async (): Promise<ApiNotification[]> => {
  const { data, error } = await cabinetApi.supabase.rpc('get_my_notifications')
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export const markAsRead = async (id: string): Promise<void> => {
  const { error } = await cabinetApi.supabase
    .from('mdt.notifications')
    .update({ is_read: true })
    .eq('id', id)
  
  if (error) {
    throw new Error(error.message)
  }
}

export const markAllAsRead = async (): Promise<void> => {
  const { error } = await cabinetApi.supabase
    .from('mdt.notifications')
    .update({ is_read: true })
    .eq('recipient_user_id', (await cabinetApi.supabase.auth.getUser()).data.user?.id)
    .eq('is_read', false)
  
  if (error) {
    throw new Error(error.message)
  }
} 