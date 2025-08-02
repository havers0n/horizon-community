import React from 'react';
import { Sidebar } from '@/shared/ui/Sidebar';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { useAuth } from '@/shared/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';

export const AppSidebar: React.FC = () => {
  const { logout } = useAuth();
  const { 
    activeDepartmentId, 
    activeModuleId, 
    selectDepartment, 
    selectModule,
    getActiveDepartment,
    getAvailableDepartments 
  } = useNavigationStore();

  const activeDepartment = getActiveDepartment();
  const availableDepartments = getAvailableDepartments();

  const handleLogout = () => {
    logout();
  };

  if (!activeDepartment) {
    return (
      <aside className="w-60 bg-slate-900/80 backdrop-blur-md border-r border-secondary-700/50 p-4 flex flex-col fixed h-full z-20">
        <div className="text-white text-center flex-grow">
          <h3 className="text-lg font-semibold mb-4">Выберите департамент</h3>
          <div className="space-y-2">
            {availableDepartments.map(dept => (
              <Button
                key={dept.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => selectDepartment(dept.id)}
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-700 pt-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-slate-900/80 backdrop-blur-md border-r border-secondary-700/50 fixed h-full z-20">
      <Sidebar 
        department={activeDepartment}
        activeModuleId={activeModuleId}
      />
    </aside>
  );
}; 