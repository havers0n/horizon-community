// =================================================================
// 1. ЦЕНТРАЛЬНАЯ СУЩНОСТЬ: ПЕРСОНАЖ (CHARACTER)
// Этот интерфейс теперь ТОЧНО соответствует вашей таблице в БД
// =================================================================
export interface Character {
  id: string; // В коде лучше использовать string, даже если в БД integer
  ownerId: string; // ID аккаунта игрока

  // --- Базовые/Гражданские поля ---
  firstName: string; // camelCase для фронтенда
  lastName: string;
  name?: string; // Добавлено для обратной совместимости
  surname?: string; // Добавлено для обратной совместимости
  middleName?: string; // Добавлено для обратной совместимости
  dateOfBirth: string; // date
  ssn?: string; // Добавлено для обратной совместимости
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  address?: string;
  phoneNumber?: string;
  phone?: string; // Добавлено для обратной совместимости
  email?: string; // Добавлено для обратной совместимости
  postal?: string;
  occupation?: string;
  mugshotUrl?: string;
  imageUrl?: string; // Добавлено для обратной совместимости
  photoUrl?: string; // Добавлено для обратной совместимости
  licenses?: any; // jsonb - пока оставляем any, потом можно типизировать
  licenseNumber?: string; // Добавлено для обратной совместимости
  licenseStatus?: string; // Добавлено для обратной совместимости
  medicalInfo?: any; // jsonb
  criminalRecord?: any[]; // Добавлено для обратной совместимости
  emergencyContacts?: any[]; // Добавлено для совместимости с мок-данными
  employment?: any; // Добавлено для совместимости с мок-данными
  flags?: string[];
  addressFlags?: string[];
  dead?: boolean;
  missing?: boolean;
  arrested?: boolean;

  // --- Поля сотрудника LEO/EMS (служебный профиль) ---
  isUnit?: boolean;
  badgeNumber?: string;
  callsign?: string;
  callsign2?: string;
  departmentId?: string;
  divisionId?: string;
  rankId?: string;
  hireDate?: string; // date
  terminationDate?: string; // date
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;

  // --- Метаданные ---
  createdAt: string;
  updatedAt: string;
}

// Алиас для обратной совместимости
export type Citizen = Character;

// =================================================================
// 2. ТИПЫ ДЛЯ СОЗДАНИЯ И ОБНОВЛЕНИЯ
// =================================================================

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

// =================================================================
// 3. ДОПОЛНИТЕЛЬНЫЕ ТИПЫ (ОСТАВЛЯЕМ СУЩЕСТВУЮЩИЕ)
// =================================================================

export type UserRole = 'admin' | 'leo' | 'ems' | 'fd' | 'dispatch' | 'citizen';

// Константы для enum-подобного использования
export const UserRoles = {
  ADMIN: 'admin' as const,
  LEO: 'leo' as const,
  EMS: 'ems' as const,
  FD: 'fd' as const,
  DISPATCH: 'dispatch' as const,
  CITIZEN: 'citizen' as const,
} as const;

export interface User {
  id: string;
  authId?: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  roles: UserRole[];
  department?: 'LSPD' | 'BCSO' | 'SAHP' | 'LSFD' | 'SAMS';
  unitId?: string;
  // ... любые другие поля пользователя
}

export type UnitStatus = 'available' | 'busy' | 'enRoute' | 'en_route' | 'onScene' | 'on_scene' | 'unavailable' | 'panic' | 'transporting' | 'outOfService' | 'training' | 'dispatched' | 'cleared';

// Константы для enum-подобного использования
export const UnitStatuses = {
  AVAILABLE: 'available' as const,
  BUSY: 'busy' as const,
  EN_ROUTE: 'en_route' as const, // Исправлено для совместимости
  ON_SCENE: 'on_scene' as const, // Исправлено для совместимости
  UNAVAILABLE: 'unavailable' as const,
  PANIC: 'panic' as const,
  TRANSPORTING: 'transporting' as const,
  OUT_OF_SERVICE: 'outOfService' as const,
  TRAINING: 'training' as const,
  DISPATCHED: 'dispatched' as const,
  CLEARED: 'cleared' as const,
} as const;

export interface Unit {
  id: string;
  unitNumber: string;
  name?: string; // Для обратной совместимости
  departmentId: string; // Изменено с number на string для UUID
  department?: string; // Для обратной совместимости
  status: UnitStatus;
  isPanic?: boolean;
  characterName?: string;
  lastUpdate?: string;
  location?: string; // Добавлено для UnitListWidget
  crew?: User[];
  equipment?: string[];
  unitType?: 'patrol' | 'medic' | 'fire_truck' | 'dispatch';
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plate: string;
  plateNumber?: string; // Добавлено для обратной совместимости
  vin: string;
  model: string;
  make?: string; // Добавлено для обратной совместимости
  year?: number; // Добавлено для обратной совместимости
  color: string;
  bodyType?: string; // Добавлено для обратной совместимости
  mileage?: number; // Добавлено для обратной совместимости
  engineSize?: string; // Добавлено для обратной совместимости
  registration: 'valid' | 'invalid' | 'expired' | string; // Добавлен string для обратной совместимости
  registrationStatus?: string; // Добавлено для обратной совместимости
  registrationExpiry?: string; // Добавлено для обратной совместимости
  insurance: 'valid' | 'invalid' | 'expired' | string; // Добавлен string для обратной совместимости
  insuranceStatus?: string; // Добавлено для обратной совместимости
  stolen?: boolean; // Добавлено для обратной совместимости
  owner?: any; // Добавлено для обратной совместимости
  // ... все остальные поля транспорта
}

export interface Weapon {
  id: string;
  ownerId: string;
  serialNumber: string;
  model: string;
  type: string;
  caliber: string;
  status: 'registered' | 'stolen' | 'confiscated' | 'illegal' | string; // Добавлен string для обратной совместимости
  registrationDate: string;
  notes?: string;
  // ... все остальные поля оружия
}

export type CallPriority = 'low' | 'medium' | 'high' | 'critical' | 'panic';
export type CallStatus = 'pending' | 'assigned' | 'resolved' | 'closed' | 'active'; // Добавлен 'active'

// Константы для enum-подобного использования
export const CallPriorities = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
} as const;

export const CallStatuses = {
  PENDING: 'pending' as const,
  ASSIGNED: 'assigned' as const,
  RESOLVED: 'resolved' as const,
  CLOSED: 'closed' as const,
  ACTIVE: 'active' as const,
} as const;

export type DispatchStatus = 'operator' | 'supervisor' | 'manager';

export const DispatchStatuses = {
  OPERATOR: 'operator' as const,
  SUPERVISOR: 'supervisor' as const,
  MANAGER: 'manager' as const,
} as const;

export interface Call911 {
    id: string;
    caller: string;
    callerName?: string; // Добавлено для Call911Handler
    callerPhone?: string; // Добавлено для Call911Handler
    location: string;
    description: string;
    priority: CallPriority;
    status: CallStatus;
    units: Unit[];
    assignedUnits?: string[]; // Добавлено для обратной совместимости
    timestamp: string;
    createdAt?: string; // Добавлено для CallQueueWidget
    type?: string; // Добавлено для CallQueueWidget
    notes?: string;
    coordinates?: { lat: number; lng: number };
    estimatedResponseTime?: number;
}

export interface DispatchStats {
  activeUnitsCount: number;
  activeCallsCount: number;
  activeBolosCount: number;
  pendingCallsCount: number;
}

export interface UnitAssignment {
  callId: string;
  unitId: string;
  assignedAt: string;
  status: 'assigned' | 'en_route' | 'on_scene' | 'cleared';
}

// =================================================================
// 4. ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// =================================================================

// BOLO тип перенесен в @/entities/dispatch/model/types
// Импортируйте его оттуда: import type { Bolo } from '@/entities/dispatch/model/types';

export interface CharacterSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  characters: Character[]; // Добавлено для CharacterList
  total: number; // Добавлено для CharacterList
  hasMore: boolean; // Добавлено для CharacterList
  // ... другие поля для поиска
}

export interface Department {
  id: string;
  name: string;
  code?: string; // Сделано опциональным
  modules: MDTModule[];
}

export interface MDTModule {
  id: string;
  name: string;
  description?: string; // Добавлено для ModuleContent
  path?: string; // Сделано опциональным
  icon?: any; // Изменено с string на any для React компонентов
  permissions?: string[];
}

// EmsUnit теперь определен ниже в EMS типах

// =================================================================
// 5. ДОПОЛНИТЕЛЬНЫЕ ТИПЫ ДЛЯ CHARACTER
// =================================================================

export interface CriminalRecord {
  id: string;
  characterId: string;
  offense: string;
  date: string;
  severity: 'misdemeanor' | 'felony';
  status: 'active' | 'expunged' | 'pending';
  // ... другие поля
}

export interface MedicalInfo {
  id: string;
  characterId: string;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  // ... другие поля
}

export interface EmergencyContact {
  id: string;
  characterId: string;
  name: string;
  relationship: string;
  phone: string;
  address?: string;
  // ... другие поля
}

export interface EmploymentInfo {
  id: string;
  characterId: string;
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  // ... другие поля
}

// =================================================================
// 6. API ТИПЫ
// =================================================================

export interface CharacterSearchParams {
  query?: string;
  gender?: string;
  licenseStatus?: string;
  hasCriminalRecord?: boolean;
  city?: string;
  limit?: number;
  offset?: number;
  // ... другие параметры поиска
}

export interface CharacterExportData {
  characters: Character[];
  total: number;
  exportedAt: string;
  // ... другие поля экспорта
}

// =================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТИПЫ ДЛЯ API
// =================================================================

export interface Report {
  id: string;
  authorId: string;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  content?: string;
  type?: string;
}

export interface ActiveUnit {
  id: string;
  unitNumber: string;
  name?: string;
  departmentId: string;
  department?: string;
  status: UnitStatus;
  isPanic: boolean;
  characterName?: string;
  lastUpdate: string;
  location: Record<string, any>; // Координаты для активного юнита
  crew?: User[];
  equipment?: string[];
  unitType?: 'patrol' | 'medic' | 'fire_truck' | 'dispatch';
  characterId: string;
  partnerId?: string;
  vehicleId?: string;
  createdAt: string;
}

// =================================================================
// ТИПЫ ДЛЯ ФИЛЬТРОВ
// =================================================================

export interface CitizenFilters {
  type?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface VehicleFilters {
  ownerId?: string;
  registration?: string;
  insurance?: string;
}

export interface WeaponFilters {
  ownerId?: string;
  registration?: string;
}

export interface ReportFilters {
  authorId?: string;
  status?: string;
}

export interface CallFilters {
  status?: string;
  type?: string;
  priority?: number;
}

export interface UnitFilters {
  characterId?: string;
  status?: string;
  departmentId?: string;
  isActive?: boolean;
}

// =================================================================
// 7. ПЕРЕ-ЭКСПОРТЫ ИЗ ДРУГИХ ФАЙЛОВ
// =================================================================
// ВРЕМЕННО ОТКЛЮЧЕНО ИЗ-ЗА КОНФЛИКТОВ ТИПОВ
// TODO: Решить конфликты типов между файлами перед включением пере-экспортов

// Пере-экспорты из dispatch.ts
// export * from './dispatch';

// Пере-экспорты из citizens.ts
// export * from './citizens';

// Пере-экспорты из units.ts
// export * from './units';

// Пере-экспорты из user.ts
// export * from './user';

// Пере-экспорты из departments.ts
// export * from './departments';

// =================================================================
// 8. ПАЦИЕНТ ТИПЫ
// =================================================================

export const PatientGender = {
  MALE: 'male' as const,
  FEMALE: 'female' as const,
  OTHER: 'other' as const,
  UNKNOWN: 'unknown' as const,
} as const;

export type PatientGender = typeof PatientGender[keyof typeof PatientGender];

export const BloodType = {
  A_POSITIVE: 'A+' as const,
  A_NEGATIVE: 'A-' as const,
  B_POSITIVE: 'B+' as const,
  B_NEGATIVE: 'B-' as const,
  AB_POSITIVE: 'AB+' as const,
  AB_NEGATIVE: 'AB-' as const,
  O_POSITIVE: 'O+' as const,
  O_NEGATIVE: 'O-' as const,
  UNKNOWN: 'unknown' as const,
} as const;

export type BloodType = typeof BloodType[keyof typeof BloodType];

export const VisitType = {
  EMERGENCY: 'emergency' as const,
  ROUTINE: 'routine' as const,
  FOLLOW_UP: 'follow_up' as const,
  CONSULTATION: 'consultation' as const,
  SURGERY: 'surgery' as const,
} as const;

export type VisitType = typeof VisitType[keyof typeof VisitType];

export const DiagnosisSeverity = {
  MILD: 'mild' as const,
  MODERATE: 'moderate' as const,
  SEVERE: 'severe' as const,
  CRITICAL: 'critical' as const,
} as const;

export type DiagnosisSeverity = typeof DiagnosisSeverity[keyof typeof DiagnosisSeverity];

export const TreatmentType = {
  MEDICATION: 'medication' as const,
  SURGERY: 'surgery' as const,
  THERAPY: 'therapy' as const,
  MONITORING: 'monitoring' as const,
  REFERRAL: 'referral' as const,
} as const;

export type TreatmentType = typeof TreatmentType[keyof typeof TreatmentType];

export const AllergySeverity = {
  MILD: 'mild' as const,
  MODERATE: 'moderate' as const,
  SEVERE: 'severe' as const,
  LIFE_THREATENING: 'life_threatening' as const,
} as const;

export type AllergySeverity = typeof AllergySeverity[keyof typeof AllergySeverity];

export const MedicationRoute = {
  ORAL: 'oral' as const,
  INTRAVENOUS: 'intravenous' as const,
  INTRAMUSCULAR: 'intramuscular' as const,
  SUBCUTANEOUS: 'subcutaneous' as const,
  TOPICAL: 'topical' as const,
  INHALATION: 'inhalation' as const,
} as const;

export type MedicationRoute = typeof MedicationRoute[keyof typeof MedicationRoute];

export const LabTestCategory = {
  BLOOD: 'blood' as const,
  URINE: 'urine' as const,
  IMAGING: 'imaging' as const,
  CARDIOVASCULAR: 'cardiovascular' as const,
  NEUROLOGICAL: 'neurological' as const,
  RESPIRATORY: 'respiratory' as const,
} as const;

export type LabTestCategory = typeof LabTestCategory[keyof typeof LabTestCategory];

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: PatientGender;
  bloodType: BloodType;
  height?: string;
  weight?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  emergencyContacts?: EmergencyContact[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// =================================================================
// 9. EMS ТИПЫ
// =================================================================

export interface EmsUnit {
  id: string;
  name: string;
  unitType: 'ambulance' | 'fire_engine' | 'medic';
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
  type: string;
  priority: string;
  caller: string;
  location: string;
  description: string;
  timestamp: string;
  assignedUnits: string[];
  status: string;
  patientInfo?: {
    name: string;
    age: number;
    condition: string;
    vitalSigns: {
      heartRate: number;
      bloodPressure: string;
      temperature: number;
      oxygenSaturation: number;
    };
  };
}

export interface EmsReport {
  id: string;
  callId: string;
  authorId: string;
  patientName: string;
  diagnosis: string;
  treatment: string;
  outcome: string;
  timestamp: string;
}

export interface EmsShiftLog {
  id: string;
  unitId: string;
  crewMemberId: string;
  startTime: string;
  endTime?: string;
  callsHandled: number;
  notes: string;
}

// =================================================================
// 10. ЭКСПОРТЫ API КЛАССОВ
// =================================================================

// УДАЛЕНО: export { EmsApi } from '@/entities/ems/api';
// Этот экспорт создавал циклическую зависимость
// EmsApi должен импортироваться напрямую из @/entities/ems/api