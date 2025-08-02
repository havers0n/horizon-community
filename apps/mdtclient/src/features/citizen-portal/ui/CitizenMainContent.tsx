import React from 'react';
import { useCitizenPortalStore } from '../model/store';
import { CitizenDashboard } from './CitizenDashboard';
import { ProfileView } from './ProfileView';
import { PropertyView } from './PropertyView';
import { MDTView } from './MDTView';
import { ReferenceView } from './ReferenceView';

export const CitizenMainContent: React.FC = () => {
  const { currentView, currentSubView, activeCharacter } = useCitizenPortalStore();

  if (!activeCharacter) return null;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <CitizenDashboard />;
      case 'profile':
        return <ProfileView subView={currentSubView} />;
      case 'property':
        return <PropertyView subView={currentSubView} />;
      case 'mdt':
        return <MDTView subView={currentSubView} />;
      case 'reference':
        return <ReferenceView subView={currentSubView} />;
      default:
        return <CitizenDashboard />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-950">
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}; 