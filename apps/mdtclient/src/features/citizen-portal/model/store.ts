import { create } from 'zustand';
import type { Character } from '@/shared/types';
import type { CitizenPortalState } from './types';

interface CitizenPortalStore extends CitizenPortalState {
  setActiveCharacter: (character: Character) => void;
  setCurrentView: (view: CitizenPortalState['currentView']) => void;
  setCurrentSubView: (subView: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: CitizenPortalState = {
  activeCharacter: null,
  currentView: 'dashboard',
  currentSubView: '',
  isLoading: false,
  error: null,
};

export const useCitizenPortalStore = create<CitizenPortalStore>((set) => ({
  ...initialState,

  setActiveCharacter: (character) => set({ activeCharacter: character }),

  setCurrentView: (view) => set({ currentView: view, currentSubView: '' }),

  setCurrentSubView: (subView) => set({ currentSubView: subView }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
})); 