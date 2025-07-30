import { create } from 'zustand';
import type { VehicleRegistrationState, VehicleRegistrationActions, VehicleRegistrationFormData } from './types';

const initialFormData: VehicleRegistrationFormData = {
    plate: '',
    vin: '',
    model: '',
    owner: '',
    color: '',
    equipmentLevels: '',
    registrationStatus: '',
    insuranceStatus: '',
    inspectionStatus: '',
    taxStatus: '',
};

export const vehicleRegistrationStore = create<VehicleRegistrationState & VehicleRegistrationActions>((set, get) => ({
    formData: initialFormData,
    isLoading: false,
    error: null,
    success: null,

    updateFormData: (data: Partial<VehicleRegistrationFormData>) => {
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

    generateVIN: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let vin = '';
        for (let i = 0; i < 17; i++) {
            vin += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        set((state) => ({
            formData: { ...state.formData, vin }
        }));
    },

    submitForm: async () => {
        const { formData } = get();
        
        set({ isLoading: true, error: null, success: null });
        
        try {
            // Здесь будет API вызов для регистрации ТС
            const newVehicle = {
                id: `veh_${Date.now()}`,
                ownerId: 'cit_1',
                plate: formData.plate,
                vin: formData.vin,
                model: formData.model,
                color: formData.color,
                registration: formData.registrationStatus || 'valid',
                insurance: formData.insuranceStatus || 'valid',
            };
            
            // Имитация API вызова
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Транспортное средство зарегистрировано:', newVehicle);
            
            // Сброс формы после успешной регистрации
            get().resetForm();
            set({ success: 'Транспортное средство успешно зарегистрировано!' });
            
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Ошибка при регистрации транспортного средства' });
        } finally {
            set({ isLoading: false });
        }
    },
}));