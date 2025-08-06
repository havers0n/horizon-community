import React from 'react';
import { Layout } from '@/shared/ui';
import { Card, CardContent, Skeleton } from '@/shared/ui';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { transformDashboardData } from '@/features/dashboard/model/types';
import { ProfileWidget } from '@/widgets/dashboard/ui/profile-widget';
import { FeedWidget } from '@/widgets/dashboard/ui/feed-widget';
import { QuickActionsWidget } from '@/widgets/dashboard/ui/quick-actions-widget';
import { AnnouncementsWidget } from '@/widgets/dashboard/ui/announcements-widget';
import { UsefulLinksWidget } from '@/widgets/dashboard/ui/useful-links-widget';
import { StatisticsWidget } from '@/widgets/dashboard/ui/statistics-widget';
import { ApplicationStatusWidget } from '@/widgets/dashboard/ui/application-status-widget';
import { NextStepsWidget } from '@/widgets/dashboard/ui/next-steps-widget';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Функция для определения роли кандидата
const isCandidate = (role: string): boolean => {
  return ['candidate', 'cadet_test', 'cadet_practice'].includes(role);
};

// Функция для определения роли участника
const isMember = (role: string): boolean => {
  return ['citizen', 'staff', 'admin'].includes(role);
};

// Компонент загрузки
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Компонент ошибки
const DashboardError = ({ error }: { error: Error }) => (
  <Card>
    <CardContent className="p-6">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ошибка загрузки дашборда
        </h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'Не удалось загрузить данные дашборда'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardData();

  // Обработчики для быстрых действий
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'promotion':
        navigate('/applications/promotion');
        break;
      case 'transfer':
        navigate('/applications/transfer');
        break;
      case 'combination':
        navigate('/applications/combination');
        break;
      case 'vacation':
        navigate('/applications/vacation');
        break;
      case 'report':
        navigate('/reports/new');
        break;
      case 'complaint':
        navigate('/complaints/new');
        break;
      default:
        toast.info('Функция в разработке');
    }
  };

  // Создание действий для QuickActionsWidget
  const createQuickActions = (isCandidateRole: boolean) => {
    if (isCandidateRole) {
      return [
        {
          id: '1',
          title: 'Подать заявку',
          icon: 'FileText',
          action: () => handleQuickAction('application'),
          category: 'career' as const,
        },
        {
          id: '2',
          title: 'Пройти тест',
          icon: 'Book',
          action: () => handleQuickAction('test'),
          category: 'career' as const,
        },
      ];
    }

    return [
      {
        id: '1',
        title: '↑ Повышение',
        icon: 'ArrowUp',
        action: () => handleQuickAction('promotion'),
        category: 'career' as const,
      },
      {
        id: '2',
        title: '⇄ Перевод',
        icon: 'ArrowUpDown',
        action: () => handleQuickAction('transfer'),
        category: 'career' as const,
      },
      {
        id: '3',
        title: '⚯ Комбинация',
        icon: 'Link',
        action: () => handleQuickAction('combination'),
        category: 'career' as const,
      },
      {
        id: '4',
        title: '✈ Отпуск',
        icon: 'Plane',
        action: () => handleQuickAction('vacation'),
        category: 'career' as const,
      },
      {
        id: '5',
        title: 'Подать рапорт',
        icon: 'FileText',
        action: () => handleQuickAction('report'),
        category: 'documentation' as const,
      },
      {
        id: '6',
        title: '▲ Подать жалобу',
        icon: 'AlertTriangle',
        action: () => handleQuickAction('complaint'),
        category: 'documentation' as const,
        variant: 'warning' as const,
      },
    ];
  };

  // Обработка состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <DashboardError error={error} />
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <DashboardError error={new Error('Данные не найдены')} />
      </Layout>
    );
  }

  // Преобразование данных для виджетов
  const transformedData = transformDashboardData(data);
  const isCandidateRole = isCandidate(data.user.role);
  const isMemberRole = isMember(data.user.role);
  const quickActions = createQuickActions(isCandidateRole);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Role-based Dashboard */}
        {isCandidateRole ? (
          // Dashboard для кандидатов
          <div className="space-y-6">
            {/* Welcome Block */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Добро пожаловать, {data.user.firstName || "Пользователь"}!
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Ваш статус: <span className="font-medium text-yellow-600">
                        {data.user.role === "candidate" ? "Кандидат" : 
                         data.user.role === "cadet_test" ? "Кадет на тестировании" : 
                         data.user.role === "cadet_practice" ? "Кадет на практике" : "Кандидат"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      У вас осталось <span className="font-semibold text-primary">
                        {data.user.attemptsLeft || 0} попыток
                      </span> для подачи заявки в этом месяце.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      В ожидании
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Application Status Widget */}
              {transformedData.applicationStatus && (
                <ApplicationStatusWidget {...transformedData.applicationStatus} />
              )}

              {/* Quick Actions Widget */}
              <QuickActionsWidget actions={quickActions} />

              {/* Next Steps Widget */}
              {transformedData.nextSteps && (
                <NextStepsWidget steps={transformedData.nextSteps} />
              )}

              {/* Feed Widget */}
              <FeedWidget activities={transformedData.feed} />

              {/* Announcements Widget */}
              <AnnouncementsWidget announcements={transformedData.announcements} />

              {/* Useful Links Widget */}
              <UsefulLinksWidget links={transformedData.usefulLinks} />
            </div>
          </div>
        ) : isMemberRole ? (
          // Dashboard для участников сообщества
          <div className="space-y-6">
            {/* Member Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Profile Widget */}
              <ProfileWidget {...transformedData.profile} />

              {/* Quick Actions Widget */}
              <QuickActionsWidget actions={quickActions} />

              {/* Useful Links Widget */}
              <UsefulLinksWidget links={transformedData.usefulLinks} />

              {/* Feed Widget */}
              <FeedWidget activities={transformedData.feed} />

              {/* Announcements Widget */}
              <AnnouncementsWidget announcements={transformedData.announcements} />

              {/* Statistics Widget */}
              {transformedData.statistics && (
                <StatisticsWidget statistics={transformedData.statistics} />
              )}
            </div>
          </div>
        ) : (
          // Fallback для неизвестных ролей
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Неизвестная роль пользователя
                </h3>
                <p className="text-gray-600">
                  Пожалуйста, обратитесь к администратору для настройки прав доступа.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 