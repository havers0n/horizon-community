import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';

// Типы для данных дашборда
export interface DashboardData {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: string;
    avatarUrl: string | null;
    firstName: string | null;
    lastName: string | null;
    department: string | null;
    division: string | null;
    isActive: boolean;
    gameWarnings: number;
    adminWarnings: number;
    attemptsLeft: number;
    profileImageUrl: string | null;
  };
  activities: Array<{
    id: string;
    type: 'application' | 'complaint' | 'report' | 'test' | 'notification';
    status: string;
    title: string;
    createdAt: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    preview: string;
    priority: 'high' | 'normal' | 'low';
    createdAt: string;
  }>;
  usefulLinks: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
    description: string;
  }>;
  statistics?: {
    playtime: number;
    reputation: number;
    reports: number;
    achievements: number;
  };
  applicationStatus?: {
    attemptsLeft: number;
    applicationsCount: number;
    testsPassed: number;
  };
  nextSteps?: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    link: string | null;
  }>;
  departments?: Array<{
    id: string;
    name: string;
    description: string;
    logo_url: string;
    division?: {
      id: string;
      name: string;
    };
  }>;
  complaints?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  }>;
  reports?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

// API ответ
interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

/**
 * Хук для получения данных дашборда
 * Централизует логику получения данных в одном месте
 */
export const useDashboardData = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard', 'data'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<DashboardApiResponse>('/cabinet/dashboard-data');
        
        if (!response.success) {
          throw new Error(response.message || 'Ошибка загрузки данных дашборда');
        }
        
        return response.data;
      } catch (error) {
        console.error('Ошибка загрузки данных дашборда:', error);
        throw new Error('Не удалось загрузить данные дашборда');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
    refetchOnWindowFocus: false,
  });
}; 