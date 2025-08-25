import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Bell, Check, Trash2, MessageCircle } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useNotificationClick } from '../model/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

const NotificationList: React.FC = () => {
  const { data: notifications = [], isLoading, error } = useNotifications()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const handleNotificationClick = useNotificationClick()

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'support': return 'bg-blue-100 text-blue-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'support': return <MessageCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Ошибка при загрузке уведомлений</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Уведомления</CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Отметить все как прочитанные
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Bell className="h-12 w-12 mb-2" />
            <p>Нет уведомлений</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.is_read ? 'bg-muted/50' : 'bg-background hover:bg-muted/30'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(notification.type)}
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type === 'support' ? 'Поддержка' : notification.type}
                        </Badge>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsReadMutation.mutate(notification.id)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationList 