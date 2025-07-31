// @ts-nocheck - TODO: Remove after major refactoring is complete
// Типы для домена Dispatch
export enum DispatchStatus {
  OPERATOR = 'operator',
  TRAFFIC_DISPATCHER = 'traffic_dispatcher',
  ACTIVE_CONTROL = 'active_control',
  UNAVAILABLE = 'unavailable',
}

import type { Call911, Unit, UnitStatus } from '@/shared/types';

export interface Call911Response {
  callId: string;
  action: 'ACCEPT' | 'REJECT';
  dispatcherId: string;
  timestamp: string;
}

export interface MDTCall911 {
  id: string;
  caller: string;
  location: string;
  description: string;
  timestamp: string;
  assignedUnits: string[];
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  description: string;
}

export interface Incident {
  id: string;
  title: string;
  events: IncidentEvent[];
  involvedUnits: string[];
  involvedCitizens: string[];
}

import type { Unit } from '@/shared/types';

export interface DispatchUnit {
  id: string;
  name: string;
  status: DispatchStatus;
  isOnline: boolean;
  lastActivity: string;
  currentZone?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'callQueue' | 'unitList' | 'search' | 'tools' | 'status' | 'calls911' | 'map' | 'notifications' | 'activity';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isVisible: boolean;
  settings?: Record<string, any>;
}

export interface Bolo {
  id: string;
  title: string;
  description: string;
  type: 'PERSON' | 'VEHICLE' | 'GENERAL';
  targetName?: string;
  targetVehicle?: string;
  authorId: string;
  authorName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  location?: string;
  notes?: string;
}

export interface Warrant {
  id: string;
  targetName: string;
  type: 'SEARCH' | 'ARREST' | 'BENCH';
  address?: string;
  reason: string;
  authorId: string;
  authorName: string;
  status: 'ACTIVE' | 'EXECUTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt?: string;
  executedAt?: string;
  executedBy?: string;
  notes?: string;
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  type: 'LEO' | 'EMS_FD';
  author: string;
  authorId: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface NotebookNote {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'investigation' | 'surveillance' | 'arrest' | 'warning' | 'incident' | 'other';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GameZone {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API типы
export interface CreateCall911Request {
  callerId: string;
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateCall911Request {
  id: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  assignedDispatcher?: string;
  notes?: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  involvedUnits?: string[];
  involvedCitizens?: string[];
}

export interface UpdateIncidentRequest {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  involvedUnits?: string[];
  involvedCitizens?: string[];
}

export interface DispatchSearchParams {
  query?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface DispatchSearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
} 