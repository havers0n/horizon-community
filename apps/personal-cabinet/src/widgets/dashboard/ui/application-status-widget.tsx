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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Статус заявки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-700">Статус заявки</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{applicationsCount}</p>
            <p className="text-xs text-gray-500">Заявок</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{testsPassed}</p>
            <p className="text-xs text-gray-500">Тестов пройдено</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{attemptsLeft}</p>
            <p className="text-xs text-gray-500">Попыток осталось</p>
          </div>
        </div>

        {/* Warning for low attempts */}
        {attemptsLeft <= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                У вас осталось мало попыток. Будьте внимательны при подаче заявки.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 