// =================================================================
// НОРМАЛИЗОВАННЫЕ ТИПЫ ДАННЫХ ДЛЯ СИСТЕМЫ ПЕРСОНАЖЕЙ
// Соответствуют новой структуре БД с разделением гражданских и служебных данных
// =================================================================

// ===== БАЗОВЫЕ ТИПЫ =====

// Базовый персонаж (соответствует таблице common.characters)
export interface Character {
  id: string;
  ownerId: string;
  firstName: string; // ВАЖНО: на фронте используем camelCase
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  photoUrl?: string;
  ssn?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Профиль офицера (соответствует таблице common.leo_profiles)
export interface LeoProfile {
  id: string;
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

// Профиль EMS (соответствует таблице common.ems_profiles)
export interface EmsProfile {
  id: string;
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

// Профиль пожарного (соответствует таблице common.fire_profiles)
export interface FireProfile {
  id: string;
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== УЛЬТИМАТИВНЫЕ ТИПЫ =====

// Ультимативный тип: Персонаж со всеми возможными профилями
// Его должен возвращать API при запросе полной информации о персонаже.
export type FullCharacter = Character & {
  leoProfile?: LeoProfile;
  emsProfile?: EmsProfile;
  fireProfile?: FireProfile;
};

// ===== ТИПЫ ДЛЯ СОЗДАНИЯ И ОБНОВЛЕНИЯ =====

// Создание персонажа
export interface CreateCharacterRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  photoUrl?: string;
  ssn?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
}

// Обновление персонажа
export interface UpdateCharacterRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  photoUrl?: string;
  ssn?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
}

// Создание профиля LEO
export interface CreateLeoProfileRequest {
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// Обновление профиля LEO
export interface UpdateLeoProfileRequest {
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// Создание профиля EMS
export interface CreateEmsProfileRequest {
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// Обновление профиля EMS
export interface UpdateEmsProfileRequest {
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// Создание профиля FIRE
export interface CreateFireProfileRequest {
  characterId: string;
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// Обновление профиля FIRE
export interface UpdateFireProfileRequest {
  badgeNumber?: string;
  rankId?: number;
  divisionId?: number;
  departmentId?: number;
  callsign?: string;
  callsign2?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// ===== ТИПЫ ДЛЯ ФИЛЬТРАЦИИ И ПОИСКА =====

// Фильтры для персонажей
export interface CharacterFilters {
  ownerId?: string;
  gender?: string;
  occupation?: string;
  limit?: number;
  offset?: number;
}

// Фильтры для профилей LEO
export interface LeoProfileFilters {
  characterId?: string;
  departmentId?: number;
  rankId?: number;
  status?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Фильтры для профилей EMS
export interface EmsProfileFilters {
  characterId?: string;
  departmentId?: number;
  rankId?: number;
  status?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Фильтры для профилей FIRE
export interface FireProfileFilters {
  characterId?: string;
  departmentId?: number;
  rankId?: number;
  status?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// ===== ТИПЫ ДЛЯ СТАТИСТИКИ =====

// Статистика персонажей
export interface CharacterStats {
  totalCharacters: number;
  charactersByGender: Record<string, number>;
  charactersByOccupation: Record<string, number>;
  recentCharacters: number; // за последние 30 дней
}

// Статистика профилей LEO
export interface LeoProfileStats {
  totalProfiles: number;
  activeProfiles: number;
  suspendedProfiles: number;
  profilesByDepartment: Record<number, number>;
  profilesByRank: Record<number, number>;
  recentHires: number; // за последние 30 дней
}

// Статистика профилей EMS
export interface EmsProfileStats {
  totalProfiles: number;
  activeProfiles: number;
  suspendedProfiles: number;
  profilesByDepartment: Record<number, number>;
  profilesByRank: Record<number, number>;
  recentHires: number; // за последние 30 дней
}

// Статистика профилей FIRE
export interface FireProfileStats {
  totalProfiles: number;
  activeProfiles: number;
  suspendedProfiles: number;
  profilesByDepartment: Record<number, number>;
  profilesByRank: Record<number, number>;
  recentHires: number; // за последние 30 дней
}

// ===== ТИПЫ ДЛЯ ВАЛИДАЦИИ =====

// Результат валидации
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ===== ТИПЫ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

// Легаси тип для обратной совместимости
export interface LegacyCharacter {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  photoUrl?: string;
  ssn?: string;
  flags?: string[];
  addressFlags?: string[];
  // Служебные поля (для обратной совместимости)
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
  createdAt: string;
  updatedAt: string;
} 