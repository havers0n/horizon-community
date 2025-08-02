// @ts-nocheck - TODO: Remove after major refactoring is complete
import { create } from 'zustand';
import { EmsCall } from '@/shared/types';
import { EmsApi } from '@/entities/ems/api';

interface EmsCallManagementState {
  calls: EmsCall[];
  isLoading: boolean;
  error: string | null;
  selectedCall: EmsCall | null;
}

interface EmsCallManagementActions {
  loadCalls: () => Promise<void>;
  loadActiveCalls: () => Promise<void>;
  assignCall: (callId: string, unitId: string) => Promise<void>;
  completeCall: (callId: string) => Promise<void>;
  selectCall: (call: EmsCall | null) => void;
  clearError: () => void;
}

type EmsCallManagementStore = EmsCallManagementState & EmsCallManagementActions;

export const useEmsCallManagementStore = create<EmsCallManagementStore>((set, get) => ({
  // State
  calls: [],
  isLoading: false,
  error: null,
  selectedCall: null,

  // Actions
  loadCalls: async () => {
    set({ isLoading: true, error: null });
    try {
      const calls = await EmsApi.getAllCalls();
      set({ calls, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки вызовов', 
        isLoading: false 
      });
    }
  },

  loadActiveCalls: async () => {
    set({ isLoading: true, error: null });
    try {
      const calls = await EmsApi.getActiveCalls();
      set({ calls, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки активных вызовов', 
        isLoading: false 
      });
    }
  },

  assignCall: async (callId: string, unitId: string) => {
    try {
      // В реальном приложении здесь был бы API вызов
      const calls = get().calls.map(call => 
        call.id === callId 
          ? { ...call, assignedUnits: [...call.assignedUnits, unitId], status: 'en_route' as const }
          : call
      );
      set({ calls });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка назначения вызова' 
      });
    }
  },

  completeCall: async (callId: string) => {
    try {
      // В реальном приложении здесь был бы API вызов
      const calls = get().calls.map(call => 
        call.id === callId 
          ? { ...call, status: 'completed' as const }
          : call
      );
      set({ calls });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка завершения вызова' 
      });
    }
  },

  selectCall: (call: EmsCall | null) => {
    set({ selectedCall: call });
  },

  clearError: () => {
    set({ error: null });
  }
})); 