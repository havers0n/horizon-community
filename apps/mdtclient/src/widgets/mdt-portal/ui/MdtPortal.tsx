import React from 'react';
import { useMdtPortalStore } from '../model/store';
import { MdtDashboardWidget } from '@/widgets/mdt-dashboard';
import { MdtSidebar } from './MdtSidebar';
import { ModuleRenderer } from './ModuleRenderer';

interface MdtPortalProps {
  onBackToModules?: () => void;
}

export const MdtPortal: React.FC<MdtPortalProps> = ({ onBackToModules }) => {
  const { currentView, activeModule } = useMdtPortalStore();

  return (
    <div className="flex h-screen bg-transparent">
      {/* КОЛОНКА 1: Навигация (Всегда на месте) */}
      <MdtSidebar onBackToModules={onBackToModules} />
      
      {/* КОЛОНКА 2: Динамический контент */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'dashboard' && <MdtDashboardWidget />}
        {currentView === 'module' && activeModule && <ModuleRenderer moduleId={activeModule} />}
      </main>
    </div>
  );
};
