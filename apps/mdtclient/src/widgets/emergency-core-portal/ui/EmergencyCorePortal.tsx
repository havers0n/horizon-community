import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCoreNavigationStore } from '@/shared/model/coreNavigationStore';
import { DepartmentSelectorGrid } from '@/widgets/department-selector-grid';
import { MdtPortal } from '@/widgets/mdt-portal';
import { DispatchPortal } from '@/widgets/dispatch-portal';
import { EmsPortal } from '@/widgets/ems-portal';
import { FDPortalWidget } from '@/widgets/fd-portal';
import { Button } from '@/shared/ui/atoms/Button';

export const EmergencyCorePortal: React.FC = () => {
  const { selectedDepartmentId, selectDepartment } = useCoreNavigationStore();

  const handleBackToDepartments = () => {
    selectDepartment('');
  };

  // Если департамент не выбран, показываем селектор
  if (!selectedDepartmentId) {
    return <DepartmentSelectorGrid />;
  }

  // Рендерим соответствующий портал в зависимости от выбранного департамента
  const renderDepartmentPortal = () => {
    switch (selectedDepartmentId) {
      case 'law-enforcement':
        return <MdtPortal />;
      case 'dispatch':
        return <DispatchPortal onBackToModules={handleBackToDepartments} />;
      case 'ems':
        return <EmsPortal />;
      case 'fire':
        return <FDPortalWidget />;
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">
                Департамент не найден
              </h2>
              <p className="text-slate-400 mb-4">
                Выбранный департамент не поддерживается
              </p>
              <Button onClick={handleBackToDepartments}>
                Вернуться к выбору департаментов
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок с кнопкой "Назад" */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToDepartments}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            К выбору департаментов
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-white">
              {getDepartmentName(selectedDepartmentId)}
            </h1>
            <p className="text-sm text-slate-400">
              Специализированный портал
            </p>
          </div>
        </div>
      </div>

      {/* Контент портала */}
      <div className="flex-1 overflow-hidden">
        {renderDepartmentPortal()}
      </div>
    </div>
  );
};

// Вспомогательная функция для получения названия департамента
const getDepartmentName = (departmentId: string): string => {
  const departmentNames: Record<string, string> = {
    'law-enforcement': 'Правоохранительные органы',
    'dispatch': 'Диспетчерская служба',
    'ems': 'Скорая помощь',
    'fire': 'Пожарная служба'
  };
  
  return departmentNames[departmentId] || 'Неизвестный департамент';
}; 