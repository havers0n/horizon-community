import React from 'react';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { DepartmentSelectorGrid } from '@/widgets/department-selector-grid';
import { MainLayout } from '@/app/layouts/MainLayout';

export const AppRouter: React.FC = () => {
  const { 
    activeDepartmentId, 
    getAvailableDepartments, 
    selectDepartment 
  } = useNavigationStore();

  console.log('AppRouter rendering:', {
    activeDepartmentId,
    availableDepartments: getAvailableDepartments().length
  });

  // Если департамент не выбран - показываем селектор
  if (!activeDepartmentId) {
    console.log('Showing DepartmentSelectorGrid');
    return (
      <DepartmentSelectorGrid 
        departments={getAvailableDepartments()}
        onSelectDepartment={selectDepartment}
      />
    );
  }

  // Если департамент выбран - показываем основной интерфейс
  console.log('Showing MainLayout');
  return <MainLayout />;
}; 
