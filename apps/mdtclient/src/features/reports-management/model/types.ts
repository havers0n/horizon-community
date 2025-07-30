export interface EmsReport {
  id: string;
  type: 'medical' | 'fire' | 'rescue';
  author: string;
  authorId: string;
  callId?: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  
  // Медицинская информация
  patientName?: string;
  treatmentProvided?: string;
  medications?: string[];
  vitalSigns?: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
  disposition?: string;
  
  // Пожарная информация
  fireDetails?: {
    structureType: string;
    fireOrigin: string;
    damage: string;
    cause: string;
  };
}

export interface CreateEmsReportRequest {
  type: 'medical' | 'fire' | 'rescue';
  callId?: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  outcome: string;
  
  // Медицинская информация
  patientName?: string;
  treatmentProvided?: string;
  medications?: string[];
  vitalSigns?: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
  disposition?: string;
  
  // Пожарная информация
  fireDetails?: {
    structureType: string;
    fireOrigin: string;
    damage: string;
    cause: string;
  };
}

export interface UpdateEmsReportRequest extends Partial<CreateEmsReportRequest> {
  id: string;
}

export interface EmsReportSearchParams {
  type?: 'medical' | 'fire' | 'rescue';
  authorId?: string;
  callId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface EmsReportSearchResult {
  reports: EmsReport[];
  total: number;
  hasMore: boolean;
}

export interface MedicalReportData {
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

export interface FireReportData {
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