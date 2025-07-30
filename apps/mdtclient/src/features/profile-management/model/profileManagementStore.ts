import { create } from 'zustand';
import type { 
    ProfileManagementState, 
    ProfileManagementActions, 
    ProfileUpdateData, 
    CitizenProfile 
} from './types';

// Mock profile data
const MOCK_PROFILE: CitizenProfile = {
    id: 'citizen_1',
    firstName: 'Иван',
    lastName: 'Петров',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    nationality: 'Россия',
    address: 'ул. Ленина, 123, кв. 45, Los Santos',
    phone: '+1 (555) 123-4567',
    email: 'ivan.petrov@email.com',
    occupation: 'Инженер',
    emergencyContact: {
        name: 'Мария Петрова',
        phone: '+1 (555) 987-6543',
        relationship: 'Жена',
    },
    medicalInfo: {
        bloodType: 'A+',
        allergies: ['Пенициллин', 'Пыльца'],
        chronicDiseases: ['Астма'],
        medications: ['Ингалятор'],
    },
    legalRecords: {
        fines: [
            {
                id: 'fine_1',
                amount: 150,
                reason: 'Превышение скорости',
                date: '2024-01-10',
                officer: 'Офицер Джонсон',
                location: 'Highway 101',
            }
        ],
        warnings: [],
        arrests: [],
    },
    vehicles: ['vehicle_1', 'vehicle_2'],
    weapons: ['weapon_1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
};

type ProfileManagementStore = ProfileManagementState & ProfileManagementActions;

export const profileManagementStore = create<ProfileManagementStore>((set, get) => ({
    // State
    profile: null,
    isLoading: false,
    error: null,
    showEditModal: false,
    isEditing: false,

    // Actions
    loadProfile: async (citizenId: string) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({ 
                profile: MOCK_PROFILE,
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при загрузке профиля',
                isLoading: false 
            });
        }
    },

    updateProfile: async (data: ProfileUpdateData) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const currentProfile = get().profile;
            if (!currentProfile) {
                throw new Error('Профиль не загружен');
            }

            const updatedProfile: CitizenProfile = {
                ...currentProfile,
                ...data,
                updatedAt: new Date().toISOString(),
            };

            set({ 
                profile: updatedProfile,
                isLoading: false,
                showEditModal: false,
                isEditing: false,
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при обновлении профиля',
                isLoading: false 
            });
        }
    },

    setShowEditModal: (show: boolean) => {
        set({ showEditModal: show });
    },

    setIsEditing: (editing: boolean) => {
        set({ isEditing: editing });
    },

    resetError: () => {
        set({ error: null });
    },
}));