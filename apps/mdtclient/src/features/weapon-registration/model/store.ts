import { create } from 'zustand';
import type { WeaponRegistrationState, WeaponRegistrationActions, WeaponRegistrationFormData } from './types';

const initialFormData: WeaponRegistrationFormData = {
    weaponType: '',
    serialNumber: '',
    model: '',
    caliber: '',
    ownerName: '',
    licenseNumber: '',
};

export const weaponRegistrationStore = create<WeaponRegistrationState & WeaponRegistrationActions>((set, get) => ({
    formData: initialFormData,
    isLoading: false,
    error: null,
    success: null,

    updateFormData: (data: Partial<WeaponRegistrationFormData>) => {
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

    submitForm: async () => {
        const { formData } = get();
        
        set({ isLoading: true, error: null, success: null });
        
        try {
            // Здесь будет API вызов для регистрации оружия
            const newWeapon = {
                id: `weapon_${Date.now()}`,
                ...formData,
                registeredAt: new Date().toISOString(),
            };
            
            // Имитация API вызова
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Оружие зарегистрировано:', newWeapon);
            
            // Сброс формы после успешной регистрации
            get().resetForm();
            set({ success: 'Оружие успешно зарегистрировано!' });
            
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Ошибка при регистрации оружия' });
        } finally {
            set({ isLoading: false });
        }
    },
}));