import type { Character } from '@/shared/types';

export interface CitizenPortalState {
  activeCharacter: Character | null;
  currentView: 'dashboard' | 'profile' | 'registration' | 'property' | 'mdt' | 'reference';
  currentSubView: string;
  isLoading: boolean;
  error: string | null;
}

export interface CitizenPortalActions {
  setActiveCharacter: (character: Character) => void;
  setCurrentView: (view: CitizenPortalState['currentView']) => void;
  setCurrentSubView: (subView: string) => void;
  createCharacter: (data: CreateCharacterRequest) => Promise<void>;
  updateCharacter: (id: string, data: UpdateCharacterRequest) => Promise<void>;
  createEmergencyCall: (data: CreateEmergencyCallRequest) => Promise<void>;
  registerVehicle: (data: CreateVehicleRequest) => Promise<void>;
  registerWeapon: (data: CreateWeaponRequest) => Promise<void>;
}

export interface CreateCharacterRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  address?: string;
  phoneNumber?: string;
  postal?: string;
  occupation?: string;
  mugshotUrl?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
  dead?: boolean;
  missing?: boolean;
  arrested?: boolean;
  isUnit?: boolean;
  badgeNumber?: string;
  callsign?: string;
  callsign2?: string;
  departmentId?: string;
  divisionId?: string;
  rankId?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

export interface UpdateCharacterRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  address?: string;
  phoneNumber?: string;
  postal?: string;
  occupation?: string;
  mugshotUrl?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
  dead?: boolean;
  missing?: boolean;
  arrested?: boolean;
  isUnit?: boolean;
  badgeNumber?: string;
  callsign?: string;
  callsign2?: string;
  departmentId?: string;
  divisionId?: string;
  rankId?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

export interface CreateEmergencyCallRequest {
  caller: string;
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'panic';
  type?: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
}

export interface CreateVehicleRequest {
  ownerId: string;
  plate: string;
  vin: string;
  model: string;
  make?: string;
  year?: number;
  color: string;
  bodyType?: string;
  mileage?: number;
  engineSize?: string;
  registration: 'valid' | 'invalid' | 'expired' | string;
  registrationStatus?: string;
  registrationExpiry?: string;
  insurance: 'valid' | 'invalid' | 'expired' | string;
  insuranceStatus?: string;
  stolen?: boolean;
}

export interface CreateWeaponRequest {
  ownerId: string;
  serialNumber: string;
  model: string;
  type: string;
  caliber: string;
  status: 'registered' | 'stolen' | 'confiscated' | 'illegal' | string;
  registrationDate: string;
  notes?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  subItems?: NavigationSubItem[];
}

export interface NavigationSubItem {
  id: string;
  title: string;
  description?: string;
} 