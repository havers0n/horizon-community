import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { AnnouncementsWidgetProps } from '@/features/dashboard/model/types';
import { 
  Megaphone,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ announcements }) => {
  const getAnnouncementIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'normal':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'ВАЖНО';
      case 'normal':
        return 'ОБЪЯВЛЕНИЕ';
      case 'low':
        return 'ИНФО';
      default:
        return 'ОБЪЯВЛЕНИЕ';
    }
  };

  return (
<Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Важные объявления
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <Megaphone className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-400">Скоро: важные объявления появятся здесь</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`relative p-4 rounded-lg border-l-4 ${announcement.borderColor} bg-gray-700 hover:bg-gray-600 transition-colors`}
              >
                {/* Priority Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.priority === 'high' 
                      ? 'bg-red-900 text-red-200' 
                      : announcement.priority === 'normal'
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-green-900 text-green-200'
                  }`}>
                    {getPriorityLabel(announcement.priority)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex items-start space-x-3 pr-20">
                  <div className="flex-shrink-0 mt-1">
                    {getAnnouncementIcon(announcement.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-100 mb-1">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {announcement.preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
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
          <div className="pt-2 border-t border-gray-600">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
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