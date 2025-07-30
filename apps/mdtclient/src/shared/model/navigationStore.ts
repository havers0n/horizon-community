import { create } from 'zustand';
import { departments } from '@/data/departments';
import { Department, MDTModule } from '@/shared/types';

interface NavigationState {
  // Состояние
  activeDepartmentId: string | null;
  activeModuleId: string | null;
  
  // Действия
  selectDepartment: (departmentId: string) => void;
  selectModule: (moduleId: string) => void;
  resetNavigation: () => void;
  
  // Геттеры
  getActiveDepartment: () => Department | undefined;
  getActiveModule: () => MDTModule | undefined;
  getAvailableDepartments: () => Department[];
}

export const useNavigationStore = create<NavigationState>((set, get) => {
  console.log('NavigationStore initializing with departments:', departments.length);
  
  return {
    // Начальное состояние
    activeDepartmentId: null,
    activeModuleId: null,
    
    // Действия
    selectDepartment: (departmentId: string) => {
      console.log('selectDepartment called with:', departmentId);
      const department = departments.find(dept => dept.id === departmentId);
      if (department) {
        set({ 
          activeDepartmentId: departmentId,
          activeModuleId: null // Сбрасываем модуль при смене департамента
        });
        console.log('Department selected:', department.name);
      } else {
        console.error('Department not found:', departmentId);
      }
    },
    
    selectModule: (moduleId: string) => {
      console.log('selectModule called with:', moduleId);
      set({ activeModuleId: moduleId });
    },
    
    resetNavigation: () => {
      console.log('resetNavigation called');
      set({ 
        activeDepartmentId: null,
        activeModuleId: null 
      });
    },
    
    // Геттеры
    getActiveDepartment: () => {
      const { activeDepartmentId } = get();
      const department = activeDepartmentId ? departments.find(dept => dept.id === activeDepartmentId) : undefined;
      console.log('getActiveDepartment:', department?.name || 'none');
      return department;
    },
    
    getActiveModule: () => {
      const { activeDepartmentId, activeModuleId } = get();
      if (!activeDepartmentId || !activeModuleId) return undefined;
      
      const department = departments.find(dept => dept.id === activeDepartmentId);
      const module = department?.modules.find(module => module.id === activeModuleId);
      console.log('getActiveModule:', module?.name || 'none');
      return module;
    },
    
    getAvailableDepartments: () => {
      console.log('getAvailableDepartments called, returning:', departments.length, 'departments');
      return departments;
    }
  };
}); 