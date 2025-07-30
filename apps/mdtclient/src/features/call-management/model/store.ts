import { create } from 'zustand';
import { Call911, DispatchStatus, DispatchApi } from '@/entities/dispatch';
import { CallManagementStore } from './types';

export const useCallManagementStore = create<CallManagementStore>((set, get) => ({
  // State
  calls: [],
  incomingCall: null,
  showIncomingModal: false,
  callResponse: null,
  currentStatus: DispatchStatus.OPERATOR,
  loading: false,
  error: null,

  // Actions
  acceptCall: (callId: string) => {
    set({ callResponse: 'accepted' });
    
    const { calls } = get();
    const updatedCalls = calls.map(call => 
      call.id === callId 
        ? { 
            ...call, 
            status: 'ACCEPTED', 
            assignedDispatcher: 'dispatch_1',
            answeredAt: new Date().toISOString()
          }
        : call
    );
    
    set({ calls: updatedCalls });

    // Скрываем модальное окно через 3 секунды
    setTimeout(() => {
      set({ 
        showIncomingModal: false, 
        incomingCall: null, 
        callResponse: null 
      });
    }, 3000);
  },

  rejectCall: (callId: string) => {
    set({ callResponse: 'rejected' });
    
    const { calls } = get();
    const updatedCalls = calls.map(call => 
      call.id === callId 
        ? { ...call, status: 'REJECTED' }
        : call
    );
    
    set({ calls: updatedCalls });

    // Скрываем модальное окно через 2 секунды
    setTimeout(() => {
      set({ 
        showIncomingModal: false, 
        incomingCall: null, 
        callResponse: null 
      });
    }, 2000);
  },

  updateCallStatus: (callId: string, status: Call911['status']) => {
    const { calls } = get();
    const updatedCalls = calls.map(call => 
      call.id === callId ? { ...call, status } : call
    );
    set({ calls: updatedCalls });
  },

  setCurrentStatus: (status: DispatchStatus) => {
    set({ currentStatus: status });
  },

  loadCalls: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await DispatchApi.getCalls911();
      set({ calls: result.items, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки звонков', 
        loading: false 
      });
    }
  },

  createCall: async (callData) => {
    set({ loading: true, error: null });
    
    try {
      const newCall = await DispatchApi.createCall911({
        callerId: callData.callerId,
        callerName: callData.callerName,
        callerPhone: callData.callerPhone,
        location: callData.location,
        description: callData.description,
        priority: callData.priority,
      });
      
      const { calls } = get();
      set({ calls: [newCall, ...calls], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка создания звонка', 
        loading: false 
      });
    }
  },
})); 