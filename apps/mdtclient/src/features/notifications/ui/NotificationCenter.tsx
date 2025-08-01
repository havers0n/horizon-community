import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { 
  Bell, 
  X, 
  Phone, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'call_911' | 'unit_status' | 'bolo' | 'panic' | 'signal_100' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  data?: any;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onDismiss: (notificationId: string) => void;
  onDismissAll: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'call_911':
      return <Phone className="h-4 w-4 text-red-500" />;
    case 'unit_status':
      return <Users className="h-4 w-4 text-blue-500" />;
    case 'bolo':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'panic':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'signal_100':
      return <AlertTriangle className="h-4 w-4 text-red-700" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ч назад`;
  } else {
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onDismiss,
  onDismissAll,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => 
    n.priority === 'high' || n.priority === 'critical'
  ).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'high' || notification.priority === 'critical';
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    // Сортируем по приоритету, затем по времени
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const playNotificationSound = (priority: Notification['priority']) => {
    if (!isSoundEnabled) return;

    // Здесь можно добавить разные звуки для разных приоритетов
    const audio = new Audio();
    
    switch (priority) {
      case 'critical':
        audio.src = '/sounds/critical-alert.mp3';
        break;
      case 'high':
        audio.src = '/sounds/high-priority.mp3';
        break;
      case 'panic':
        audio.src = '/sounds/panic-alert.mp3';
        break;
      default:
        audio.src = '/sounds/notification.mp3';
    }

    audio.play().catch(() => {
      // Игнорируем ошибки воспроизведения
    });
  };

  useEffect(() => {
    // Воспроизводим звук для новых уведомлений
    const newNotifications = notifications.filter(n => {
      const timeDiff = Date.now() - new Date(n.timestamp).getTime();
      return timeDiff < 5000; // Уведомления за последние 5 секунд
    });

    newNotifications.forEach(notification => {
      if (notification.priority === 'critical' || notification.priority === 'high') {
        playNotificationSound(notification.priority);
      }
    });
  }, [notifications]);

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Уведомления</h3>
            {unreadCount > 0 && (
              <Badge className="bg-blue-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-1"
            >
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                Прочитать все
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismissAll}
                className="text-xs"
              >
                Очистить все
              </Button>
            )}
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            Все ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="text-xs"
          >
            Непрочитанные ({unreadCount})
          </Button>
          <Button
            variant={filter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('high')}
            className="text-xs"
          >
            Высокий приоритет ({highPriorityCount})
          </Button>
        </div>
      </div>

      <div className="p-4">
        {sortedNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Нет уведомлений</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(notification.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(notification.id);
                      }}
                      className="p-1 h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}; 