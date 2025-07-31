export interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  gender: 'male' | 'female' | 'other';
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  weight: number;
  height: number;
  postalCode?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  additionalInfo?: string;
  licenses: License[];
  medicalRecord: MedicalRecord;
  legalRecords: LegalRecord[];
  vehicles: Vehicle[];
  weapons: Weapon[];
  pets: Pet[];
  ownerId: string;
}

export interface License {
  type: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'suspended' | 'revoked';
  points: number;
}

export interface MedicalRecord {
  bloodType: string;
  rhFactor: string;
  allergies: string[];
  chronicConditions: string[];
  pastSurgeries: string[];
  implants: string[];
}

export interface LegalRecord {
  id: string;
  type: 'arrest' | 'warning' | 'fine';
  date: string;
  description: string;
  officer: string;
  status: 'active' | 'resolved';
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
  inspection?: 'valid' | 'invalid';
  taxes?: 'paid' | 'unpaid';
}

export interface Weapon {
  id: string;
  model: string;
  serialNumber: string;
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
  weight: number;
  dateOfBirth: string;
  ownerId: string;
  medicalRecords: PetMedicalRecord[];
  notes: string[];
}

export interface PetMedicalRecord {
  date: string;
  condition: string;
  description: string;
  treatment?: string;
}

export interface CitizenSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  address?: string;
} 