import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';

// Локальный интерфейс для UI-специфичных данных департамента
interface Department {
  id: string;
  name: string;
  modules: MDTModule[];
}

interface MDTModule {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface SidebarProps {
  department: Department;
  activeModuleId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  department,
  activeModuleId
}) => {
  const { selectModule, resetNavigation } = useNavigationStore();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleResetDepartment = () => {
    resetNavigation();
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-4 space-y-4 flex-grow">
        {/* Department Header */}
        <Card variant="glassmorphism">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-100">
                {department.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDepartment}
                className="h-8 w-8 p-0"
                title="Сменить департамент"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Department Modules */}
        <Card variant="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-100">
              Модули
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {department.modules.map(module => (
                <Button
                  key={module.id}
                  variant={activeModuleId === module.id ? 'default' : 'outline'}
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => selectModule(module.id)}
                >
                  <module.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{module.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{module.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card variant="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-100">Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Активные юниты</span>
                <span className="text-blue-400 font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Открытые дела</span>
                <span className="text-yellow-400 font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Экстренные вызовы</span>
                <span className="text-red-400 font-semibold">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
};
