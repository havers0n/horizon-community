import { USER_ROLES } from '@roleplay-identity/shared-types';

export enum UserRole {
  CITIZEN = 'citizen',
  CANDIDATE = 'candidate',
  STAFF = 'staff',
  ADMIN = 'admin'
}

// Функции для проверки ролей (используют централизованные функции)
export { 
  isCandidate, 
  isMember, 
  isCitizen, 
  isAdmin,
  isEmergencyService,
  getRoleDisplayName,
  getRoleColor 
} from '@roleplay-identity/shared-types';

export class UserService {
  // ... остальной код сервиса
}