import { create } from 'zustand';

type MdtView = 'dashboard' | 'module';

interface MdtPortalState {
  currentView: MdtView;
  activeModule: string | null; // ID модуля для module view
  setView: (view: MdtView, moduleId?: string | null) => void;
  goToDashboard: () => void;
  goToModule: (moduleId: string) => void;
}

export const useMdtPortalStore = create<MdtPortalState>((set) => ({
  currentView: 'dashboard',
  activeModule: null,
  setView: (view, moduleId = null) => set({ currentView: view, activeModule: moduleId }),
  goToDashboard: () => set({ currentView: 'dashboard', activeModule: null }),
  goToModule: (moduleId) => set({ currentView: 'module', activeModule: moduleId }),
}));