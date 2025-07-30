import { create } from 'zustand';
import type { EmergencyCallsState, EmergencyCallsActions, EmergencyCallFormData, EmergencyCall } from './types';

const initialFormData: EmergencyCallFormData = {
    location: '',
    description: '',
    priority: 'medium',
    callerName: '',
    phoneNumber: '',
};

export const emergencyCallsStore = create<EmergencyCallsState & EmergencyCallsActions>((set, get) => ({
    calls: [],
    formData: initialFormData,
    isLoading: false,
    error: null,
    success: null,

    updateFormData: (data: Partial<EmergencyCallFormData>) => {
        set((state) => ({
            formData: { ...state.formData, ...data }
        }));
    },

    resetForm: () => {
        set({
            formData: initialFormData,
            error: null,
            success: null,
        });
    },

    submitCall: async () => {
        const { formData } = get();
        
        set({ isLoading: true, error: null, success: null });
        
        try {
            // Здесь будет API вызов для создания вызова 911
            const newCall: EmergencyCall = {
                id: `call_${Date.now()}`,
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'pending',
            };
            
            // Имитация API вызова
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Вызов 911 создан:', newCall);
            
            // Добавляем вызов в список
            set((state) => ({
                calls: [newCall, ...state.calls]
            }));
            
            // Сброс формы после успешного создания
            get().resetForm();
            set({ success: 'Вызов 911 успешно отправлен!' });
            
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Ошибка при отправке вызова 911' });
        } finally {
            set({ isLoading: false });
        }
    },

    updateCallStatus: (callId: string, status: EmergencyCall['status']) => {
        set((state) => ({
            calls: state.calls.map(call => 
                call.id === callId ? { ...call, status } : call
            )
        }));
    },

    deleteCall: (callId: string) => {
        set((state) => ({
            calls: state.calls.filter(call => call.id !== callId)
        }));
    },
}));