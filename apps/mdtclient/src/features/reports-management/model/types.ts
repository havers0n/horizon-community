import type { EmsFdReports } from '@roleplay-identity/db-types';

export interface CreateEmsReportRequest {
  title: string;
  description: string;
  author_character_id: string;
  call_id?: string | null;
  incident_location: string;
  incident_time: string;
  incident_type: string;
  outcome?: string | null;
  treatment_provided?: string | null;
  medications_administered?: any;
  vital_signs?: any;
  fire_details?: any;
  patients?: any;
}

export interface UpdateEmsReportRequest extends Partial<CreateEmsReportRequest> {
  id: string;
}

export interface EmsReportSearchParams {
  incident_type?: string;
  author_character_id?: string;
  call_id?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface EmsReportSearchResult {
  reports: EmsFdReports[];
  total: number;
  hasMore: boolean;
}

export interface MedicalReportFormData {
  patientName: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  treatmentProvided: string;
  medications: string[];
  vitalSigns: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
  outcome: string;
  disposition: string;
}

export interface FireReportFormData {
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  structureType: string;
  fireOrigin: string;
  damage: string;
  cause: string;
  outcome: string;
  evacuationRequired: boolean;
  hazards: string[];
} 