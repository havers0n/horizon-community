import { useMemo } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { RoleDebugger } from '@/shared/utils/roleDebugger';

export const useUserRoles = () => {
  const { user } = useAuth();
  
  const getUserRoles = (): string[] => {
    // Сначала проверяем тестовые роли (для отладки)
    if (RoleDebugger.isTestRoleActive()) {
      const testRoles = RoleDebugger.getTestRole();
      console.log('[useUserRoles] Using test roles:', testRoles);
      return testRoles;
    }
    
    if (!user) return [];
    
    // Проверяем различные возможные места хранения ролей
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles;
    }
    
    if (user.role && typeof user.role === 'string') {
      return [user.role];
    }
    
    // Fallback - проверяем localStorage
    try {
      const userData = localStorage.getItem('mdt-user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.roles && Array.isArray(parsedUser.roles)) {
          return parsedUser.roles;
        }
        if (parsedUser.role && typeof parsedUser.role === 'string') {
          return [parsedUser.role];
        }
      }
    } catch (error) {
      console.error('Error getting user roles from localStorage:', error);
    }
    
    return [];
  };
  
  // Кэшируем роли с помощью useMemo
  const roles = useMemo(() => getUserRoles(), [user?.id, user?.roles, user?.role]);
  
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };
  
  const hasAnyRole = (rolesToCheck: string[]): boolean => {
    return rolesToCheck.some(role => roles.includes(role));
  };
  
  const isEmergencyService = (): boolean => {
    return hasAnyRole(['leo', 'dispatch', 'ems', 'fire', 'admin']);
  };
  
  const isCivilian = (): boolean => {
    return roles.length === 0 || roles.every(role => !['leo', 'dispatch', 'ems', 'fire', 'admin'].includes(role));
  };
  
  return {
    getUserRoles,
    hasRole,
    hasAnyRole,
    isEmergencyService,
    isCivilian,
    roles
  };
}; 