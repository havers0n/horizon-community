import React from 'react';
import { OfficerStatusPanel } from './OfficerStatusPanel';
import { ActiveCallsWidget } from './ActiveCallsWidget';
import { BolosWidget } from './BolosWidget';

export const OfficerDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Основная панель статуса офицера */}
      <div className="flex-1">
        <OfficerStatusPanel />
      </div>
      
      {/* Дополнительные виджеты */}
      <div className="space-y-4">
        <ActiveCallsWidget />
        <BolosWidget />
      </div>
    </div>
  );
};
