export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId?: number;
  secondaryDepartmentId?: number;
  rank?: string;
  division?: string;
  qualifications: string[];
  gameWarnings: number;
  adminWarnings: number;
  has2FA: boolean;
  isDarkTheme: boolean;
  soundSettings: any;
  apiToken?: string;
  cadToken?: string;
  discordId?: string;
  discordUsername?: string;
  createdAt: Date;
  authId?: string;
  unitId?: string;
  department?: string;
}

export type UserRole = 
  | 'candidate'
  | 'civil'
  | 'police'
  | 'ems'
  | 'fire'
  | 'dispatch'
  | 'admin'
  | 'supervisor'
  | 'moderator';

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'terminated';

export interface AuthUser extends User {
  // Дополнительные поля для аутентификации
  permissions?: string[];
  lastLogin?: Date;
} 