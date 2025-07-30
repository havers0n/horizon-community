// Типы данных для сущности Vehicle

export interface Vehicle {
  id: string;
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'bus' | 'van' | 'other';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';
  transmission: 'manual' | 'automatic' | 'cvt' | 'other';
  engineSize: string;
  mileage: number;
  registrationStatus: 'active' | 'expired' | 'suspended' | 'revoked';
  insuranceStatus: 'active' | 'expired' | 'none';
  insuranceProvider?: string;
  insuranceExpiry?: string;
  registrationExpiry: string;
  owner: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  stolen: boolean;
  stolenDate?: string;
  stolenReportNumber?: string;
  violations: VehicleViolation[];
  accidents: VehicleAccident[];
  maintenance: VehicleMaintenance[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleViolation {
  id: string;
  type: 'speeding' | 'parking' | 'red_light' | 'dui' | 'reckless_driving' | 'other';
  date: string;
  location: string;
  description: string;
  fine: number;
  points: number;
  status: 'pending' | 'paid' | 'disputed' | 'dismissed';
  officerId: string;
  officerName: string;
}

export interface VehicleAccident {
  id: string;
  date: string;
  location: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'fatal';
  involvedParties: string[];
  damage: string;
  insuranceClaim?: string;
  policeReport?: string;
  status: 'investigating' | 'closed' | 'pending_insurance';
}

export interface VehicleMaintenance {
  id: string;
  type: 'inspection' | 'repair' | 'service' | 'recall';
  date: string;
  description: string;
  cost: number;
  garage: string;
  nextServiceDate?: string;
  mileage: number;
  status: 'completed' | 'scheduled' | 'in_progress';
}

// Типы для создания и обновления
export interface CreateVehicleRequest {
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'bus' | 'van' | 'other';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';
  transmission: 'manual' | 'automatic' | 'cvt' | 'other';
  engineSize: string;
  mileage: number;
  registrationExpiry: string;
  owner: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  insuranceProvider?: string;
  insuranceExpiry?: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  id: string;
}

// Типы для поиска и фильтрации
export interface VehicleSearchParams {
  query?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  bodyType?: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'bus' | 'van' | 'other';
  registrationStatus?: 'active' | 'expired' | 'suspended' | 'revoked';
  insuranceStatus?: 'active' | 'expired' | 'none';
  stolen?: boolean;
  ownerId?: string;
  limit?: number;
  offset?: number;
}

export interface VehicleSearchResult {
  vehicles: Vehicle[];
  total: number;
  hasMore: boolean;
}

// Типы для экспорта
export interface VehicleExportData {
  vehicles: Vehicle[];
  exportDate: string;
  exportedBy: string;
}

// Типы для статистики
export interface VehicleStats {
  total: number;
  byBodyType: Record<string, number>;
  byRegistrationStatus: Record<string, number>;
  byInsuranceStatus: Record<string, number>;
  stolen: number;
  byMake: Record<string, number>;
  byYear: Record<number, number>;
} 