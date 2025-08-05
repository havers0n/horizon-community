import { create } from 'zustand';
import { useLawEnforcementStore } from '../../../model/store';
import type { ReportCreationState, ReportCreationActions, ReportCreationFormData } from './types';
import type { LawReports } from '@roleplay-identity/db-types';

type ReportCreationStore = ReportCreationState & ReportCreationActions;

const initialFormData: ReportCreationFormData = {
  citizenName: '',
  incidentAddress: '',
  incidentTime: '',
  incidentType: '',
  article: '',
  sanctionType: '',
  description: '',
  suspectVehicle: '',
  seizedItems: '',
  suspectWeapon: '',
  additionalFlags: []
};

// Адаптер для преобразования формы в тип LawReports
const adaptFormDataToLawReports = (formData: ReportCreationFormData, authorId: string): LawReports => ({
  id: crypto.randomUUID(),
  title: `Отчет: ${formData.incidentType}`,
  description: formData.description,
  author_character_id: authorId,
  call_id: null,
  incident_location: formData.incidentAddress,
  incident_time: formData.incidentTime,
  incident_type: formData.incidentType,
  participants: JSON.stringify([{ name: formData.citizenName }]),
  penal_codes: JSON.stringify([{ article: formData.article, sanction: formData.sanctionType }]),
  seized_items: JSON.stringify([{ item: formData.seizedItems, vehicle: formData.suspectVehicle, weapon: formData.suspectWeapon }]),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export const useReportCreationStore = create<ReportCreationStore>((set, get) => ({
  // State
  formData: initialFormData,
  currentStep: 0,
  showForm: false,
  isLoading: false,
  error: null,

  // Actions
  setFormData: (data: Partial<ReportCreationFormData>) => {
    set(state => ({
      formData: { ...state.formData, ...data }
    }));
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },

  setShowForm: (show: boolean) => {
    set({ showForm: show });
  },

  createReport: (report: LawReports) => {
    set({ isLoading: true, error: null });
    
    try {
      // Используем основной store для добавления отчета
      const { addReport } = useLawEnforcementStore.getState();
      addReport(report);
      
      set({ 
        isLoading: false, 
        showForm: false,
        formData: initialFormData,
        currentStep: 0
      });
    } catch (error) {
      set({ 
        error: 'Ошибка при создании отчета', 
        isLoading: false 
      });
    }
  },

  clearForm: () => {
    set({ 
      formData: initialFormData, 
      currentStep: 0,
      error: null 
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));