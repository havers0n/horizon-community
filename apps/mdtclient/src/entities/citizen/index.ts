// @ts-nocheck - TODO: Remove after major refactoring is complete
// Citizen Entity - явные экспорты всех слоев

// Model layer - типы
export type {
  Citizen,
  CriminalRecord,
  MedicalInfo,
  EmploymentInfo,
  EmergencyContact,
  CreateCitizenRequest,
  UpdateCitizenRequest,
  CitizenSearchParams,
  CitizenSearchResult,
  CitizenExportData
} from '@/shared/types';

// API layer - класс API
export { CitizenApi } from './api/citizenApi';

// UI layer - компоненты
export { CitizenCard } from './ui/CitizenCard';
export { CitizenList } from './ui/CitizenList'; 