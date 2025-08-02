// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { 
  Shield, 
  Phone, 
  Stethoscope, 
  Flame,
  ArrowLeft
} from 'lucide-react';
import { useCoreNavigationStore } from '@/shared/model/coreNavigationStore';
import { Button } from '@/shared/ui/atoms/Button';

interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const emergencyDepartments: Department[] = [
  {
    id: 'law-enforcement',
    name: 'Правоохранительные органы',
    icon: Shield,
    description: 'Полиция, детективы, спецподразделения',
    color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30'
  },
  {
    id: 'dispatch',
    name: 'Диспетчерская служба',
    icon: Phone,
    description: 'Управление вызовами и координация',
    color: 'from-green-600/20 to-green-800/20 border-green-500/30'
  },
  {
    id: 'ems',
    name: 'Скорая помощь',
    icon: Stethoscope,
    description: 'Медицинская помощь и реанимация',
    color: 'from-red-600/20 to-red-800/20 border-red-500/30'
  },
  {
    id: 'fire',
    name: 'Пожарная служба',
    icon: Flame,
    description: 'Пожарная безопасность и спасательные операции',
    color: 'from-orange-600/20 to-orange-800/20 border-orange-500/30'
  }
];

export const DepartmentSelectorGrid: React.FC = () => {
  const { selectDepartment } = useCoreNavigationStore();

  const handleDepartmentSelect = (departmentId: string) => {
    selectDepartment(departmentId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Ядро экстренных служб
          </h1>
          <p className="text-slate-400">
            Выберите департамент для доступа к специализированному порталу
          </p>
        </div>
      </div>

      {/* Сетка департаментов */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {emergencyDepartments.map((department) => {
            const Icon = department.icon;
            
            return (
              <Button
                key={department.id}
                variant="outline"
                className={`
                  h-32 p-6 text-left bg-gradient-to-br ${department.color}
                  border-2 hover:border-opacity-60 transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  group
                `}
                onClick={() => handleDepartmentSelect(department.id)}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <Icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {department.name}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {department.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Информационная панель */}
      <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Доступно департаментов: {emergencyDepartments.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Все системы активны</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
