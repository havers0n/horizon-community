import { useSession } from '@/shared/contexts/SessionContext';

// Определяем типы для понятности
export interface UserPermissions {
  isLoggedIn: boolean;
  isCandidate: boolean;
  isMember: boolean;
  isAdmin: boolean;
  // Добавляйте сюда другие ключевые флаги по мере необходимости
  session: NonNullable<ReturnType<typeof useSession>['session']>;
  // Новые методы для работы с пермишенами
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export function usePermissions(): UserPermissions {
  const { session } = useSession();

  // Если сессии нет, пользователь - гость
  if (!session) {
    return {
      isLoggedIn: false,
      isCandidate: false,
      isMember: false,
      isAdmin: false,
      session: null as any, // Возвращаем null-совместимый объект
      permissions: [],
      hasPermission: () => false,
      hasAnyPermission: () => false,
    };
  }

  // --- НОВАЯ ЛОГИКА НА ОСНОВЕ ПЕРМИШЕНОВ ---
  const permissions = new Set(session.permissions || []);

  const isAdmin = permissions.has('admin.panel.access');
  const isMember = permissions.has('community.member.access');
  
  // Кандидат - это тот, кто залогинен, но еще НЕ является участником.
  // Админ по определению тоже является участником.
  const isCandidate = !isMember && !isAdmin;

  return {
    isLoggedIn: true,
    isCandidate,
    isMember: isMember || isAdmin, // Админ всегда является и участником
    isAdmin,
    session,
    permissions: session.permissions || [],
    hasPermission: (permission: string) => permissions.has(permission),
    hasAnyPermission: (checkPermissions: string[]) => 
      checkPermissions.some(permission => permissions.has(permission)),
  };
}


