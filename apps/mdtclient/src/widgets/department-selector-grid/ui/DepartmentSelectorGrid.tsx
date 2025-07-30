import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { Department } from '@/shared/types';

interface DepartmentSelectorGridProps {
  departments: Department[];
  onSelectDepartment: (departmentId: string) => void;
}

export const DepartmentSelectorGrid: React.FC<DepartmentSelectorGridProps> = ({
  departments,
  onSelectDepartment
}) => {
  console.log('DepartmentSelectorGrid rendering:', {
    departmentsCount: departments.length,
    departments: departments.map(d => ({ id: d.id, name: d.name }))
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Заголовок */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Панель управления MDT
          </h1>
          <p className="text-xl text-slate-300">
            Выберите модуль для работы с системой
          </p>
        </div>
        
        {/* Сетка департаментов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((department) => {
            const Icon = department.modules[0]?.icon; // Берем иконку первого модуля как иконку департамента
            
            return (
              <Card 
                key={department.id} 
                className="cursor-pointer hover:bg-slate-800/60 transition-colors border border-blue-500/20"
                onClick={() => onSelectDepartment(department.id)}
              >
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Иконка департамента */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-600/60 flex items-center justify-center border border-blue-400/20">
                        {Icon && <Icon className="h-6 w-6 text-white" />}
                      </div>
                    </div>
                    
                    {/* Информация о департаменте */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {department.name}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {department.modules.length} модулей доступно
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 
