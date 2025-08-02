// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Incident } from '@/entities/incident/model/types';

export interface IncidentManagementState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  showDetailsModal: boolean;
  modalView: 'details' | 'ai_report';
  isLoading: boolean;
  error: string | null;
  report: string;
}

export interface IncidentManagementActions {
  loadIncidents: () => Promise<void>;
  selectIncident: (incident: Incident) => void;
  closeDetailsModal: () => void;
  generateReport: (incident: Incident) => Promise<void>;
  createIncident: (incidentData: Omit<Incident, 'id'>) => Promise<void>;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (incidentId: string) => Promise<void>;
}

export interface IncidentManagementStore extends IncidentManagementState, IncidentManagementActions {} 