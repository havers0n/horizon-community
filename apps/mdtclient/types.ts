// MDT Client Types
export enum UserRole {
  CITIZEN = 'Citizen',
  LEO = 'LEO',
  EMS_FD = 'EMS/FD',
  DISPATCH = 'Dispatch',
  ADMIN = 'Admin',
}

export enum UnitStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  EN_ROUTE = 'enRoute',
  ON_SCENE = 'onScene',
  UNAVAILABLE = 'unavailable',
  PANIC = 'panic',
  EN_ROUTE_TO_HOSPITAL = 'enRouteToHospital',
  AT_HOSPITAL = 'atHospital',
  AWAITING_PATIENT = 'awaitingPatient',
}

export type ReportType = 'Arrest' | 'Medical' | 'Incident';

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  notes?: string;
}

export interface Citizen {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  imageUrl: string;
  gender?: string;
  height?: string;
  weight?: string;
  occupation?: string;
  medicalInfo?: MedicalInfo;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plate: string;
  vin: string;
  model: string;
  color: string;
  registration: string;
  insurance: string;
}

export interface MDTUnit {
  id: string;
  name: string;
  department: 'LSPD' | 'BCSO' | 'LSFD';
  status: UnitStatus;
  callId?: string;
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

export interface PenalCode {
  id: string;
  title: string;
  description: string;
  fine: number;
  jailTime: number;
}

export interface MDTReport {
  id: string;
  title: string;
  author: string; 
  timestamp: string;
  content: string;
  type: ReportType;
}

export interface Bolo {
  id: string;
  description: string;
  type: 'PERSON' | 'VEHICLE';
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

export interface Stats {
  totalUsers: number;
  totalDepartments: number;
  totalReports: number;
  totalApplications: number;
}