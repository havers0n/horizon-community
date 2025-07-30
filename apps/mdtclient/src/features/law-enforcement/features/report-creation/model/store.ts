import { create } from 'zustand';
import { useLawEnforcementStore } from '../../../model/store';
import type { ReportCreationState, ReportCreationActions, ReportCreationFormData } from './types';
import type { LawReport } from '../../model/types';

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

  createReport: (report: LawReport) => {
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