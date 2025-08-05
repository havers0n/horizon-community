import { create } from 'zustand';
import type { EmsFdReports } from '@roleplay-identity/db-types';

interface ReportsState {
  reports: EmsFdReports[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setReports: (reports: EmsFdReports[]) => void;
  addReport: (report: EmsFdReports) => void;
  updateReport: (id: string, updates: Partial<EmsFdReports>) => void;
  deleteReport: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getReportsByType: (type: string) => EmsFdReports[];
  getReportsByAuthor: (authorId: string) => EmsFdReports[];
  getReportsByCall: (callId: string) => EmsFdReports[];
}

// Адаптер для преобразования старых моковых данных в новый формат EmsFdReports
const adaptMockReportToEmsFdReports = (mockReport: any): EmsFdReports => ({
  id: mockReport.id,
  title: mockReport.title || 'Отчет о происшествии',
  description: mockReport.description,
  author_character_id: mockReport.authorId,
  call_id: mockReport.callId || null,
  incident_location: mockReport.incidentLocation,
  incident_time: mockReport.incidentTime,
  incident_type: mockReport.incidentType,
  outcome: mockReport.outcome || null,
  treatment_provided: mockReport.treatmentProvided || null,
  medications_administered: mockReport.medications ? JSON.stringify(mockReport.medications) : null,
  vital_signs: mockReport.vitalSigns ? JSON.stringify(mockReport.vitalSigns) : null,
  fire_details: mockReport.fireDetails ? JSON.stringify(mockReport.fireDetails) : null,
  patients: mockReport.patients ? JSON.stringify(mockReport.patients) : null,
  created_at: mockReport.createdAt,
  updated_at: mockReport.updatedAt
});

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  loading: false,
  error: null,
  
  setReports: (reports) => set({ reports }),
  
  addReport: (report) => set((state) => ({
    reports: [report, ...state.reports]
  })),
  
  updateReport: (id, updates) => set((state) => ({
    reports: state.reports.map(report => 
      report.id === id ? { ...report, ...updates, updated_at: new Date().toISOString() } : report
    )
  })),
  
  deleteReport: (id) => set((state) => ({
    reports: state.reports.filter(report => report.id !== id)
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  getReportsByType: (type) => get().reports.filter(report => report.incident_type === type),
  
  getReportsByAuthor: (authorId) => get().reports.filter(report => report.author_character_id === authorId),
  
  getReportsByCall: (callId) => get().reports.filter(report => report.call_id === callId),
})); 