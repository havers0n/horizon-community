export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  status: UnitStatus;
  departmentId: number;
  officerId?: string;
  vehicleId?: string;
  location?: string;
  lastUpdate?: string;
  qualifications?: string[];
  callsign?: string;
}

export type UnitType = 
  | 'patrol'
  | 'k9'
  | 'swat'
  | 'traffic'
  | 'detective'
  | 'ems'
  | 'fire'
  | 'supervisor';

export type UnitStatus = 
  | 'available'
  | 'busy'
  | 'enRoute'
  | 'onScene'
  | 'unavailable'
  | 'panic';

export interface EmsUnit extends Unit {
  unitType: 'ems';
  crew: string[];
  equipment: string[];
}

export interface PoliceUnit extends Unit {
  unitType: 'police';
  badgeNumber?: string;
  rank?: string;
}

export interface FireUnit extends Unit {
  unitType: 'fire';
  crew: string[];
  equipment: string[];
} 