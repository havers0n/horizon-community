// @ts-nocheck - TODO: Remove after major refactoring is complete
// Vehicle Entity - явные экспорты всех слоев

// Model Layer - типы данных
export type {
  Vehicle,
  VehicleViolation,
  VehicleAccident,
  VehicleMaintenance,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleSearchParams,
  VehicleSearchResult,
  VehicleExportData,
  VehicleStats
} from '@/shared/types';

// API Layer - методы для работы с API
export { VehicleApi } from './api/vehicleApi';

// UI Layer - компоненты интерфейса
export { VehicleCard } from './ui/VehicleCard';
export { VehicleList } from './ui/VehicleList';
export { VehicleDetails } from './ui/VehicleDetails'; 