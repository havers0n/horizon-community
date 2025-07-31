// @ts-nocheck - TODO: Remove after major refactoring is complete
// Entities - явные экспорты всех сущностей

// Citizen Entity
export type {
  CriminalRecord,
  MedicalInfo,
  EmploymentInfo,
  EmergencyContact,
  CreateCitizenRequest,
  UpdateCitizenRequest,
  CitizenSearchParams,
  CitizenSearchResult,
  CitizenExportData
} from './citizen';

export { CitizenApi } from './citizen';
export { CitizenCard, CitizenList } from './citizen';

// Vehicle Entity
export type {
  VehicleViolation,
  VehicleAccident,
  VehicleMaintenance,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleSearchParams,
  VehicleSearchResult,
  VehicleExportData,
  VehicleStats
} from './vehicle';

export { VehicleApi } from './vehicle';
export { VehicleCard, VehicleList, VehicleDetails } from './vehicle';

// Weapon Entity
export type {
  CreateWeaponRequest,
  UpdateWeaponRequest,
  WeaponSearchParams,
  WeaponSearchResult,
  WeaponExportData,
  WeaponStats
} from './weapon';

// EMS Entity
export type {
  EmsUnit,
  EmsCall,
  EmsCallStatus,
  EmsCallPriority,
  CreateEmsCallRequest,
  UpdateEmsCallRequest
} from './ems';

export { EmsApi } from './ems';
export { EmsUnitCard, EmsCallCard, EmsCallList } from './ems';

// Patient Entity
export type {
  Patient,
  PatientStatus,
  PatientPriority,
  CreatePatientRequest,
  UpdatePatientRequest
} from './patient';

export { PatientApi } from './patient';
export { PatientCard, PatientList } from './patient';

// Company Entity
export type {
  Company,
  CompanyType,
  CompanyStatus,
  CreateCompanyRequest,
  UpdateCompanyRequest
} from './company';

export { CompanyApi } from './company';
export { CompanyCard, CompanyList } from './company';

// Incident Entity
export type {
  Incident,
  IncidentStatus,
  IncidentType,
  IncidentPriority,
  CreateIncidentRequest,
  UpdateIncidentRequest
} from './incident';

export { IncidentApi } from './incident';
export { IncidentCard, IncidentList } from './incident';

// Fire Incident Entity
export type {
  FireIncident,
  FireIncidentStatus,
  FireIncidentType,
  FireIncidentPriority,
  CreateFireIncidentRequest,
  UpdateFireIncidentRequest
} from './fire-incident';

export { FireIncidentApi } from './fire-incident';
export { FireIncidentCard, FireIncidentList, FireIncidentDetails } from './fire-incident';

// Dispatch Entity
export type {
  Bolo,
  DispatchStatus,
  CreateCallRequest,
  UpdateCallRequest
} from './dispatch';

export { DispatchApi } from './dispatch';
export { Call911Card, UnitCard, BoloCard } from './dispatch'; 