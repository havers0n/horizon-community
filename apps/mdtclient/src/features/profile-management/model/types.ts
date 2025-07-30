export interface CitizenProfile {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    address: string;
    phone: string;
    email: string;
    occupation: string;
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    medicalInfo: {
        bloodType: string;
        allergies: string[];
        chronicDiseases: string[];
        medications: string[];
    };
    legalRecords: {
        fines: any[];
        warnings: any[];
        arrests: any[];
    };
    vehicles: string[];
    weapons: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
    address?: string;
    phone?: string;
    email?: string;
    occupation?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    medicalInfo?: {
        bloodType: string;
        allergies: string[];
        chronicDiseases: string[];
        medications: string[];
    };
}

export interface ProfileManagementState {
    profile: CitizenProfile | null;
    isLoading: boolean;
    error: string | null;
    showEditModal: boolean;
    isEditing: boolean;
}

export interface ProfileManagementActions {
    loadProfile: (citizenId: string) => Promise<void>;
    updateProfile: (data: ProfileUpdateData) => Promise<void>;
    setShowEditModal: (show: boolean) => void;
    setIsEditing: (editing: boolean) => void;
    resetError: () => void;
}