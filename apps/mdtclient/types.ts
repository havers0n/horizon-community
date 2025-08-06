// MDT Client Types
import { MDT_ROLES } from '@roleplay-identity/shared-types';

export enum UserRole {
  CITIZEN = 'citizen',
  LEO = 'leo',
  EMS = 'ems',
  FD = 'fd',
  DISPATCH = 'dispatch',
  ADMIN = 'admin'
}

// Экспортируем функции из централизованного файла
export { 
  isMDTRole,
  isEmergencyService,
  getRoleDisplayName,
  getRoleColor 
} from '@roleplay-identity/shared-types';
