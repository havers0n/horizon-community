import { DashboardData } from '../hooks/useDashboardData';

// Типы для ProfileWidget
export interface ProfileWidgetProps {
  userName: string;
  departments: string;
  rank: string;
  unit: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  gameWarnings: number;
  adminWarnings: number;
  avatarUrl?: string;
  initials: string;
}

// Типы для FeedWidget
export interface FeedActivity {
  id: string;
  type: 'application' | 'complaint' | 'report' | 'test' | 'notification';
  status: string;
  title: string;
  timeAgo: string; // Форматированное время
  icon: string;
  color: string;
}

export interface FeedWidgetProps {
  activities: FeedActivity[];
}

// Типы для QuickActionsWidget
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: () => void;
  variant?: 'default' | 'warning';
  category: 'career' | 'documentation';
}

export interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

// Типы для AnnouncementsWidget
export interface AnnouncementItem {
  id: string;
  title: string;
  preview: string;
  priority: 'high' | 'normal' | 'low';
  timeAgo: string;
  borderColor: string;
  icon: string;
}

export interface AnnouncementsWidgetProps {
  announcements: AnnouncementItem[];
}

// Типы для UsefulLinksWidget
export interface UsefulLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  description: string;
}

export interface UsefulLinksWidgetProps {
  links: UsefulLink[];
}

// Типы для StatisticsWidget
export interface StatisticCard {
  title: string;
  value: string;
  icon: string;
  description?: string;
}

export interface StatisticsWidgetProps {
  statistics: {
    playtime: StatisticCard;
    reputation: StatisticCard;
    reports: StatisticCard;
    achievements: StatisticCard;
  };
}

// Типы для ApplicationStatusWidget (для кандидатов)
export interface ApplicationStatusWidgetProps {
  attemptsLeft: number;
  applicationsCount: number;
  testsPassed: number;
  status: 'pending' | 'approved' | 'rejected';
}

// Типы для NextStepsWidget (для кандидатов)
export interface NextStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string | null;
}

export interface NextStepsWidgetProps {
  steps: NextStep[];
}

// Функции для преобразования данных
export const transformDashboardData = (data: DashboardData) => {
  return {
    profile: transformProfileData(data.user),
    feed: transformFeedData(data.activities),
    announcements: transformAnnouncementsData(data.announcements),
    usefulLinks: data.usefulLinks,
    statistics: data.statistics ? transformStatisticsData(data.statistics) : undefined,
    applicationStatus: data.applicationStatus ? transformApplicationStatusData(data.applicationStatus) : undefined,
    nextSteps: data.nextSteps,
  };
};

const transformProfileData = (user: DashboardData['user']): ProfileWidgetProps => {
  const departments = user.department ? user.department : 'Не указан';
  const rank = user.division ? user.division : 'Не указано';
  const unit = user.division ? user.division : '-';
  const status = user.isActive ? 'Active' : 'Inactive';
  
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  
  return {
    userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Пользователь',
    departments,
    rank,
    unit,
    status,
    gameWarnings: user.gameWarnings,
    adminWarnings: user.adminWarnings,
    avatarUrl: user.avatarUrl || user.profileImageUrl,
    initials,
  };
};

const transformFeedData = (activities: DashboardData['activities']): FeedActivity[] => {
  return activities.map(activity => {
    const timeAgo = formatTimeAgo(activity.createdAt);
    const { icon, color } = getActivityIconAndColor(activity.type);
    
    return {
      id: activity.id,
      type: activity.type,
      status: activity.status,
      title: activity.title,
      timeAgo,
      icon,
      color,
    };
  });
};

const transformAnnouncementsData = (announcements: DashboardData['announcements']): AnnouncementItem[] => {
  return announcements.map(announcement => {
    const timeAgo = formatTimeAgo(announcement.createdAt);
    const { borderColor, icon } = getAnnouncementStyle(announcement.priority);
    
    return {
      id: announcement.id,
      title: announcement.title,
      preview: announcement.preview,
      priority: announcement.priority,
      timeAgo,
      borderColor,
      icon,
    };
  });
};

const transformStatisticsData = (statistics: DashboardData['statistics']): StatisticsWidgetProps['statistics'] => {
  return {
    playtime: {
      title: 'Время игры',
      value: formatPlaytime(statistics.playtime),
      icon: 'Clock',
    },
    reputation: {
      title: 'Репутация',
      value: `${statistics.reputation}/5.0`,
      icon: 'Star',
    },
    reports: {
      title: 'Рапорты',
      value: statistics.reports.toString(),
      icon: 'FileText',
    },
    achievements: {
      title: 'Достижения',
      value: `${statistics.achievements}/15`,
      icon: 'Award',
    },
  };
};

const transformApplicationStatusData = (status: DashboardData['applicationStatus']): ApplicationStatusWidgetProps => {
  return {
    attemptsLeft: status.attemptsLeft,
    applicationsCount: status.applicationsCount,
    testsPassed: status.testsPassed,
    status: 'pending', // Определяется логикой
  };
};

// Вспомогательные функции
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ч назад`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} дн назад`;
  }
};

const formatPlaytime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}ч ${remainingMinutes}м`;
};

const getActivityIconAndColor = (type: string): { icon: string; color: string } => {
  switch (type) {
    case 'application':
      return { icon: 'FileText', color: 'text-blue-600' };
    case 'complaint':
      return { icon: 'AlertTriangle', color: 'text-red-600' };
    case 'report':
      return { icon: 'ClipboardList', color: 'text-green-600' };
    case 'test':
      return { icon: 'Book', color: 'text-purple-600' };
    case 'notification':
      return { icon: 'Bell', color: 'text-yellow-600' };
    default:
      return { icon: 'Info', color: 'text-gray-600' };
  }
};

const getAnnouncementStyle = (priority: string): { borderColor: string; icon: string } => {
  switch (priority) {
    case 'high':
      return { borderColor: 'border-red-500', icon: 'AlertTriangle' };
    case 'normal':
      return { borderColor: 'border-blue-500', icon: 'Info' };
    case 'low':
      return { borderColor: 'border-green-500', icon: 'CheckCircle' };
    default:
      return { borderColor: 'border-gray-500', icon: 'Info' };
  }
}; 