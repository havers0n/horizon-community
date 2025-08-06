import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { AnnouncementsWidgetProps } from '@/features/dashboard/model/types';
import { 
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle,
  Megaphone,
} from 'lucide-react';

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ announcements }) => {
  const getAnnouncementIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Info':
        return <Info className="w-4 h-4" />;
      case 'CheckCircle':
        return <CheckCircle className="w-4 h-4" />;
      case 'Megaphone':
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'ВАЖНО';
      case 'normal':
        return 'ОБЪЯВЛЕНИЕ';
      case 'low':
        return 'ИНФОРМАЦИЯ';
      default:
        return 'ОБЪЯВЛЕНИЕ';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Важные объявления
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Megaphone className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">Нет новых объявлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`relative p-4 rounded-lg border-l-4 ${announcement.borderColor} bg-white hover:bg-gray-50 transition-colors`}
              >
                {/* Priority Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : announcement.priority === 'normal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {getPriorityLabel(announcement.priority)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex items-start space-x-3 pr-20">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    announcement.priority === 'high' 
                      ? 'bg-red-100' 
                      : announcement.priority === 'normal'
                      ? 'bg-blue-100'
                      : 'bg-green-100'
                  }`}>
                    <div className={
                      announcement.priority === 'high' 
                        ? 'text-red-600' 
                        : announcement.priority === 'normal'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }>
                      {getAnnouncementIcon(announcement.icon)}
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {announcement.preview}
                    </p>
                    <p className="text-xs text-gray-500">
                      {announcement.timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* View All Link */}
        {announcements.length > 0 && (
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              <span>Посмотреть все объявления</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 