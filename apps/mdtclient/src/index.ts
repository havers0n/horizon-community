// @ts-nocheck - TODO: Remove after major refactoring is complete
// Главный экспорт для FSD архитектуры
// Этот файл экспортирует все публичные API из каждого слоя

// Widgets layer
export * from './widgets';

// Features layer - экспортируем только уникальные компоненты
export {
  // Auth
  AuthGuard,
  LoginForm,
  
  // Law Enforcement
  LawEnforcementPortal,
  CitizenSearchWidget,
  VehicleSearchWidget,
  WeaponSearchWidget,
  LawReportForm,
  
  // EMS
  EMSPortal,
  PatientManagementWidget,
  EmsCallManagementWidget,
  
  // Fire Department
  FDPortal,
  FireIncidentManagementWidget,
  
  // Dispatch
  DispatchPortal,
  CallManagementWidget,
  UnitManagementWidget,
  
  // Admin
  AdminPanel,
  PersonnelManagementWidget,
  ReportsManagementWidget,
  
  // Profile
  ProfileManagementWidget,
  
  // BOLO
  BoloManagementWidget,
  
  // Cargo
  CargoManagementWidget,
  
  // Company
  CompanyManagementWidget,
  
  // Citizen Registration
  CitizenRegistrationWidget,
  
  // Unit Management
  UnitList,
  
  // Theme & Language
  ThemeSwitcher,
  LanguageSwitcher,
} from './features';

// Entities layer - экспортируем только уникальные типы
export {
  // Citizen
  Citizen,
  CreateCitizenRequest,
  UpdateCitizenRequest,
  
  // Vehicle
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  
  // Weapon
  Weapon,
  CreateWeaponRequest,
  UpdateWeaponRequest,
  
  // Company
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  
  // Incident
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  
  // EMS
  Patient,
  EmsUnit,
  MedicalRecord,
  EmsReport,
  
  // Fire
  FireIncident,
  CreateFireIncidentRequest,
  UpdateFireIncidentRequest,
  
  // Dispatch
  Call911,
  DispatchUnit,
  DispatchStatus,
  UnitStatus,
  UnitType,
  
  // Department
  Department,
} from './entities';

// Shared layer
export * from './shared';

// Hooks
export * from './hooks'; 