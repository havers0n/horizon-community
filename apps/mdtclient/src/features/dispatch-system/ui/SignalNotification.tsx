import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface SignalNotificationProps {
  onClose?: () => void;
}

export const SignalNotificationBanner: React.FC<SignalNotificationProps> = ({ onClose }) => {
  const { t } = useLocale();
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'emergency',
      title: 'Code 3 Response Required',
      message: 'Armed robbery in progress at Fleeca Bank',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'high',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Traffic Alert',
      message: 'Major accident on Route 68',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'medium',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Weather Warning',
      message: 'Heavy rain expected in downtown area',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'low',
      read: true
    }
  ]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={16} />;
      case 'medium':
        return <Info size={16} />;
      case 'low':
        return <CheckCircle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const formatTime = (dateString: Date) => {
    const now = new Date();
    const diff = now.getTime() - dateString.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return dateString.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">{t('notifications.title')}</h3>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X size={16} />
          </Button>
        )}
      </CardHeader>
      
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
            <p className="text-secondary-400">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'ring-2 ring-primary-500/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{notification.title}</h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-300 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-400">
                        {formatTime(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs"
                        >
                          {t('notifications.markAsRead')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-4 border-t border-secondary-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-400">
              {notifications.filter(n => !n.read).length} unread
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotifications(prev => 
                prev.map(n => ({ ...n, read: true }))
              )}
            >
              {t('notifications.markAllAsRead')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
