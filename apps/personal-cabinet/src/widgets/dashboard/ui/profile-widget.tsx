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
        return 'bg-success/10 text-success border-success/20';
      case 'Inactive':
        return 'bg-muted text-muted-foreground border-border';
      case 'Suspended':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getWarningColor = (count: number) => {
    if (count === 0) return 'bg-success/10 text-success border-success/20';
    if (count <= 2) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Добро пожаловать, {userName}!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and User Info */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            {/* Department */}
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <span className="font-medium">Департамент:</span> {departments}
              </span>
            </div>
            
            {/* Rank */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                <span className="font-medium">Звание:</span> {rank}
              </span>
            </div>
            
            {/* Unit */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
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
          <h4 className="text-sm font-medium text-foreground">Предупреждения</h4>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">Сообщество:</span>
              <Badge 
                variant="outline" 
                className={getWarningColor(adminWarnings)}
              >
                {adminWarnings}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">Игра:</span>
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
            className="text-primary hover:text-primary/80 p-0 h-auto"
          >
            <span>Посмотреть полный профиль</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 