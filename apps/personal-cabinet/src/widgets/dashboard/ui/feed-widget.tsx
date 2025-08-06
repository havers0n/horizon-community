import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FeedWidgetProps } from '@/features/dashboard/model/types';
import { 
  ArrowRight,
  FileText,
  AlertTriangle,
  ClipboardList,
  Book,
  Bell,
  Info,
} from 'lucide-react';

export const FeedWidget: React.FC<FeedWidgetProps> = ({ activities }) => {
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4" />;
      case 'ClipboardList':
        return <ClipboardList className="w-4 h-4" />;
      case 'Book':
        return <Book className="w-4 h-4" />;
      case 'Bell':
        return <Bell className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Моя лента
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Bell className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">Нет новых событий</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <div className={activity.color}>
                    {getActivityIcon(activity.icon)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timeAgo}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status === 'approved' && 'Одобрено'}
                    {activity.status === 'pending' && 'В ожидании'}
                    {activity.status === 'rejected' && 'Отклонено'}
                    {activity.status === 'completed' && 'Завершено'}
                    {!['approved', 'pending', 'rejected', 'completed'].includes(activity.status) && activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* View All Link */}
        {activities.length > 0 && (
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              <span>Посмотреть всю активность</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 