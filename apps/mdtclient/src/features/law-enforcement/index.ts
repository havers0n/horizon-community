// Law Enforcement Feature
export * from './ui';
export * from './model';

// Sub-features - экспортируем только UI компоненты, избегая конфликтов типов
export { CitizenSearchWidget, PersonCard, PersonEditModal, PersonSearchWidget, PersonTabs } from './features/citizen-search';
export { VehicleSearchWidget } from './features/vehicle-search';
export { WeaponSearchWidget } from './features/weapon-search';
export { AddressSearchWidget } from './features/address-search';
export { ReportCreationWidget } from './features/report-creation';
export * from './ui/PenalCodeSearch';

// Types - используем типы из @roleplay-identity/db-types
export type {
  LawReports,
  LawReportsInsert,
  LawReportsUpdate,
  Characters,
  CharactersInsert,
  CharactersUpdate,
  Vehicles,
  VehiclesInsert,
  VehiclesUpdate,
  Weapons,
  WeaponsInsert,
  WeaponsUpdate,
} from '@roleplay-identity/db-types';

// Store
export { useLawEnforcementStore } from './model/store';

// Main portal component
export { default as LawEnforcementPortal } from './ui/LawEnforcementPortal';