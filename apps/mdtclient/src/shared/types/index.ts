// =================================================================
// 1. ОСНОВНЫЕ СУЩНОСТИ (ЗОЛОТЫЕ ТИПЫ)
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

export type UnitStatus = 'available' | 'busy' | 'enRoute' | 'onScene' | 'unavailable' | 'panic';

// Константы для enum-подобного использования
export const UnitStatuses = {
  AVAILABLE: 'available' as const,
  BUSY: 'busy' as const,
  EN_ROUTE: 'enRoute' as const,
  ON_SCENE: 'onScene' as const,
  UNAVAILABLE: 'unavailable' as const,
  PANIC: 'panic' as const,
} as const;

export interface Unit {
  id: string;
  unitNumber: string;
  name?: string; // Для обратной совместимости
  departmentId: number;
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

export interface Citizen {
  id: string;
  name: string;
  surname: string;
  firstName?: string; // Для обратной совместимости
  lastName?: string; // Для обратной совместимости
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'male' | 'female'; // Добавлены варианты
  address: string;
  phoneNumber: string;
  occupation?: string;
  photoUrl?: string;
  imageUrl?: string; // Для обратной совместимости
  ssn?: string; // Добавлено для PersonSearch
  flags?: string[];
  addressFlags?: string[];
  // ... все остальные поля гражданина
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plate: string;
  vin: string;
  model: string;
  color: string;
  registration: 'valid' | 'invalid' | 'expired' | string; // Добавлен string для обратной совместимости
  insurance: 'valid' | 'invalid' | 'expired' | string; // Добавлен string для обратной совместимости
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

export type CallPriority = 'low' | 'medium' | 'high' | 'critical';
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
}

// =================================================================
// 2. ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// =================================================================

export interface BOLO {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  createdAt: string;
  updatedAt: string;
  // ... другие поля BOLO
}

export interface CitizenSearchResult {
  id: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  citizens: Citizen[]; // Добавлено для CitizenList
  total: number; // Добавлено для CitizenList
  hasMore: boolean; // Добавлено для CitizenList
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

export interface EmsUnit extends Unit {
  unitType: 'medic';
  crew: User[];
  equipment: string[];
}

// =================================================================
// 3. ДОПОЛНИТЕЛЬНЫЕ ТИПЫ ДЛЯ CITIZEN
// =================================================================

export interface CriminalRecord {
  id: string;
  citizenId: string;
  offense: string;
  date: string;
  severity: 'misdemeanor' | 'felony';
  status: 'active' | 'expunged' | 'pending';
  // ... другие поля
}

export interface MedicalInfo {
  id: string;
  citizenId: string;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  // ... другие поля
}

export interface EmergencyContact {
  id: string;
  citizenId: string;
  name: string;
  relationship: string;
  phone: string;
  address?: string;
  // ... другие поля
}

export interface EmploymentInfo {
  id: string;
  citizenId: string;
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  // ... другие поля
}

// =================================================================
// 4. API ТИПЫ
// =================================================================

export interface CreateCitizenRequest {
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'male' | 'female';
  address: string;
  phoneNumber: string;
  occupation?: string;
  // ... другие поля
}

export interface UpdateCitizenRequest {
  id: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'male' | 'female';
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  // ... другие поля
}

export interface CitizenSearchParams {
  query?: string;
  gender?: string;
  licenseStatus?: string;
  hasCriminalRecord?: boolean;
  city?: string;
  limit?: number;
  offset?: number;
  // ... другие параметры поиска
}

export interface CitizenExportData {
  citizens: Citizen[];
  total: number;
  exportedAt: string;
  // ... другие поля экспорта
}

// =================================================================
// 5. ПЕРЕ-ЭКСПОРТЫ ИЗ ДРУГИХ ФАЙЛОВ (если нужно)
// =================================================================
// Сюда можно будет добавить экспорты из других файлов, если понадобится,
// но пока что держим этот файл как единственный источник правды для основных типов.