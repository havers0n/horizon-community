import { Layout } from '@/shared/ui';
import { Card, CardContent, Skeleton } from '@/shared/ui';
import { H2, H3, Muted, Stack } from '@/shared/ui';
import { transformDashboardData } from '@/features/dashboard/model/types';
import { ProfileWidget } from '@/widgets/dashboard/ui/profile-widget';
import { FeedWidget } from '@/widgets/dashboard/ui/feed-widget';
import { QuickActionsWidget } from '@/widgets/dashboard/ui/quick-actions-widget';
import { AnnouncementsWidget } from '@/widgets/dashboard/ui/announcements-widget';
import { UsefulLinksWidget } from '@/widgets/dashboard/ui/useful-links-widget';
// Упрощаем дашборд под новую модель сессии: статистика и статусы временно отключены
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContext';
import { EntryApplicationModal } from '@/features/entry-application/ui/entry-application-modal';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { isCandidate, isMember, isCitizen, isAdmin } from '@roleplay-identity/shared-types';
import { CadetDashboard } from '@/features/dashboard/ui/cadet-dashboard';


// Компонент загрузки
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="card-horizon">
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
  <Card className="card-horizon">
    <CardContent className="p-6 text-center">
      <Stack space="sm" className="items-center">
        <H3>Ошибка загрузки данных</H3>
        <Muted>{error.message || 'Произошла ошибка при загрузке данных dashboard'}</Muted>
      </Stack>
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
        <div className="container mx-auto px-6 py-6">
          <DashboardSkeleton />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-6">
          <DashboardError error={new Error(typeof error === 'string' ? error : String(error))} />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-6">
          <DashboardError error={new Error('Данные не найдены')} />
        </div>
      </Layout>
    );
  }

  // Если у пользователя есть активный кадетский трек — показываем CadetDashboard
  if (Array.isArray(session?.cadetTracks) && session!.cadetTracks!.length > 0) {
    const activeTrack = session!.cadetTracks![0];
    const cadetDepartmentName = Array.isArray(session.applications)
      ? (session.applications.find(app => app?.id === activeTrack?.application_id)?.department_name ?? null)
      : null;

    return (
      <Layout>
        <div className="container mx-auto px-6 py-6 space-y-6">
          <Stack space="xs">
            <H2 className="text-2xl font-bold">Личный кабинет</H2>
            <Muted>Ваш прогресс и действия</Muted>
          </Stack>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Департамент: <span className="font-medium text-gray-200">{cadetDepartmentName || 'Не указан'}</span>
            </div>
          </div>
          <CadetDashboard track={activeTrack} />
        </div>
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

  // Роли пользователя из сессии
  const primaryRole = determinePrimaryRole(session.roles);
  const hasRole = (code: string) => Array.isArray(session.roles) && session.roles.some(r => r.code === code);
  // Кандидат определяется только по наличию роли 'candidate' и отсутствию админских/штатных ролей
  const isCandidateRole = hasRole('candidate') && !hasRole('admin') && !hasRole('system_admin') && !hasRole('staff');
  const isMemberRole = isMember(primaryRole.code);
  const isCitizenRole = isCitizen(primaryRole.code);
  const isAdminRole = isAdmin(primaryRole.code) || hasRole('system_admin');
  const quickActions = createQuickActions(primaryRole.code);
  const hasAdminPermission = Array.isArray(session.permissions) && session.permissions.includes('admin.panel.access');
  // Проверяем, ожидает ли пользователь интервью
  const isAwaitingInterview = Array.isArray(session.applications)
    ? session.applications.some(app => app?.status_code === 'awaiting_interview')
    : false;

  // Производные данные для отображения департамента кандидата
  const awaitingApp = Array.isArray(session.applications)
    ? session.applications.find(app => app?.status_code === 'awaiting_interview')
    : null;
  const awaitingDepartmentName = awaitingApp?.department_name ?? null;

  const lastApp = Array.isArray(session.applications) && session.applications.length > 0
    ? [...session.applications].sort((a, b) =>
        new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
      )[0]
    : null;
  const lastDepartmentName = lastApp?.department_name ?? null;

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
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Шапка страницы */}
        <div className="flex items-start justify-between">
          <Stack space="xs">
            <H2 className="text-2xl font-bold">Личный кабинет</H2>
            <Muted>Ваши быстрые действия и актуальная информация</Muted>
          </Stack>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
              Активен
            </div>
          </div>
        </div>

        {/* Role-based Dashboard */}
        {isCandidateRole ? (
          // Спец. состояние для кандидата, ожидающего интервью
          isAwaitingInterview ? (
            <div className="space-y-6">
              <Card className="card-horizon">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <Stack space="xs">
                      <H2 className="text-xl font-semibold">Поздравляем! Вы прошли отбор</H2>
                      <Muted>
                        Ваша заявка одобрена. Следующий шаг — интервью. Пожалуйста, проверьте Discord для получения инструкции и назначения времени.
                      </Muted>
                      {awaitingDepartmentName && (
                        <Muted>
                          Департамент: <span className="font-medium">{awaitingDepartmentName}</span>
                        </Muted>
                      )}
                    </Stack>
                    <div>
                      <a
                        href="https://discord.gg/horizoncommunity"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                      >
                        Перейти в Discord
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Полезные ссылки */}
              <UsefulLinksWidget links={transformedData.usefulLinks} />
            </div>
          ) : (
            // Обычный кандидатский дашборд с CTA на подачу заявки
            <div className="space-y-6">
              <Card className="card-horizon">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <Stack space="xs">
                      <H2 className="text-xl font-semibold">Начните свой путь в HorizonCommunity</H2>
                      <Muted>Подайте заявку на вступление в один из наших департаментов и станьте частью истории.</Muted>
                      {lastDepartmentName && (
                        <Muted>
                          Текущая заявка: <span className="font-medium">{lastDepartmentName}</span>
                        </Muted>
                      )}
                    </Stack>
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

              <UsefulLinksWidget links={transformedData.usefulLinks} />
            </div>
          )
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
            <Card className="card-horizon">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <Stack space="xs">
                    <H2 className="text-xl font-semibold">
                       Добро пожаловать, {transformedData.profile.userName || "Пользователь"}!
                    </H2>
                    <Muted>
                      Ваш статус: <span className="font-medium">{primaryRole?.name}</span>
                    </Muted>
                    <Muted>
                      Добро пожаловать в личный кабинет. Здесь вы можете отслеживать свои активности и получать важную информацию.
                    </Muted>
                  </Stack>
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
          <Card className="card-horizon">
            <CardContent className="p-6">
              <div className="text-center">
                <Stack space="sm" className="items-center">
                  <H3>Неизвестная роль пользователя</H3>
                  <Muted>Пожалуйста, обратитесь к администратору для настройки прав доступа.</Muted>
                </Stack>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}