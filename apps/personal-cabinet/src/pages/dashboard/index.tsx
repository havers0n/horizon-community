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
import { useSession } from '@/shared/contexts/SessionContext';
import { NextStepCard } from '@/shared/ui/NextStepCard';
import { EntryApplicationModal } from '@/features/entry-application/ui/entry-application-modal';
import { toast } from 'sonner';
import { isCandidate, isMember, isCitizen, isAdmin } from '@roleplay-identity/shared-types';


// Компонент загрузки
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-gray-800 border-gray-600">
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
  <Card className="bg-gray-800 border-gray-600">
    <CardContent className="p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">
        Ошибка загрузки данных
      </h3>
      <p className="text-gray-400">
        {error.message || 'Произошла ошибка при загрузке данных dashboard'}
      </p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardData();
  const { session } = useSession();

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
  const createQuickActions = (userRole: string) => {
    if (isCandidate(userRole)) {
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

    if (isMember(userRole) || isAdmin(userRole)) {
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
    }

    if (isCitizen(userRole)) {
      return [
        {
          id: '1',
          title: 'Подать заявку на вступление',
          icon: 'FileText',
          action: () => handleQuickAction('application'),
          category: 'career' as const,
        },
        {
          id: '2',
          title: 'Подать жалобу',
          icon: 'AlertTriangle',
          action: () => handleQuickAction('complaint'),
          category: 'documentation' as const,
          variant: 'warning' as const,
        },
        {
          id: '3',
          title: 'Подать рапорт',
          icon: 'FileText',
          action: () => handleQuickAction('report'),
          category: 'documentation' as const,
        },
      ];
    }

    // Fallback для неизвестных ролей
    return [];
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
  // Кандидат: если нет активных треков и статусов
  const isTrueCandidate = (!session?.cadetTracks || session.cadetTracks.length === 0) && (!session?.statuses || session.statuses.length === 0)
  const isCandidateRole = isTrueCandidate || isCandidate(data.user.role);
  const isMemberRole = isMember(data.user.role);
  const isCitizenRole = isCitizen(data.user.role);
  const isAdminRole = isAdmin(data.user.role);
  const quickActions = createQuickActions(data.user.role);

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Debug Info:', {
      userRole: data.user.role,
      isCandidate: isCandidateRole,
      isMember: isMemberRole,
      isCitizen: isCitizenRole,
      isAdmin: isAdminRole,
      userData: data.user
    });
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Next step based on cadetTracks */}
        {Array.isArray(session?.cadetTracks) && session!.cadetTracks!.length > 0 && (
          <NextStepCard stageCode={session!.cadetTracks![0]?.stage_code || null} />
        )}
        {/* Role-based Dashboard */}
        {isCandidateRole ? (
          // Dashboard для кандидатов
          <div className="space-y-6">
            {/* Welcome Block */}
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-100">
                      Добро пожаловать, {data.user.firstName || "Пользователь"}!
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                      Ваш статус: <span className="font-medium text-yellow-400">
                        {data.user.role === "candidate" ? "Кандидат" : "Кандидат"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      У вас осталось <span className="font-semibold text-gold-400">
                        {data.user.attemptsLeft || 0} попыток
                      </span> для подачи заявки в этом месяце.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                      В ожидании
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Call-to-action panel */}
              <Card className="bg-gray-800 border-gray-600 md:col-span-2 lg:col-span-2">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100 mb-1">Готовы присоединиться?</h3>
                    <p className="text-gray-400">Заполните заявку на вступление и начните путь кадета.</p>
                  </div>
                  <EntryApplicationModal />
                </CardContent>
              </Card>

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
        ) : (isMemberRole || isAdminRole) ? (
          // Dashboard для участников сообщества и администраторов
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
        ) : isCitizenRole ? (
          // Dashboard для граждан
          <div className="space-y-6">
            {/* Welcome Block для граждан */}
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-100">
                      Добро пожаловать, {data.user.firstName || "Пользователь"}!
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                      Ваш статус: <span className="font-medium text-blue-400">
                        Гражданский
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Добро пожаловать в личный кабинет. Здесь вы можете отслеживать свои активности и получать важную информацию.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                      Активен
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Citizen Dashboard Grid */}
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
            </div>
          </div>
        ) : (
          // Fallback для неизвестных ролей
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Неизвестная роль пользователя
                </h3>
                <p className="text-gray-400">
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