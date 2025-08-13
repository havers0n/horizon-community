import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ProfileWidgetProps } from '@/features/dashboard/model/types';
import { 
  ArrowRight,
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
        return 'bg-green-900 text-green-200 border-green-700';
      case 'Inactive':
        return 'bg-gray-700 text-gray-200 border-gray-600';
      case 'Suspended':
        return 'bg-red-900 text-red-200 border-red-700';
      default:
        return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getWarningColor = (count: number) => {
    if (count === 0) return 'bg-green-900 text-green-200 border-green-700';
    if (count <= 2) return 'bg-yellow-900 text-yellow-200 border-yellow-700';
    return 'bg-red-900 text-red-200 border-red-700';
  };

  return (
    <Card className="h-full bg-gray-800 border-gray-600">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Добро пожаловать, {userName}!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and User Info */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-gray-600 text-gray-300 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            {/* Department */}
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                <span className="font-medium">Департамент:</span> {departments}
              </span>
            </div>
            
            {/* Rank */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                <span className="font-medium">Звание:</span> {rank}
              </span>
            </div>
            
            {/* Unit */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
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
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Предупреждения</h4>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">Сообщество:</span>
              <Badge 
                variant="outline" 
                className={getWarningColor(adminWarnings)}
              >
                {adminWarnings}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">Игра:</span>
              <Badge 
                variant="outline" 
                className={getWarningColor(gameWarnings)}
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
            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
          >
            <span>Посмотреть полный профиль</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 