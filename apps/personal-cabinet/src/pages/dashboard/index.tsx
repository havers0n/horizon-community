import { Layout } from '@/shared/ui';
import { Card, CardContent, Skeleton } from '@/shared/ui';
import { transformDashboardData } from '@/features/dashboard/model/types';
import { ProfileWidget } from '@/widgets/dashboard/ui/profile-widget';
import { FeedWidget } from '@/widgets/dashboard/ui/feed-widget';
import { QuickActionsWidget } from '@/widgets/dashboard/ui/quick-actions-widget';
import { AnnouncementsWidget } from '@/widgets/dashboard/ui/announcements-widget';
import { UsefulLinksWidget } from '@/widgets/dashboard/ui/useful-links-widget';
// Упрощаем дашборд под новую модель сессии: статистика и статусы временно отключены
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContext';
import { NextStepCard } from '@/shared/ui/NextStepCard';
import { EntryApplicationModal } from '@/features/entry-application/ui/entry-application-modal';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
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
  const { session, isLoading, error } = useSession();

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
        <DashboardError error={new Error(typeof error === 'string' ? error : String(error))} />
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <DashboardError error={new Error('Данные не найдены')} />
      </Layout>
    );
  }

  // Вспомогательная функция: определить приоритетную роль
  type RoleObj = { code: string; name: string };
  const determinePrimaryRole = (roles: RoleObj[]): RoleObj => {
    const fallback: RoleObj = { code: 'citizen', name: 'Гражданский' };
    if (!Array.isArray(roles) || roles.length === 0) return fallback;
    const byCode = (code: string) => roles.find(r => r.code === code);
    return (
      byCode('system_admin') ||
      byCode('admin') ||
      byCode('staff') ||
      byCode('candidate') ||
      byCode('citizen') ||
      roles[0]
    );
  };

  // Преобразование данных для второстепенных виджетов
  const transformedData = transformDashboardData({
    user: {
      id: session.user.id,
      email: '',
      username: session.user.username,
      role: determinePrimaryRole(session.roles).code,
      avatarUrl: null,
      firstName: null,
      lastName: null,
      department: null,
      division: null,
      isActive: true,
      gameWarnings: 0,
      adminWarnings: 0,
      attemptsLeft: 0,
      profileImageUrl: null,
    },
    activities: [],
    announcements: [],
    usefulLinks: [],
  } as any);

  // Кандидат: если нет активных треков и статусов
  const primaryRole = determinePrimaryRole(session.roles);
  const isTrueCandidate = (
    (primaryRole.code === 'candidate' || primaryRole.code === 'citizen') &&
    (!session?.cadetTracks || session.cadetTracks.length === 0) &&
    (!session?.statuses || session.statuses.length === 0)
  )
  const isCandidateRole = isTrueCandidate || isCandidate(primaryRole.code);
  const isMemberRole = isMember(primaryRole.code);
  const isCitizenRole = isCitizen(primaryRole.code);
  const isAdminRole = isAdmin(primaryRole.code) || primaryRole.code === 'system_admin';
  const quickActions = createQuickActions(primaryRole.code);
  const hasAdminPermission = Array.isArray(session.permissions) && session.permissions.includes('admin.panel.access');

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Debug Info:', {
      userRole: primaryRole.code,
      isCandidate: isCandidateRole,
      isMember: isMemberRole,
      isCitizen: isCitizenRole,
      isAdmin: isAdminRole,
      userData: session.user
    });
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Главный баннер с приоритетной ролью */}
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-100">
                  Добро пожаловать, {session.user.username || 'Пользователь'}!
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Ваша роль: <span className="font-medium text-blue-400">{primaryRole?.name}</span>
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
        {/* Next step based on cadetTracks */}
        {Array.isArray(session?.cadetTracks) && session!.cadetTracks!.length > 0 && (
          <NextStepCard stageCode={session!.cadetTracks![0]?.stage_code || null} />
        )}
        {/* Role-based Dashboard */}
        {isCandidateRole ? (
          // Упрощённый дашборд для кандидатов: только CTA и полезные ссылки
          <div className="space-y-6">
            {/* CTA Widget */}
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-100">Начните свой путь в HorizonCommunity</h1>
                    <p className="text-gray-400 mt-2">Подайте заявку на вступление в один из наших департаментов и станьте частью истории.</p>
                  </div>
                  {!(primaryRole.code === 'system_admin' || hasAdminPermission) && (
                    <div>
                      <EntryApplicationModal>
                        <Button size="lg">Подать заявку на вступление</Button>
                      </EntryApplicationModal>
                    </div>
                  )}
                  <div className="flex gap-6">
                    <Link to="/departments" className="text-primary hover:underline">Знакомство с департаментами</Link>
                    <Link to="/gallery" className="text-primary hover:underline">Посмотреть галерею</Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Useful Links Widget */}
            <UsefulLinksWidget links={transformedData.usefulLinks} />
          </div>
        ) : (isMemberRole || isAdminRole) ? (
          // Dashboard для участников сообщества и администраторов
          <div className="space-y-6">
            {/* Member Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Profile Widget */}
              <ProfileWidget {
                ...{
                  userName: session.user.username || 'Пользователь',
                  departments: (Array.isArray(session.statuses) && session.statuses.length > 0)
                    ? session.statuses.join(', ')
                    : (isAdminRole || hasAdminPermission ? 'Системная роль: Администратор' : 'Не указан'),
                  rank: '-',
                  unit: '-',
                  status: ((Array.isArray(session.statuses) && session.statuses.length > 0) || isAdminRole || hasAdminPermission) ? 'Active' : 'Inactive',
                  gameWarnings: 0,
                  adminWarnings: 0,
                  avatarUrl: undefined,
                  initials: (session.user.username || 'П').slice(0, 2).toUpperCase(),
                }
              } />

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
        ) : isCitizenRole ? (
          // Dashboard для граждан
          <div className="space-y-6">
            {/* Welcome Block для граждан */}
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-100">
                       Добро пожаловать, {transformedData.profile.userName || "Пользователь"}!
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                      Ваш статус: <span className="font-medium text-blue-400">{primaryRole?.name}</span>
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

            {/* Citizen Dashboard Grid */
            }
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Profile Widget */}
              <ProfileWidget {
                ...{
                  userName: session.user.username || 'Пользователь',
                  departments: (Array.isArray(session.statuses) && session.statuses.length > 0)
                    ? session.statuses.join(', ')
                    : (isAdminRole || hasAdminPermission ? 'Системная роль: Администратор' : 'Не указан'),
                  rank: '-',
                  unit: '-',
                  status: ((Array.isArray(session.statuses) && session.statuses.length > 0) || isAdminRole || hasAdminPermission) ? 'Active' : 'Inactive',
                  gameWarnings: 0,
                  adminWarnings: 0,
                  avatarUrl: undefined,
                  initials: (session.user.username || 'П').slice(0, 2).toUpperCase(),
                }
              } />

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