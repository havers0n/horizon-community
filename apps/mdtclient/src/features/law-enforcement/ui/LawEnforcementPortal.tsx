import React, { useState } from 'react';
import { LawControlPanel } from './LawControlPanel';

export const LawEnforcementPortal: React.FC = () => {
  const [activeView, setActiveView] = useState('person-search');

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <div className="h-full">
      <LawControlPanel 
        activeView={activeView}
        onViewChange={handleViewChange}
      />
    </div>
  );
};
