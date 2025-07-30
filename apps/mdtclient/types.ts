// MDT Client Types
export enum UserRole {
  CITIZEN = 'Citizen',
  LEO = 'LEO',
  EMS_FD = 'EMS/FD',
  DISPATCH = 'Dispatch',
  ADMIN = 'Admin',
}

// Новые типы для EMS/FD разделения
export enum EmsFdSubRole {
  EMS = 'EMS',
  FD = 'FD',
}

export enum EmsFdUnitType {
  AMBULANCE = 'ambulance',
  FIRE_TRUCK = 'fire_truck',
  FIRE_ENGINE = 'fire_engine',
  LADDER_TRUCK = 'ladder_truck',
  RESCUE_UNIT = 'rescue_unit',
  MEDICAL_UNIT = 'medical_unit',
}

export enum EmsFdCallType {
  MEDICAL_EMERGENCY = 'medical_emergency',
  TRAUMA = 'trauma',
  CARDIAC_ARREST = 'cardiac_arrest',
  FIRE_ALARM = 'fire_alarm',
  STRUCTURE_FIRE = 'structure_fire',
  VEHICLE_FIRE = 'vehicle_fire',
  RESCUE = 'rescue',
  HAZMAT = 'hazmat',
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

// Новые типы для диспетчерского модуля
export enum DispatchStatus {
  OPERATOR = 'operator',
  TRAFFIC_DISPATCHER = 'traffic_dispatcher',
  ACTIVE_CONTROL = 'active_control',
  UNAVAILABLE = 'unavailable',
}

export interface DispatchUnit {
  id: string;
  name: string;
  status: DispatchStatus;
  isOnline: boolean;
  lastActivity: string;
  currentZone?: string;
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

export interface GameZone {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Call911 {
  id: string;
  callerId: string;
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  assignedDispatcher?: string;
  createdAt: string;
  answeredAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface Call911Response {
  callId: string;
  action: 'ACCEPT' | 'REJECT';
  dispatcherId: string;
  timestamp: string;
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

// Устаревший интерфейс Bolo - заменен на новый ниже
export interface LegacyBolo {
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

// Unit type for MDT portals
export interface Unit {
  id: string;
  name: string;
  department: 'LSPD' | 'BCSO' | 'LSFD';
  status: UnitStatus;
  callId?: string;
  location?: string;
  notes?: string;
}

// Report template type
export interface ReportTemplate {
  id: string;
  name: string;
  title: string;
  type: ReportType;
  content: string;
  fields: string[];
  isDefault?: boolean;
}

// Новые типы для LAW панели управления
export interface Weapon {
  id: string;
  serialNumber: string;
  model: string;
  type: string;
  caliber: string;
  ownerId: string;
  ownerName: string;
  registrationDate: string;
  status: 'registered' | 'stolen' | 'confiscated';
  notes?: string;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  color: string;
  weight: string;
  ownerId: string;
  ownerName: string;
  medicalRecords: string[];
  notes?: string;
  registrationDate: string;
}

export interface CitizenSearchResult {
  id: string;
  fullName: string;
  ssn?: string;
  address: string;
  dateOfBirth: string;
  imageUrl: string;
}

export interface VehicleSearchResult {
  id: string;
  plate: string;
  model: string;
  color: string;
  ownerName: string;
  ownerId: string;
  status: string;
}

export interface WeaponSearchResult {
  id: string;
  serialNumber: string;
  model: string;
  ownerName: string;
  ownerId: string;
  status: string;
}

// Типы для блокнота записей
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

// Система сигналов
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

export interface SignalNotification {
  id: string;
  signalId: string;
  title: string;
  description: string;
  type: 'LEO' | 'EMS_FD';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
}

// Новые типы для формы составления отчета
export interface LawReport {
  id: string;
  citizenName: string;
  incidentAddress: string;
  incidentTime: string;
  incidentType: string;
  penalCode: string;
  sanctionType: 'warning' | 'arrest' | 'fine';
  description: string;
  suspectVehicle?: {
    plate: string;
    model: string;
    color: string;
    isImpounded: boolean;
    isStolen: boolean;
  };
  seizedItems: string[];
  suspectWeapon?: {
    serialNumber: string;
    model: string;
    type: string;
    hasSerialNumber: boolean;
    isRegistered: boolean;
  };
  createdAt: string;
  author: string;
}

export interface LawReportFormData {
  citizenName: string;
  incidentAddress: string;
  incidentTime: string;
  incidentType: string;
  penalCode: string;
  sanctionType: 'warning' | 'arrest' | 'fine';
  description: string;
  suspectVehicle?: {
    plate: string;
    model: string;
    color: string;
    isImpounded: boolean;
    isStolen: boolean;
  };
  seizedItems: string[];
  suspectWeapon?: {
    serialNumber: string;
    model: string;
    type: string;
    hasSerialNumber: boolean;
    isRegistered: boolean;
  };
}

// Типы для офицеров
export interface Officer {
  id: string;
  badgeNumber: string;
  callsign: string;
  firstName: string;
  lastName: string;
  department: string;
  subdivision: string;
  rank: string;
  qualifications: string[];
  status: 'active' | 'inactive' | 'suspended';
  hireDate: string;
  imageUrl: string;
  phoneNumber: string;
  email: string;
  supervisor: string;
  notes?: string;
}

// Типы для журнала смен
export interface ShiftLog {
  id: string;
  officerId: string;
  officerName: string;
  callsign: string;
  startTime: string;
  endTime: string | null;
  totalHours: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

// Типы для штрафстоянок
export interface ImpoundLot {
  id: string;
  name: string;
  address: string;
  phone: string;
  capacity: number;
  currentVehicles: number;
  manager: string;
  status: 'active' | 'inactive';
}

export interface ImpoundedVehicle {
  id: string;
  plate: string;
  vin: string;
  model: string;
  color: string;
  ownerName: string;
  ownerId: string;
  impoundLotId: string;
  impoundLotName: string;
  impoundDate: string;
  impoundReason: string;
  impoundingOfficer: string;
  officerId: string;
  releaseDate?: string;
  releaseOfficer?: string;
  releaseReason?: string;
  fees: number;
  status: 'impounded' | 'released' | 'destroyed';
  notes?: string;
  location: string;
  evidence?: boolean;
  stolen?: boolean;
  damage?: string;
  photos?: string[];
}

export interface ImpoundReport {
  id: string;
  vehicleId: string;
  impoundDate: string;
  impoundReason: string;
  impoundingOfficer: string;
  officerId: string;
  location: string;
  evidence: boolean;
  stolen: boolean;
  damage?: string;
  notes?: string;
  photos?: string[];
}

export interface ImpoundRelease {
  id: string;
  vehicleId: string;
  releaseDate: string;
  releaseReason: string;
  releasingOfficer: string;
  officerId: string;
  fees: number;
  notes?: string;
}

// Новые интерфейсы для EMS/FD
export interface EmsFdUnit {
  id: string;
  name: string;
  unitType: EmsFdUnitType;
  subRole: EmsFdSubRole;
  status: UnitStatus;
  crew: EmsFdCrewMember[];
  location?: string;
  currentCallId?: string;
  equipment: string[];
  notes?: string;
}

export interface EmsFdCrewMember {
  id: string;
  name: string;
  rank: string;
  qualifications: string[];
  isDriver: boolean;
  isCommander: boolean;
}

export interface EmsFdCall {
  id: string;
  type: EmsFdCallType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  caller: string;
  location: string;
  description: string;
  timestamp: string;
  assignedUnits: string[];
  status: 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'transporting' | 'completed' | 'cancelled';
  patientInfo?: {
    name?: string;
    age?: number;
    condition?: string;
    vitalSigns?: {
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSaturation?: number;
    };
  };
  fireInfo?: {
    structureType?: string;
    fireType?: string;
    hazards?: string[];
    evacuationRequired?: boolean;
  };
  notes?: string;
}

export interface EmsFdReport {
  id: string;
  type: 'medical' | 'fire' | 'rescue';
  author: string;
  authorId: string;
  callId: string;
  patientName?: string;
  incidentLocation: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  treatmentProvided?: string;
  medications?: string[];
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
  };
  fireDetails?: {
    structureType?: string;
    fireOrigin?: string;
    damage?: string;
    cause?: string;
  };
  outcome: string;
  disposition?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmsFdPatient {
  id: string;
  name: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
    surgeries: string[];
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  notes?: string;
  lastVisit?: string;
}

export interface EmsFdShiftLog {
  id: string;
  unitId: string;
  unitName: string;
  crewMembers: string[];
  startTime: string;
  endTime?: string;
  totalHours?: number;
  callsHandled: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}