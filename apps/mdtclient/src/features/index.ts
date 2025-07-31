// @ts-nocheck - TODO: Remove after major refactoring is complete
// Features - явные экспорты всех фич приложения

// Auth & UI
export type {
  AuthState,
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from './auth';

export { AuthApi } from './auth';

// Language & Theme
export { LanguageSwitcher } from './language-switcher';
export { ThemeSwitcher } from './theme-switcher';

// Admin features
export type {
  AdminState,
  AdminPermissions,
  AdminActions
} from './admin-management';

export { AdminPanel } from './admin-management';

// Citizen features
export type {
  CitizenRegistrationState,
  CitizenRegistrationFormData
} from './citizen-registration';

export { CitizenRegistrationWidget } from './citizen-registration';

export type {
  VehicleRegistrationState,
  VehicleRegistrationFormData
} from './vehicle-registration';

export { VehicleRegistrationWidget } from './vehicle-registration';

export type {
  WeaponRegistrationState,
  WeaponRegistrationFormData
} from './weapon-registration';

export { WeaponRegistrationWidget } from './weapon-registration';

export type {
  EmergencyCallState,
  EmergencyCallData
} from './emergency-calls';

export { EmergencyCallWidget } from './emergency-calls';

export type {
  CompanyManagementState,
  CompanyFormData
} from './company-management';

export { CompanyManagementWidget } from './company-management';

export type {
  CargoManagementState,
  CargoFormData
} from './cargo-management';

export { CargoManagementWidget } from './cargo-management';

export type {
  ProfileManagementState,
  ProfileFormData
} from './profile-management';

export { ProfileManagementWidget } from './profile-management';

// Law enforcement features
export type {
  OfficerDashboardState,
  OfficerData
} from './officer-dashboard';

export { OfficerDashboardWidget } from './officer-dashboard';

// EMS & Fire features
export type {
  EmsSystemState,
  EmsData
} from './ems-system';

export { EMSPortal } from './ems-system';

export type {
  FdSystemState,
  FdData
} from './fd-system';

export { FDPortal } from './fd-system';

export type {
  EmsCallManagementState,
  EmsCallData
} from './ems-call-management';

export { EmsCallManagementWidget } from './ems-call-management';

// Dispatch features
export type {
  CallManagementState,
  CallData
} from './call-management';

export { DispatchPortal, CallManagementWidget, UnitManagementWidget } from './call-management';

export type {
  DispatchFeedState,
  DispatchFeedData
} from './dispatch-feed';

export { DispatchFeedWidget } from './dispatch-feed';

// Management features
export type {
  PersonnelManagementState,
  PersonnelData
} from './personnel-management';

export { PersonnelManagementWidget } from './personnel-management';

export type {
  UnitManagementState,
  UnitData
} from './unit-management';

export { UnitManagementWidget } from './unit-management';

export type {
  ShiftManagementState,
  ShiftData
} from './shift-management';

export { ShiftManagementWidget } from './shift-management';

export type {
  IncidentManagementState,
  IncidentData
} from './incident-management';

export { IncidentManagementWidget } from './incident-management';

export type {
  ReportsManagementState,
  ReportData
} from './reports-management';

export { ReportsManagementWidget } from './reports-management';

// Patient features
export type {
  PatientManagementState,
  PatientData
} from './patient-management';

export { PatientManagementWidget } from './patient-management';

// BOLO features
export type {
  BoloManagementState,
  BoloData
} from './bolo-management';

export { BoloManagementWidget } from './bolo-management';

// Law enforcement specific exports
export { 
  LawEnforcementPortal,
  CitizenSearchWidget,
  VehicleSearchWidget,
  WeaponSearchWidget,
  LawReportForm
} from './law-enforcement'; 