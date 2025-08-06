import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatisticsWidgetProps } from '@/features/dashboard/model/types';
import { 
  Clock,
  Star,
  FileText,
  Award,
} from 'lucide-react';

export const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({ statistics }) => {
  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      case 'Star':
        return <Star className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'Award':
        return <Award className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const stats = [
    statistics.playtime,
    statistics.reputation,
    statistics.reports,
    statistics.achievements,
  ];

  return (
    <Card className="h-full bg-gray-800 border-gray-600">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Ваша статистика
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center space-y-2"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shadow-sm">
                <div className="text-gray-300">
                  {getStatIcon(stat.icon)}
                </div>
              </div>
              
              {/* Value */}
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-100">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400">
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 