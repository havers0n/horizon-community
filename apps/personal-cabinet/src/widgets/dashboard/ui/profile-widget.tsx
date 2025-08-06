import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ProfileWidgetProps } from '@/features/dashboard/model/types';
import { 
  ArrowRight,
  AlertTriangle,
  Shield,
} from 'lucide-react';

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({
  userName,
  departments,
  rank,
  unit,
  status,
  gameWarnings,
  adminWarnings,
  avatarUrl,
  initials,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWarningColor = (count: number) => {
    if (count === 0) return 'bg-green-100 text-green-800 border-green-200';
    if (count <= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Добро пожаловать, {userName}!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and User Info */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            {/* Department */}
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">Департамент:</span> {departments}
              </span>
            </div>
            
            {/* Rank */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                <span className="font-medium">Звание:</span> {rank}
              </span>
            </div>
            
            {/* Unit */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                <span className="font-medium">Подразделение:</span> {unit}
              </span>
            </div>
            
            {/* Status */}
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(status)}>
                {status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Warnings Section */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Предупреждения</h4>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">Сообщество:</span>
              <Badge 
                variant="outline" 
                className={getWarningColor(adminWarnings)}
                size="sm"
              >
                {adminWarnings}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">Игра:</span>
              <Badge 
                variant="outline" 
                className={getWarningColor(gameWarnings)}
                size="sm"
              >
                {gameWarnings}
              </Badge>
            </div>
          </div>
        </div>

        {/* View Profile Link */}
        <div className="pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
          >
            <span>Посмотреть полный профиль</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 