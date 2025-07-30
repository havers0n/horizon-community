import React, { useEffect } from 'react';
import { useDashboardRealTime, useDashboardActions } from '../model';

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  // Инициализируем Real-Time обновления
  useDashboardRealTime();

  // Получаем действия для инициализации
  const { initializeDashboard } = useDashboardActions();

  // Инициализируем дашборд при монтировании провайдера
  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  return <>{children}</>;
};
