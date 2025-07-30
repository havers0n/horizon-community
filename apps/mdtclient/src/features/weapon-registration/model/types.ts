export interface WeaponRegistrationFormData {
    weaponType: string;
    serialNumber: string;
    model: string;
    caliber: string;
    ownerName: string;
    licenseNumber: string;
}

export interface WeaponRegistrationState {
    formData: WeaponRegistrationFormData;
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

export interface WeaponRegistrationActions {
    updateFormData: (data: Partial<WeaponRegistrationFormData>) => void;
    resetForm: () => void;
    submitForm: () => Promise<void>;
}