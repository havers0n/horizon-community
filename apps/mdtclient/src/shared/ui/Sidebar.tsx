// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { Department } from '@/shared/types';

interface SidebarProps {
  department: Department;
  activeModuleId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  department,
  activeModuleId
}) => {
  const { selectModule } = useNavigationStore();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Department Modules */}
        <Card variant="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-100">
              Модули {department.name}
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
    </div>
  );
};
