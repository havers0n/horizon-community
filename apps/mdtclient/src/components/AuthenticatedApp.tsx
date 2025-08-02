import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCoreNavigationStore } from '@/shared/model/coreNavigationStore';
import { useUserRoles } from '@/shared/hooks/useUserRoles';
import { CoreSwitcher } from '@/shared/ui/CoreSwitcher';
import { RoleDebugPanel } from '@/shared/ui/RoleDebugPanel';
import { CivilCorePortal } from '@/widgets/civil-core-portal';
import { EmergencyCorePortal } from '@/widgets/emergency-core-portal';
import { CitizenPortal } from '@/features/citizen-portal/ui/CitizenPortal';
import { useRenderCounter, checkDependenciesStability } from '@/shared/utils/debugUtils';

export const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  const { roles } = useUserRoles();
  const { 
    activeCore, 
    resetToDefaultCore 
  } = useCoreNavigationStore();
  
  // Отслеживаем, была ли уже выполнена инициализация
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const lastRolesHash = useRef<string>('');

  // Отслеживаем количество рендеров для отладки
  const renderCount = useRenderCounter('AuthenticatedApp', [user?.id, roles, activeCore]);
  
  // Проверяем стабильность зависимостей
  checkDependenciesStability([user?.id, roles, activeCore], 'AuthenticatedApp');

  // Стабилизируем функцию инициализации
  const initializeCore = useCallback(() => {
    if (!user || roles.length === 0) return;
    
    const currentUserId = user.id;
    const currentRolesHash = roles.join(',');
    
    // Проверяем, изменились ли пользователь или роли
    const userChanged = lastUserId.current !== currentUserId;
    const rolesChanged = lastRolesHash.current !== currentRolesHash;
    
    if (!isInitialized.current || userChanged || rolesChanged) {
      console.log('Initializing default core for user:', user.username, 'with roles:', roles);
      console.log('Initialization reason:', {
        notInitialized: !isInitialized.current,
        userChanged,
        rolesChanged,
        renderCount
      });
      
      resetToDefaultCore(roles);
      
      // Обновляем отслеживание
      isInitialized.current = true;
      lastUserId.current = currentUserId;
      lastRolesHash.current = currentRolesHash;
    }
  }, [user, roles, resetToDefaultCore, renderCount]);

  // Инициализируем ядро по умолчанию только при изменении пользователя или ролей
  useEffect(() => {
    // Дополнительная защита от слишком частых вызовов
    if (renderCount > 20) {
      console.error('[AuthenticatedApp] Too many renders detected! Stopping initialization.');
      return;
    }
    
    initializeCore();
  }, [user?.id, roles.join(',')]); // Используем стабильные зависимости

  console.log('AuthenticatedApp render:', {
    user: user?.username,
    activeCore,
    roles,
    isInitialized: isInitialized.current,
    renderCount
  });

  // Рендерим соответствующее ядро
  const renderActiveCore = () => {
    switch (activeCore) {
      case 'civil':
        return <CivilCorePortal />;
      case 'emergency':
        return <EmergencyCorePortal />;
      case 'citizen-portal':
        return <CitizenPortal />;
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">
                Ошибка загрузки ядра
              </h2>
              <p className="text-slate-400">
                Не удалось определить активное ядро
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 relative overflow-hidden">
      {/* CoreSwitcher - всегда поверх контента */}
      <div className="absolute top-4 left-4 z-50">
        <CoreSwitcher />
      </div>

      {/* Панель отладки ролей - только в режиме разработки */}
      {process.env.NODE_ENV === 'development' && (
        <RoleDebugPanel />
      )}

      {/* Основной контент - занимает весь экран */}
      <div className="h-full w-full">
        {renderActiveCore()}
      </div>
    </div>
  );
}; 