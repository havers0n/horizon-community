// Model types and interfaces for notifications
export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  isRead: boolean
  createdAt: string
  link?: string
  userId: string
} 