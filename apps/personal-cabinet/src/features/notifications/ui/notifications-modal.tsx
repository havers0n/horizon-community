import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Bell, Check, Trash2 } from 'lucide-react'

interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  isRead: boolean
  createdAt: string
  link?: string
  userId: number
}

interface NotificationsModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NotificationsModal({ children, isOpen, onOpenChange }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Здесь будет API вызов для получения уведомлений
      const mockNotifications: Notification[] = [
        {
          id: 1,
          message: 'Ваша заявка на отпуск одобрена',
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: 1
        },
        {
          id: 2,
          message: 'Новое сообщение в форуме',
          type: 'info',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          userId: 1
        }
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // Здесь будет API вызов для отметки уведомления как прочитанного
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error)
    }
  }

  const handleDelete = async (notificationId: number) => {
    try {
      // Здесь будет API вызов для удаления уведомления
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Здесь будет API вызов для отметки всех уведомлений как прочитанных
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })))
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Уведомления</span>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Отметить все как прочитанные
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="h-12 w-12 mb-2" />
              <p>Нет уведомлений</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 