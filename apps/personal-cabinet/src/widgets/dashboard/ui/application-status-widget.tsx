import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ApplicationStatusWidgetProps } from '@/features/dashboard/model/types';
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ApplicationStatusWidget: React.FC<ApplicationStatusWidgetProps> = ({
  attemptsLeft,
  applicationsCount,
  testsPassed,
  status,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'rejected':
        return 'bg-red-900 text-red-200 border-red-700';
      case 'pending':
      default:
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      case 'pending':
      default:
        return 'В ожидании';
    }
  };

  return (
    <Card className="h-full bg-gray-800 border-gray-600">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Статус заявки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-300">Статус заявки</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-lg font-semibold text-gray-100">{applicationsCount}</p>
            <p className="text-xs text-gray-400">Заявок</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-lg font-semibold text-gray-100">{testsPassed}</p>
            <p className="text-xs text-gray-400">Тестов пройдено</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-900 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-lg font-semibold text-gray-100">{attemptsLeft}</p>
            <p className="text-xs text-gray-400">Попыток осталось</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 