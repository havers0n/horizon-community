// @ts-nocheck - TODO: Remove after major refactoring is complete
import { create } from 'zustand';

type MdtView = 'dashboard' | 'module';

interface MdtPortalState {
  currentView: MdtView;
  activeModule: string | null; // ID модуля для module view
  setView: (view: MdtView, moduleId?: string) => void;
  goToDashboard: () => void;
  goToModule: (moduleId: string) => void;
}

export const useMdtPortalStore = create<MdtPortalState>((set) => ({
  currentView: 'dashboard',
  activeModule: undefined,
  setView: (view, moduleId = undefined) => set({ currentView: view, activeModule: moduleId }),
  goToDashboard: () => set({ currentView: 'dashboard', activeModule: undefined }),
  goToModule: (moduleId) => set({ currentView: 'module', activeModule: moduleId }),
}));