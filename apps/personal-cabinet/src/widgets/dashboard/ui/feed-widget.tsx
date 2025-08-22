import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FeedWidgetProps } from '@/features/dashboard/model/types';
import { 
  Bell,
  ArrowRight,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Award,
} from 'lucide-react';

export const FeedWidget: React.FC<FeedWidgetProps> = ({ activities }) => {
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'CheckCircle':
        return <CheckCircle className="w-4 h-4" />;
      case 'XCircle':
        return <XCircle className="w-4 h-4" />;
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      case 'User':
        return <User className="w-4 h-4" />;
      case 'Award':
        return <Award className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
<Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Моя лента
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <Bell className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-400">Скоро: персональная лента появится здесь</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-600', '-900')}`}>
                  <div className={activity.color}>
                    {getActivityIcon(activity.icon)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.timeAgo}
                  </p>
                </div>
                
                {/* Status Badge */}
                {activity.status && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'approved' 
                      ? 'bg-green-900 text-green-200' 
                      : activity.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {activity.status === 'approved' && 'Одобрено'}
                    {activity.status === 'pending' && 'В ожидании'}
                    {activity.status === 'rejected' && 'Отклонено'}
                    {activity.status === 'completed' && 'Завершено'}
                    {!['approved', 'pending', 'rejected', 'completed'].includes(activity.status) && activity.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* View All Link */}
        {activities.length > 0 && (
          <div className="pt-2 border-t border-gray-600">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
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