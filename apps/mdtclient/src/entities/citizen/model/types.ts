// @ts-nocheck - TODO: Remove after major refactoring is complete
// Типы данных для сущности Citizen
import type { Citizen } from '@/shared/types';

export interface CriminalRecord {
  id: string;
  charge: string;
  date: string;
  court: string;
  sentence?: string;
  status: 'pending' | 'convicted' | 'acquitted' | 'dismissed';
  description?: string;
}

export interface MedicalInfo {
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyNotes?: string;
}

export interface EmploymentInfo {
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  phone: string;
  address: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

// Типы для создания и обновления
export interface CreateCitizenRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  licenseNumber?: string;
  licenseExpiry?: string;
  emergencyContacts: Omit<EmergencyContact, 'id'>[];
}

export interface UpdateCitizenRequest extends Partial<CreateCitizenRequest> {
  id: string;
}

// Типы для поиска и фильтрации
export interface CitizenSearchParams {
  query?: string;
  gender?: 'male' | 'female' | 'other';
  licenseStatus?: 'valid' | 'expired' | 'suspended' | 'revoked' | 'none';
  hasCriminalRecord?: boolean;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface CitizenSearchResult {
  citizens: Citizen[];
  total: number;
  hasMore: boolean;
}

// Типы для экспорта
export interface CitizenExportData {
  citizens: Citizen[];
  exportDate: string;
  exportedBy: string;
} 