import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Shield, 
  ArrowRight, 
  AlertTriangle, 
  Calendar,
  Award,
  Building 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { cn } from '@/shared/lib/utils';
import { ProfileSummarySkeleton } from './ui/ProfileSummarySkeleton';
import { 
  DashboardProfileData, 
  ProfileSummaryWidgetProps, 
  MembershipDisplay 
} from './types';

export function ProfileSummaryWidget({ className }: ProfileSummaryWidgetProps) {
  // Загрузка данных профиля через RPC функцию
  const {
    data: profileData,
    isLoading,
    error
  } = useQuery<DashboardProfileData>({
    queryKey: ['dashboard-profile'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_my_dashboard_profile');
      
      if (error) {
        console.error('Error fetching dashboard profile:', error);
        throw new Error(`Failed to fetch dashboard profile: ${error.message}`);
      }
      
      return data;
    },
    // Обновляем данные каждые 5 минут
    refetchInterval: 5 * 60 * 1000,
    // Обновляем при фокусе окна
    refetchOnWindowFocus: true
  });

  // Обработка членств для отображения
  const processedMemberships = useMemo((): MembershipDisplay[] => {
    if (!profileData?.memberships) return [];
    
    return profileData.memberships.map(membership => {
      let displayText = membership.department_name;
      
      if (membership.division_name) {
        displayText += ` | ${membership.division_name}`;
      }
      
      if (!membership.is_primary) {
        displayText += ' (Совмещение)';
      }
      
      return {
        departmentName: membership.department_name,
        divisionName: membership.division_name,
        rankName: membership.rank_name,
        isPrimary: membership.is_primary,
        displayText
      };
    });
  }, [profileData?.memberships]);

  // Получение имени пользователя для приветствия
  const getUserDisplayName = useMemo(() => {
    if (!profileData?.user) return 'Участник';
    
    if (profileData.user.first_name || profileData.user.last_name) {
      return `${profileData.user.first_name || ''} ${profileData.user.last_name || ''}`.trim();
    }
    
    return profileData.user.username || 'Участник';
  }, [profileData?.user]);

  // Проверка наличия предупреждений
  const hasWarnings = useMemo(() => {
    return profileData?.warnings && 
           (profileData.warnings.community > 0 || profileData.warnings.game > 0);
  }, [profileData?.warnings]);

  // Проверка статуса отпуска
  const leaveInfo = useMemo(() => {
    if (!profileData?.leave_status?.is_on_leave) return null;
    
    return {
      isOnLeave: true,
      endDate: profileData.leave_status.end_date
    };
  }, [profileData?.leave_status]);

  // Цвета для бейджей предупреждений
  const getWarningBadgeVariant = (count: number) => {
    if (count === 0) return 'secondary';
    if (count <= 2) return 'warning';
    return 'destructive';
  };

  // Показываем скелетон во время загрузки
  if (isLoading) {
    return <ProfileSummarySkeleton />;
  }

  // Показываем ошибку
  if (error) {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ошибка загрузки профиля. Попробуйте обновить страницу.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Добро пожаловать, {getUserDisplayName}!
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Статус отпуска (если в отпуске) */}
        {leaveInfo && (
          <Alert className="border-blue-200 bg-blue-50">
            <Calendar className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-1">
              🌴 В отпуске
              {leaveInfo.endDate && (
                <span> до {new Date(leaveInfo.endDate).toLocaleDateString('ru-RU')}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Членства */}
        {processedMemberships.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Департаменты
            </h4>
            <div className="space-y-2">
              {processedMemberships.map((membership, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      membership.isPrimary ? 'bg-primary' : 'bg-muted-foreground'
                    )} />
                    <span className="text-sm font-medium">
                      {membership.displayText}
                    </span>
                  </div>
                  <div className="ml-4 text-xs text-muted-foreground">
                    Звание: {membership.rankName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Квалификации */}
        {profileData?.qualifications && profileData.qualifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Квалификации
            </h4>
            <div className="flex flex-wrap gap-1">
              {profileData.qualifications.map((qualification) => (
                <Badge
                  key={qualification.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {qualification.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Предупреждения (если есть) */}
        {hasWarnings && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Предупреждения
            </h4>
            <div className="flex space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">Сообщество:</span>
                <Badge variant={getWarningBadgeVariant(profileData!.warnings.community)}>
                  {profileData!.warnings.community}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">Игра:</span>
                <Badge variant={getWarningBadgeVariant(profileData!.warnings.game)}>
                  {profileData!.warnings.game}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Ссылка на полный профиль */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 p-0 h-auto"
            asChild
          >
            <Link to="/profile" className="flex items-center gap-1">
              <span>Посмотреть полный профиль</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}