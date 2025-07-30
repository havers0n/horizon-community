import { create } from 'zustand';
import { EmsReport, CreateEmsReportRequest, UpdateEmsReportRequest } from './types';

interface ReportsState {
  reports: EmsReport[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setReports: (reports: EmsReport[]) => void;
  addReport: (report: EmsReport) => void;
  updateReport: (id: string, updates: Partial<EmsReport>) => void;
  deleteReport: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getReportsByType: (type: 'medical' | 'fire' | 'rescue') => EmsReport[];
  getReportsByAuthor: (authorId: string) => EmsReport[];
  getReportsByCall: (callId: string) => EmsReport[];
}

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
      report.id === id ? { ...report, ...updates, updatedAt: new Date().toISOString() } : report
    )
  })),
  
  deleteReport: (id) => set((state) => ({
    reports: state.reports.filter(report => report.id !== id)
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  getReportsByType: (type) => get().reports.filter(report => report.type === type),
  
  getReportsByAuthor: (authorId) => get().reports.filter(report => report.authorId === authorId),
  
  getReportsByCall: (callId) => get().reports.filter(report => report.callId === callId),
})); 