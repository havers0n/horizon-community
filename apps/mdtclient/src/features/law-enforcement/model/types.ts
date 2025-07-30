export interface LawReport {
  id: string;
  citizenName: string;
  incidentAddress: string;
  incidentTime: string;
  incidentType: string;
  penalCode: string;
  sanctionType: 'warning' | 'arrest' | 'fine';
  description: string;
  seizedItems: string[];
  suspectVehicle?: {
    plate?: string;
    model?: string;
    color?: string;
    isImpounded?: boolean;
    isStolen?: boolean;
  };
  suspectWeapon?: {
    serialNumber?: string;
    model?: string;
    type?: string;
    hasSerialNumber?: boolean;
    isRegistered?: boolean;
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
  seizedItems: string[];
  suspectVehicle?: {
    plate?: string;
    model?: string;
    color?: string;
    isImpounded?: boolean;
    isStolen?: boolean;
  };
  suspectWeapon?: {
    serialNumber?: string;
    model?: string;
    type?: string;
    hasSerialNumber?: boolean;
    isRegistered?: boolean;
  };
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

// Дополнительные типы для совместимости
export interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  imageUrl: string;
  gender?: string;
  weight?: string;
  height?: string;
  occupation?: string;
  ssn?: string;
  flags?: string[];
  addressFlags?: string[];
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  vin: string;
  ownerId: string;
  registration: 'valid' | 'invalid';
  insurance: 'valid' | 'invalid';
}

export interface Weapon {
  id: string;
  serialNumber: string;
  model: string;
  type: string;
  caliber: string;
  ownerId: string;
  status: 'registered' | 'stolen' | 'confiscated';
  registrationDate: string;
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
  registrationDate: string;
  medicalRecords: string[];
  notes?: string;
}