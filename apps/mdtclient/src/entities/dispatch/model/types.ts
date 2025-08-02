// @ts-nocheck - TODO: Remove after major refactoring is complete
// Типы для домена Dispatch

// =================================================================
// ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ: ТИП BOLO
// Этот интерфейс соответствует композитному типу bolo_with_author из базы данных
// =================================================================
export interface Bolo {
  // Основные поля
  id: string;
  type: string;
  reason: string;
  status: 'active' | 'resolved';
  location: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string | null;
  
  // Поля субъекта (person/vehicle)
  subject_name: string | null;
  subject_description: string | null;
  vehicle_plate: string | null;
  vehicle_description: string | null;
  
  // Поля автора
  author_character_id: string;
  author_full_name: string | null;
  
  // Дополнительные поля для совместимости с UI
  title?: string; // Для отображения в UI
  description?: string; // Для отображения в UI
  createdAt?: string; // camelCase версия created_at
  updatedAt?: string;
  author?: string; // Для обратной совместимости
  author_name?: string; // Для обратной совместимости
  isActive?: boolean; // Для обратной совместимости
  expiresAt?: string; // Для обратной совместимости
  
  // Структурированные данные для UI
  person?: {
    name: string;
    description?: string;
  };
  vehicle?: {
    plate: string;
    model: string;
    color: string;
  };
}

// Типы для создания и обновления BOLO
export interface CreateBoloData {
  type: string;
  reason: string;
  subjectName?: string | null;
  subjectDescription?: string | null;
  vehicleDescription?: string | null;
  vehiclePlate?: string | null;
  location?: string | null;
  priority?: string | null;
  authorCharacterId: string;
  status?: string;
}

export interface UpdateBoloData extends Partial<CreateBoloData> {
  id: string;
}

// Алиас для обратной совместимости
export type BOLO = Bolo;

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