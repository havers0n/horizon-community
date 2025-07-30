import React from 'react';
import { DashboardProvider } from './DashboardProvider';
import { MdtDashboardWidget } from './MdtDashboardWidget';

export const DashboardDemo: React.FC = () => {
  return (
    <DashboardProvider>
      <div className="h-screen bg-secondary-900">
        <MdtDashboardWidget />
      </div>
    </DashboardProvider>
  );
};
