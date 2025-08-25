import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Bell, Megaphone, MessageCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, useMarkAsRead, useNotificationClick } from '@/features/notifications/model/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const EventsWidget: React.FC = () => {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const handleNotificationClick = useNotificationClick();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'support': return <MessageCircle className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'support': return 'Поддержка'
      case 'success': return 'Успех'
      case 'warning': return 'Предупреждение'
      case 'error': return 'Ошибка'
      case 'info': return 'Информация'
      default: return type
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-100">
            Лента событий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-100">
            Лента событий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-400 mb-2" />
            <p className="text-sm text-gray-400">Ошибка загрузки уведомлений</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Лента событий
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="space-y-4">
            {/* Плейсхолдер для объявлений */}
            <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/30 p-4">
              <div className="flex items-start gap-3">
                <Megaphone className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-100">
                    Здесь будут отображаться важные объявления от администрации.
                  </p>
                </div>
              </div>
            </div>

            {/* Плейсхолдер для уведомлений */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-4 w-4 text-gray-300 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    Здесь будет отображаться история статусов ваших заявок.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.is_read ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${notification.is_read ? 'text-gray-300' : 'text-gray-100'}`}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};


