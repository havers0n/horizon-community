import { create } from 'zustand';
import type { CitizenRegistrationState, CitizenRegistrationActions, CitizenRegistrationFormData, LegalRecord } from './types';

const initialFormData: CitizenRegistrationFormData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    height: '',
    weight: '',
    occupation: '',
    phoneNumber: '',
    additionalInfo: '',
    hairColor: '',
    ssn: '',
    ethnicity: '',
    eyeColor: '',
    postalCode: '',
    driverLicense: '',
    driverLicenseCategories: '',
    flightLicense: '',
    flightLicenseCategories: '',
    watercraftLicense: '',
    watercraftLicenseCategories: '',
    fishingLicense: '',
    fishingLicenseCategories: '',
    huntingLicense: '',
    huntingLicenseCategories: '',
    weaponLicense: '',
    weaponLicenseCategories: '',
    otherLicenseCategories: '',
    previousRecords: [],
    diseases: [],
    chronicDiseases: [],
    allergies: '',
    bloodType: '',
    rhFactor: '',
    surgeries: '',
    implants: '',
};

export const citizenRegistrationStore = create<CitizenRegistrationState & CitizenRegistrationActions>((set, get) => ({
    currentPage: 1,
    formData: initialFormData,
    isLoading: false,
    error: null,
    showFineModal: false,
    showWarningModal: false,
    showArrestModal: false,

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
    },

    updateFormData: (data: Partial<CitizenRegistrationFormData>) => {
        set((state) => ({
            formData: { ...state.formData, ...data }
        }));
    },

    addPreviousRecord: (record: LegalRecord) => {
        set((state) => ({
            formData: {
                ...state.formData,
                previousRecords: [...state.formData.previousRecords, record]
            }
        }));
    },

    removePreviousRecord: (recordId: string) => {
        set((state) => ({
            formData: {
                ...state.formData,
                previousRecords: state.formData.previousRecords.filter(record => record.id !== recordId)
            }
        }));
    },

    toggleDisease: (disease: string) => {
        set((state) => ({
            formData: {
                ...state.formData,
                diseases: state.formData.diseases.includes(disease)
                    ? state.formData.diseases.filter(d => d !== disease)
                    : [...state.formData.diseases, disease]
            }
        }));
    },

    toggleChronicDisease: (disease: string) => {
        set((state) => ({
            formData: {
                ...state.formData,
                chronicDiseases: state.formData.chronicDiseases.includes(disease)
                    ? state.formData.chronicDiseases.filter(d => d !== disease)
                    : [...state.formData.chronicDiseases, disease]
            }
        }));
    },

    setShowFineModal: (show: boolean) => {
        set({ showFineModal: show });
    },

    setShowWarningModal: (show: boolean) => {
        set({ showWarningModal: show });
    },

    setShowArrestModal: (show: boolean) => {
        set({ showArrestModal: show });
    },

    resetForm: () => {
        set({
            currentPage: 1,
            formData: initialFormData,
            error: null,
            showFineModal: false,
            showWarningModal: false,
            showArrestModal: false,
        });
    },

    submitForm: async () => {
        const { formData } = get();
        
        set({ isLoading: true, error: null });
        
        try {
            // Здесь будет API вызов для создания гражданина
            const newCitizen = {
                id: `cit_${Date.now()}`,
                userId: 'user_1',
                imageUrl: `https://picsum.photos/seed/${Date.now()}/200`,
                ...formData,
            };
            
            // Имитация API вызова
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Гражданин создан:', newCitizen);
            
            // Сброс формы после успешного создания
            get().resetForm();
            
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Ошибка при создании гражданина' });
        } finally {
            set({ isLoading: false });
        }
    },
}));