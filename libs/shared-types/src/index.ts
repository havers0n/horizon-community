// Legacy types for backward compatibility
// These are now re-exported from shared-schema

// MDT Client specific enums and types
export enum UserRole {
  CITIZEN = 'Citizen',
  LEO = 'LEO',
  EMS_FD = 'EMS/FD',
  DISPATCH = 'Dispatch',
  ADMIN = 'Admin',
}

export enum UnitStatus {
  AVAILABLE = '10-8 (Available)',
  BUSY = '10-6 (Busy)',
  EN_ROUTE = '10-76 (En Route)',
  ON_SCENE = '10-97 (On Scene)',
  UNAVAILABLE = '10-7 (Out of Service)',
  PANIC = '10-33 (PANIC)',
  EN_ROUTE_TO_HOSPITAL = 'En Route to Hospital',
  AT_HOSPITAL = 'At Hospital',
  AWAITING_PATIENT = 'Awaiting Patient',
}

export type ReportType = 'Arrest' | 'Medical' | 'Incident';

// MDT Client interfaces
export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  notes?: string;
}

export interface Citizen {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  imageUrl: string;
  gender?: string;
  height?: string;
  weight?: string;
  occupation?: string;
  medicalInfo?: MedicalInfo;
}

export interface Bolo {
  id: string;
  description: string;
  type: 'PERSON' | 'VEHICLE';
  timestamp: string;
}

// MDT Client specific Vehicle interface (different from shared-schema Vehicle)
export interface Vehicle {
  id: string;
  ownerId: string;
  plate: string;
  vin: string;
  model: string;
  color: string;
  registration: string;
  insurance: string;
}

// MDT Client specific Unit interface (different from shared-schema Unit)
export interface MDTUnit {
  id: string;
  name: string;
  department: 'LSPD' | 'BCSO' | 'LSFD';
  status: UnitStatus;
  callId?: string;
}

// MDT Client specific Call911 interface (different from shared-schema Call911)
export interface MDTCall911 {
  id: string;
  caller: string;
  location: string;
  description: string;
  timestamp: string;
  assignedUnits: string[];
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  description: string;
}

export interface Incident {
  id: string;
  title: string;
  events: IncidentEvent[];
  involvedUnits: string[];
  involvedCitizens: string[];
}

export interface PenalCode {
  id: string;
  title: string;
  description: string;
  fine: number;
  jailTime: number;
}

// MDT Client specific Report interface (different from shared-schema Report)
export interface MDTReport {
  id: string;
  title: string;
  author: string; 
  timestamp: string;
  content: string;
  type: ReportType;
}

export interface ReportTemplate {
  title: string;
  content: string;
  type: ReportType;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

export interface WebSocketEvent {
  type: 'connect' | 'disconnect' | 'message' | 'error';
  data?: any;
}

// Stats Types
export interface Stats {
  totalUsers: number;
  totalDepartments: number;
  totalReports: number;
  totalApplications: number;
}

// Zod Schemas are now re-exported from shared-schema

// Re-export schemas from shared-schema for convenience
// Temporarily commented out due to import issues
/*
export {
  entryApplicationSchema,
  loginSchema,
  registerSchema,
  createCharacterSchema,
  updateCharacterSchema,
  createVehicleSchema,
  createWeaponSchema,
  createCall911Schema,
  goOnDutySchema,
  updateUnitStatusSchema,
  createUserSchema,
  updateUserSchema,
  insertApplicationSchema,
  insertComplaintSchema,
  insertUserSchema,
  insertDepartmentSchema,
  insertRankSchema,
  insertDivisionSchema,
  insertQualificationSchema,
  insertUnitSchema,
  insertCharacterQualificationSchema,
  insertCharacterCareerHistorySchema,
  insertCharacterSchema,
  insertVehicleSchema,
  insertWeaponSchema,
  insertPetSchema,
  insertRecordSchema,
  insertCall911Schema,
  insertActiveUnitSchema,
  insertCallAttachmentSchema,
  insertSupportTicketSchema,
  insertReportSchema,
  insertReportTemplateSchema,
  insertFilledReportSchema,
  insertNotificationSchema,
  insertTestSchema,
  insertTestSessionSchema,
  insertJointPositionHistorySchema,
  insertTestResultSchema,
  insertAchievementSchema,
  insertUserAchievementSchema,
  insertBadgeSchema,
  insertUserBadgeSchema,
  insertUserStatsSchema,
  insertForumCategorySchema,
  insertForumTopicSchema,
  insertForumPostSchema,
  insertForumReactionSchema,
  insertForumSubscriptionSchema,
  insertForumViewSchema,
  insertForumStatsSchema
} from '@roleplay-identity/shared-schema';
*/

// Re-export types from shared-schema (excluding conflicting ones)
// Temporarily commented out due to import issues
/*
export type {
  User,
  InsertUser,
  Department,
  InsertDepartment,
  Rank,
  InsertRank,
  Division,
  InsertDivision,
  Qualification,
  InsertQualification,
  // Unit, // Removed - conflicts with MDTUnit
  InsertUnit,
  CharacterQualification,
  InsertCharacterQualification,
  CharacterCareerHistory,
  InsertCharacterCareerHistory,
  Character,
  InsertCharacter,
  // Vehicle, // Removed - conflicts with MDT Vehicle
  InsertVehicle,
  Weapon,
  InsertWeapon,
  Pet,
  InsertPet,
  Record,
  InsertRecord,
  // Call911, // Removed - conflicts with MDTCall911
  InsertCall911,
  ActiveUnit,
  InsertActiveUnit,
  CallAttachment,
  InsertCallAttachment,
  Application,
  InsertApplication,
  SupportTicket,
  InsertSupportTicket,
  Complaint,
  InsertComplaint,
  // Report, // Removed - conflicts with MDTReport
  InsertReport,
  ReportTemplate as SchemaReportTemplate,
  InsertReportTemplate,
  FilledReport,
  InsertFilledReport,
  Notification,
  InsertNotification,
  Test,
  InsertTest,
  TestSession,
  InsertTestSession,
  JointPositionHistory,
  InsertJointPositionHistory,
  TestResult,
  InsertTestResult,
  Achievement,
  InsertAchievement,
  UserAchievement,
  InsertUserAchievement,
  Badge,
  InsertBadge,
  UserBadge,
  InsertUserBadge,
  UserStats,
  InsertUserStats,
  ForumCategory,
  InsertForumCategory,
  ForumTopic,
  InsertForumTopic,
  ForumPost,
  InsertForumPost,
  ForumReaction,
  InsertForumReaction,
  ForumSubscription,
  InsertForumSubscription,
  ForumView,
  InsertForumView,
  ForumStats,
  InsertForumStats,
  LoginData,
  RegisterData,
  CreateCharacterData,
  UpdateCharacterData,
  CreateVehicleData,
  CreateWeaponData,
  CreateCall911Data,
  GoOnDutyData,
  UpdateUnitStatusData,
  EntryApplicationData,
  CreateUserData,
  UpdateUserData
} from '@roleplay-identity/shared-schema';
*/ 