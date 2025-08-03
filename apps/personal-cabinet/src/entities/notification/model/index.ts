export interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  isRead: boolean
  createdAt: string
  link?: string
  userId: number
}

export interface NotificationType {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  onDismiss: (id: number) => void
}

export interface NotificationProps {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  onDismiss: (id: number) => void
} 