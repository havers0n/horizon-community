import React from 'react';
import { useUI } from '@/shared/contexts/UIContext';
import { departments, Department } from '../DepartmentSelector';
import { OfficerDashboardWidget } from '@/widgets/officer-dashboard';
import { CitizenPortalNew } from '@/widgets/citizen-portal';
import { EmsPortal } from '@/widgets/ems-portal';
import { DispatchPortal } from '@/widgets/dispatch-portal';
import { FDPortalWidget } from '@/widgets/fd-portal';

interface DepartmentModulesProps {
  className?: string;
}

export const DepartmentModules: React.FC<DepartmentModulesProps> = ({ className }) => {
  const { currentDepartment } = useUI();

  const handleBackToModules = () => {
    // Логика возврата к модулям
    console.log('Back to modules');
  };

  const renderDepartmentModule = () => {
    switch (currentDepartment) {
      case 'pd':
        return <OfficerDashboardWidget />;
      case 'cd':
        return <CitizenPortalNew />;
      case 'md':
        return <EmsPortal />;
      case 'dispatch':
        return <DispatchPortal onBackToModules={handleBackToModules} />;
      case 'fd':
        return <FDPortalWidget />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Выберите департамент для начала работы</p>
          </div>
        );
    }
  };

  const selectedDept = departments.find(dept => dept.id === currentDepartment);

  return (
    <div className={`h-full flex flex-col ${className || ''}`}>
      {/* Заголовок департамента */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
        {selectedDept && (
          <>
            <selectedDept.icon className={`h-6 w-6 ${selectedDept.color}`} />
            <div>
              <h1 className="text-lg font-semibold text-white">{selectedDept.name}</h1>
              <p className="text-sm text-slate-400">Панель управления</p>
            </div>
          </>
        )}
      </div>

      {/* Контент департамента */}
      <div className="flex-1 overflow-hidden">
        {renderDepartmentModule()}
      </div>
    </div>
  );
}; 
