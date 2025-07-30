export interface VehicleRegistrationFormData {
    plate: string;
    vin: string;
    model: string;
    owner: string;
    color: string;
    equipmentLevels: string;
    registrationStatus: string;
    insuranceStatus: string;
    inspectionStatus: string;
    taxStatus: string;
}

export interface VehicleRegistrationState {
    formData: VehicleRegistrationFormData;
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

export interface VehicleRegistrationActions {
    updateFormData: (data: Partial<VehicleRegistrationFormData>) => void;
    resetForm: () => void;
    submitForm: () => Promise<void>;
    generateVIN: () => void;
}