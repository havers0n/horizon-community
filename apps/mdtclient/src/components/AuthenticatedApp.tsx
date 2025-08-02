import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { ModuleContent } from '@/app/components/ModuleContent';

export const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  const { 
    activeDepartmentId, 
    activeModuleId, 
    selectDepartment,
    getActiveDepartment
  } = useNavigationStore();

  // Автоматически устанавливаем департамент при первом рендере
  useEffect(() => {
    if (!activeDepartmentId && user) {
      // Определяем департамент на основе роли пользователя
      let defaultDepartmentId = 'civil';
      
      if (user.roles?.includes('admin')) {
        defaultDepartmentId = 'admin';
      } else if (user.roles?.includes('leo')) {
        defaultDepartmentId = 'law-enforcement';
      } else if (user.roles?.includes('dispatch')) {
        defaultDepartmentId = 'dispatch';
      } else if (user.roles?.includes('ems')) {
        defaultDepartmentId = 'ems';
      } else if (user.roles?.includes('fire')) {
        defaultDepartmentId = 'fire';
      }
      
      console.log('Setting default department:', defaultDepartmentId);
      selectDepartment(defaultDepartmentId);
    }
  }, [user, activeDepartmentId, selectDepartment]);

  const activeDepartment = getActiveDepartment();

  console.log('AuthenticatedApp render:', {
    user: user?.username,
    activeDepartmentId,
    activeModuleId,
    activeDepartment: activeDepartment?.name
  });

  return (
    <div className="h-screen flex bg-transparent">
      <AppSidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <AppHeader />
        <main className="flex-1 p-4 overflow-y-auto">
          <ModuleContent />
        </main>
      </div>
    </div>
  );
}; 