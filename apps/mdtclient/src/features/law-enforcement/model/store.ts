import { create } from 'zustand';
import { LawReport } from './types';

interface LawEnforcementState {
  reports: LawReport[];
  addReport: (report: LawReport) => void;
  deleteReport: (reportId: string) => void;
  updateReport: (report: LawReport) => void;
}

export const useLawEnforcementStore = create<LawEnforcementState>((set) => ({
  reports: [],
  addReport: (report) => set((state) => ({ 
    reports: [report, ...state.reports] 
  })),
  deleteReport: (reportId) => set((state) => ({ 
    reports: state.reports.filter(report => report.id !== reportId) 
  })),
  updateReport: (updatedReport) => set((state) => ({ 
    reports: state.reports.map(report => 
      report.id === updatedReport.id ? updatedReport : report
    ) 
  })),
}));