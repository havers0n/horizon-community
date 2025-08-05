import { create } from 'zustand';
import type { LawReports } from '@roleplay-identity/db-types';

interface LawEnforcementState {
  reports: LawReports[];
  addReport: (report: LawReports) => void;
  deleteReport: (reportId: string) => void;
  updateReport: (report: LawReports) => void;
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