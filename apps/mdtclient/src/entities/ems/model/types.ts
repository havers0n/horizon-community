export interface EmsUnit {
  id: string;
  name: string;
  unitType: EmsUnitType;
  status: UnitStatus;
  crew: EmsCrewMember[];
  equipment: string[];
  location: string;
}

export interface EmsCrewMember {
  id: string;
  name: string;
  rank: string;
  qualifications: string[];
  isDriver: boolean;
  isCommander: boolean;
}

export interface EmsCall {
  id: string;
  type: EmsCallType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  caller: string;
  location: string;
  description: string;
  timestamp: string;
  assignedUnits: string[];
  status: 'pending' | 'en_route' | 'on_scene' | 'transporting' | 'completed';
  patientInfo?: EmsPatient;
}

export interface EmsPatient {
  name: string;
  age: number;
  condition: string;
  vitalSigns: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
}

export interface EmsReport {
  id: string;
  callId: string;
  patientId: string;
  unitId: string;
  crewMembers: string[];
  incidentType: string;
  location: string;
  timestamp: string;
  chiefComplaint: string;
  vitalSigns: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate: number;
  };
  assessment: string;
  treatment: string;
  disposition: string;
  notes: string;
}

export interface EmsShiftLog {
  id: string;
  unitId: string;
  crewMembers: string[];
  startTime: string;
  endTime?: string;
  calls: string[];
  notes: string;
}

export enum EmsUnitType {
  AMBULANCE = 'ambulance',
  FIRE_ENGINE = 'fire_engine',
  RESCUE_UNIT = 'rescue_unit',
  MEDICAL_HELICOPTER = 'medical_helicopter'
}

export enum EmsCallType {
  MEDICAL_EMERGENCY = 'medical_emergency',
  TRAUMA = 'trauma',
  CARDIAC_ARREST = 'cardiac_arrest',
  STRUCTURE_FIRE = 'structure_fire',
  VEHICLE_FIRE = 'vehicle_fire',
  RESCUE = 'rescue',
  HAZMAT = 'hazmat'
}

export enum UnitStatus {
  AVAILABLE = 'available',
  EN_ROUTE = 'en_route',
  ON_SCENE = 'on_scene',
  TRANSPORTING = 'transporting',
  OUT_OF_SERVICE = 'out_of_service',
  TRAINING = 'training'
}

export enum EmsSubRole {
  EMS = 'ems',
  FD = 'fd'
} 