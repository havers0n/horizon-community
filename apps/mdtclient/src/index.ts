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

// Re-export types from @roleplay-identity/db-types
export type {
  Characters,
  CharactersInsert,
  CharactersUpdate,
  Vehicles,
  VehiclesInsert,
  VehiclesUpdate,
  Weapons,
  WeaponsInsert,
  WeaponsUpdate,
  Companies,
  CompaniesInsert,
  CompaniesUpdate,
  Incidents,
  IncidentsInsert,
  IncidentsUpdate,
  Calls911,
  Calls911Insert,
  Calls911Update,
  Units,
  UnitsInsert,
  UnitsUpdate,
  Bolos,
  BolosInsert,
  BolosUpdate,
  Departments,
  DepartmentsInsert,
  DepartmentsUpdate,
} from '@roleplay-identity/db-types';

// Shared layer
export * from './shared';

// Hooks
export * from './hooks'; 