export interface ReportCreationFormData {
  // Основная информация
  citizenName: string;
  incidentAddress: string;
  incidentTime: string;
  incidentType: string;
  article: string;
  sanctionType: string;
  description: string;
  
  // Дополнительная информация
  suspectVehicle: string;
  seizedItems: string;
  suspectWeapon: string;
  additionalFlags: string[];
}

export interface ReportCreationState {
  formData: ReportCreationFormData;
  currentStep: number;
  showForm: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ReportCreationActions {
  setFormData: (data: Partial<ReportCreationFormData>) => void;
  setCurrentStep: (step: number) => void;
  setShowForm: (show: boolean) => void;
  createReport: (report: import('@roleplay-identity/db-types').LawReports) => void;
  clearForm: () => void;
  clearError: () => void;
}