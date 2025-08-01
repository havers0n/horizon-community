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
  dateOfBirth: string; // date
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
  licenses?: any; // jsonb - пока оставляем any, потом можно типизировать
  medicalInfo?: any; // jsonb
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
  departmentId?: number;
  divisionId?: number;
  rankId?: number;
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
  departmentId?: number;
  divisionId?: number;
  rankId?: number;
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
  departmentId?: number;
  divisionId?: number;
  rankId?: number;
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

export type UnitStatus = 'available' | 'busy' | 'enRoute' | 'onScene' | 'unavailable' | 'panic' | 'transporting' | 'outOfService' | 'training' | 'dispatched' | 'cleared';

// Константы для enum-подобного использования
export const UnitStatuses = {
  AVAILABLE: 'available' as const,
  BUSY: 'busy' as const,
  EN_ROUTE: 'enRoute' as const,
  ON_SCENE: 'onScene' as const,
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

export interface EmsUnit extends Unit {
  unitType: 'medic';
  crew: User[];
  equipment: string[];
}

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