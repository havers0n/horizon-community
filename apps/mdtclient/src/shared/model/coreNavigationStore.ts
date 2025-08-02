import { create } from 'zustand';

export type CoreType = 'civil' | 'emergency' | 'citizen-portal';

export interface CoreNavigationState {
  // Состояние
  activeCore: CoreType;
  selectedDepartmentId: string | null;
  
  // Действия
  switchCore: (core: CoreType) => void;
  selectDepartment: (departmentId: string) => void;
  resetToDefaultCore: (userRoles?: string[]) => void;
  
  // Геттеры
  getActiveCore: () => CoreType;
  getSelectedDepartmentId: () => string | null;
  canAccessCore: (core: CoreType, userRoles?: string[]) => boolean;
}

export const useCoreNavigationStore = create<CoreNavigationState>((set, get) => {
  const determineDefaultCore = (userRoles: string[] = []): CoreType => {
    // Если у пользователя есть роли экстренных служб, по умолчанию Emergency Core
    if (userRoles.some(role => ['leo', 'dispatch', 'ems', 'fire', 'admin'].includes(role))) {
      return 'emergency';
    }
    
    // Иначе Civil Core
    return 'civil';
  };

  const canAccessCore = (core: CoreType, userRoles: string[] = []): boolean => {
    if (core === 'emergency') {
      // Emergency Core доступен только для экстренных служб
      return userRoles.some(role => ['leo', 'dispatch', 'ems', 'fire', 'admin'].includes(role));
    }
    
    // Civil Core и Citizen Portal доступны всем
    return true;
  };

  return {
    // Начальное состояние
    activeCore: 'civil', // По умолчанию гражданское ядро
    selectedDepartmentId: null,
    
    // Действия
    switchCore: (core: CoreType) => {
      const currentState = get();
      
      // Проверяем, не пытаемся ли мы переключиться на то же ядро
      if (currentState.activeCore === core) {
        console.log(`Already on ${core} core, skipping switch`);
        return;
      }
      
      // Получаем роли из localStorage как fallback
      let userRoles: string[] = [];
      try {
        const userData = localStorage.getItem('mdt-user');
        if (userData) {
          const user = JSON.parse(userData);
          userRoles = user.roles || [];
        }
      } catch (error) {
        console.error('Error getting user roles:', error);
      }
      
      if (!canAccessCore(core, userRoles)) {
        console.warn(`User cannot access ${core} core`);
        return;
      }
      
      console.log(`Switching to ${core} core`);
      set({ 
        activeCore: core,
        selectedDepartmentId: null // Сбрасываем выбранный департамент при смене ядра
      });
    },
    
    selectDepartment: (departmentId: string) => {
      const currentState = get();
      
      // Проверяем, не пытаемся ли мы выбрать тот же департамент
      if (currentState.selectedDepartmentId === departmentId) {
        console.log(`Department ${departmentId} already selected, skipping`);
        return;
      }
      
      console.log(`Selecting department: ${departmentId}`);
      set({ selectedDepartmentId: departmentId });
    },
    
    resetToDefaultCore: (userRoles: string[] = []) => {
      const currentState = get();
      const defaultCore = determineDefaultCore(userRoles);
      
      // Проверяем, нужно ли действительно менять состояние
      if (currentState.activeCore === defaultCore && currentState.selectedDepartmentId === null) {
        console.log(`Already on default core: ${defaultCore}, skipping reset`);
        return;
      }
      
      console.log(`Resetting to default core: ${defaultCore} for roles:`, userRoles);
      set({ 
        activeCore: defaultCore,
        selectedDepartmentId: null
      });
    },
    
    // Геттеры
    getActiveCore: () => get().activeCore,
    getSelectedDepartmentId: () => get().selectedDepartmentId,
    canAccessCore
  };
}); 