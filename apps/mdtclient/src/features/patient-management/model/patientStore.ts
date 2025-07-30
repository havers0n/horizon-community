import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Patient, PatientSearchFilters, PatientStatistics } from '../../../entities/patient';
import { PatientApi } from '../../../entities/patient/api';

interface PatientState {
  // Состояние
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  statistics: PatientStatistics | null;
  searchFilters: PatientSearchFilters;
  
  // Действия
  fetchPatients: (filters?: PatientSearchFilters) => Promise<void>;
  fetchPatientById: (id: string) => Promise<void>;
  createPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  setSelectedPatient: (patient: Patient | null) => void;
  setSearchFilters: (filters: PatientSearchFilters) => void;
  clearError: () => void;
}

export const usePatientStore = create<PatientState>()(
  devtools(
    (set, get) => ({
      // Начальное состояние
      patients: [],
      selectedPatient: null,
      isLoading: false,
      error: null,
      statistics: null,
      searchFilters: {},

      // Получение списка пациентов
      fetchPatients: async (filters?: PatientSearchFilters) => {
        set({ isLoading: true, error: null });
        try {
          const filtersToUse = filters || get().searchFilters;
          const patients = await PatientApi.getPatients(filtersToUse);
          set({ patients, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при загрузке пациентов',
            isLoading: false 
          });
        }
      },

      // Получение пациента по ID
      fetchPatientById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const patient = await PatientApi.getPatientById(id);
          set({ selectedPatient: patient, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при загрузке пациента',
            isLoading: false 
          });
        }
      },

      // Создание нового пациента
      createPatient: async (patientData) => {
        set({ isLoading: true, error: null });
        try {
          const newPatient = await PatientApi.createPatient(patientData);
          set(state => ({
            patients: [...state.patients, newPatient],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при создании пациента',
            isLoading: false 
          });
        }
      },

      // Обновление пациента
      updatePatient: async (id: string, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPatient = await PatientApi.updatePatient(id, updates);
          set(state => ({
            patients: state.patients.map(p => p.id === id ? updatedPatient : p),
            selectedPatient: state.selectedPatient?.id === id ? updatedPatient : state.selectedPatient,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при обновлении пациента',
            isLoading: false 
          });
        }
      },

      // Удаление пациента
      deletePatient: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await PatientApi.deletePatient(id);
          set(state => ({
            patients: state.patients.filter(p => p.id !== id),
            selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при удалении пациента',
            isLoading: false 
          });
        }
      },

      // Получение статистики
      fetchStatistics: async () => {
        set({ isLoading: true, error: null });
        try {
          const statistics = await PatientApi.getStatistics();
          set({ statistics, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка при загрузке статистики',
            isLoading: false 
          });
        }
      },

      // Установка выбранного пациента
      setSelectedPatient: (patient) => {
        set({ selectedPatient: patient });
      },

      // Установка фильтров поиска
      setSearchFilters: (filters) => {
        set({ searchFilters: filters });
      },

      // Очистка ошибки
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'patient-store',
    }
  )
); 