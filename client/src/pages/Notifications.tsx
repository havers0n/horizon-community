import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Info, Check, Trash2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/notifications']
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('PUT', `/api/notifications/${notificationId}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отметить уведомление как прочитанное",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('DELETE', `/api/notifications/${notificationId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Уведомление удалено",
        description: "Уведомление успешно удалено"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить уведомление",
        variant: "destructive"
      });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', '/api/notifications/read-all', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Все уведомления прочитаны",
        description: "Все уведомления отмечены как прочитанные"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отметить все уведомления как прочитанные",
        variant: "destructive"
      });
    }
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length || 0;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    deleteMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад к дашборду</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Уведомления</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} непрочитанных
                </Badge>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Прочитать все</span>
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">Нет уведомлений</h3>
                <p className="text-muted-foreground">У вас пока нет уведомлений</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-6 rounded-lg border transition-colors ${
                      !notification.isRead 
                        ? 'bg-info/10 border-info/20' 
                        : 'bg-card border-border hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          !notification.isRead ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-base ${
                            !notification.isRead ? 'text-blue-900 font-medium' : 'text-gray-900'
                          }`}>
                            {notification.content}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {notification.link && (
                            <a
                              href={notification.link}
                              className="text-sm text-primary hover:text-primary/90 mt-2 inline-block"
                            >
                              Перейти →
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            className="h-8 w-8 p-0"
                            title="Отметить как прочитанное"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="Удалить уведомление"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 