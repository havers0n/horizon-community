import { useMemo } from 'react';
import { useSession } from '@/shared/contexts/SessionContext';

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
}

// API ответ
// legacy type removed

/**
 * Хук для получения данных дашборда
 * Централизует логику получения данных в одном месте
 */
export const useDashboardData = () => {
  const { session, isLoading: sessionLoading, error: sessionError } = useSession();

  const data = useMemo<DashboardData | undefined>(() => {
    if (!session) return undefined;

    // Определяем основную роль пользователя по приоритету
    const rolePriority = ['admin', 'staff', 'candidate', 'citizen'];
    const primaryRole = rolePriority.find((r) => session.roles.includes(r)) || 'citizen';

    return {
      user: {
        id: session.user.id,
        email: '',
        username: session.user.username ?? null,
        role: primaryRole,
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
      // Остальные поля опциональны и зависят от расширенных данных, которых нет в сессии
      // statistics, applicationStatus, nextSteps, departments, complaints, reports
    } as DashboardData;
  }, [session]);

  const error = sessionError ? new Error(sessionError) : null;

  return { data, isLoading: sessionLoading, error };
};