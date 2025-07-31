// @ts-nocheck - TODO: Remove after major refactoring is complete
// Fire Incident Entity
export * from './api';
export * from './model';
export * from './ui';

// Add aliases for compatibility with features
export type {
  FireIncident as FireIncidentManagementWidget,
  FireIncidentStatus,
  FireIncidentType,
  FireIncidentPriority
} from '@/shared/types'; 