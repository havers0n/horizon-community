export interface CitizenRegistrationFormData {
    // Основная информация
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address: string;
    gender: string;
    height: string;
    weight: string;
    occupation: string;
    phoneNumber: string;
    additionalInfo: string;
    hairColor: string;
    ssn: string;
    ethnicity: string;
    eyeColor: string;
    postalCode: string;
    
    // Лицензии
    driverLicense: string;
    driverLicenseCategories: string;
    flightLicense: string;
    flightLicenseCategories: string;
    watercraftLicense: string;
    watercraftLicenseCategories: string;
    fishingLicense: string;
    fishingLicenseCategories: string;
    huntingLicense: string;
    huntingLicenseCategories: string;
    weaponLicense: string;
    weaponLicenseCategories: string;
    otherLicenseCategories: string;
    
    // Предыдущие записи
    previousRecords: LegalRecord[];
    
    // Медицинская информация
    diseases: string[];
    chronicDiseases: string[];
    allergies: string;
    bloodType: string;
    rhFactor: string;
    surgeries: string;
    implants: string;
}

export interface LegalRecord {
    id: string;
    type: 'Штраф' | 'Письменное предупреждение' | 'Отчёт об аресте';
    description: string;
    date: string;
    reason?: string;
    officer?: string;
    location?: string;
    amount?: string;
    charges?: string;
    jailTime?: string;
    bail?: string;
}

export interface CitizenRegistrationState {
    currentPage: number;
    formData: CitizenRegistrationFormData;
    isLoading: boolean;
    error: string | null;
    showFineModal: boolean;
    showWarningModal: boolean;
    showArrestModal: boolean;
}

export interface CitizenRegistrationActions {
    setCurrentPage: (page: number) => void;
    updateFormData: (data: Partial<CitizenRegistrationFormData>) => void;
    addPreviousRecord: (record: LegalRecord) => void;
    removePreviousRecord: (recordId: string) => void;
    toggleDisease: (disease: string) => void;
    toggleChronicDisease: (disease: string) => void;
    setShowFineModal: (show: boolean) => void;
    setShowWarningModal: (show: boolean) => void;
    setShowArrestModal: (show: boolean) => void;
    resetForm: () => void;
    submitForm: () => Promise<void>;
}