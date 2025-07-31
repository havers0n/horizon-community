// @ts-nocheck - TODO: Remove after major refactoring is complete
// API слой для сущности Vehicle

import { 
  Vehicle, 
  CreateVehicleRequest, 
  UpdateVehicleRequest, 
  VehicleSearchParams, 
  VehicleSearchResult,
  VehicleExportData,
  VehicleStats,
  VehicleViolation,
  VehicleAccident,
  VehicleMaintenance
} from '@/shared/types';

const API_BASE_URL = '/api/vehicles';

export class VehicleApi {
  // Получить список транспортных средств с поиском и фильтрацией
  static async searchVehicles(params: VehicleSearchParams): Promise<VehicleSearchResult> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.make) searchParams.append('make', params.make);
    if (params.model) searchParams.append('model', params.model);
    if (params.year) searchParams.append('year', params.year.toString());
    if (params.color) searchParams.append('color', params.color);
    if (params.bodyType) searchParams.append('bodyType', params.bodyType);
    if (params.registrationStatus) searchParams.append('registrationStatus', params.registrationStatus);
    if (params.insuranceStatus) searchParams.append('insuranceStatus', params.insuranceStatus);
    if (params.stolen !== undefined) searchParams.append('stolen', params.stolen.toString());
    if (params.ownerId) searchParams.append('ownerId', params.ownerId);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/search?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search vehicles: ${response.statusText}`);
    }

    return response.json();
  }

  // Получить транспортное средство по ID
  static async getVehicleById(id: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get vehicle: ${response.statusText}`);
    }

    return response.json();
  }

  // Получить транспортное средство по номеру
  static async getVehicleByPlate(plateNumber: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/plate/${plateNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get vehicle by plate: ${response.statusText}`);
    }

    return response.json();
  }

  // Получить транспортное средство по VIN
  static async getVehicleByVin(vin: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vin/${vin}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get vehicle by VIN: ${response.statusText}`);
    }

    return response.json();
  }

  // Создать новое транспортное средство
  static async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create vehicle: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить транспортное средство
  static async updateVehicle(data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update vehicle: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить транспортное средство
  static async deleteVehicle(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete vehicle: ${response.statusText}`);
    }
  }

  // Отметить как украденное
  static async markAsStolen(id: string, stolenDate: string, reportNumber: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${id}/stolen`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ stolenDate, reportNumber }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark vehicle as stolen: ${response.statusText}`);
    }

    return response.json();
  }

  // Отметить как найденное
  static async markAsFound(id: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${id}/found`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to mark vehicle as found: ${response.statusText}`);
    }

    return response.json();
  }

  // Добавить нарушение
  static async addViolation(vehicleId: string, violation: Omit<VehicleViolation, 'id'>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/violations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(violation),
    });

    if (!response.ok) {
      throw new Error(`Failed to add violation: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить нарушение
  static async updateViolation(vehicleId: string, violationId: string, violation: Partial<VehicleViolation>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/violations/${violationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(violation),
    });

    if (!response.ok) {
      throw new Error(`Failed to update violation: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить нарушение
  static async deleteViolation(vehicleId: string, violationId: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/violations/${violationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete violation: ${response.statusText}`);
    }

    return response.json();
  }

  // Добавить аварию
  static async addAccident(vehicleId: string, accident: Omit<VehicleAccident, 'id'>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/accidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(accident),
    });

    if (!response.ok) {
      throw new Error(`Failed to add accident: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить аварию
  static async updateAccident(vehicleId: string, accidentId: string, accident: Partial<VehicleAccident>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/accidents/${accidentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(accident),
    });

    if (!response.ok) {
      throw new Error(`Failed to update accident: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить аварию
  static async deleteAccident(vehicleId: string, accidentId: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/accidents/${accidentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete accident: ${response.statusText}`);
    }

    return response.json();
  }

  // Добавить техническое обслуживание
  static async addMaintenance(vehicleId: string, maintenance: Omit<VehicleMaintenance, 'id'>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(maintenance),
    });

    if (!response.ok) {
      throw new Error(`Failed to add maintenance: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить техническое обслуживание
  static async updateMaintenance(vehicleId: string, maintenanceId: string, maintenance: Partial<VehicleMaintenance>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/maintenance/${maintenanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(maintenance),
    });

    if (!response.ok) {
      throw new Error(`Failed to update maintenance: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить техническое обслуживание
  static async deleteMaintenance(vehicleId: string, maintenanceId: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/${vehicleId}/maintenance/${maintenanceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete maintenance: ${response.statusText}`);
    }

    return response.json();
  }

  // Экспорт данных транспортных средств
  static async exportVehicles(params: VehicleSearchParams): Promise<VehicleExportData> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.make) searchParams.append('make', params.make);
    if (params.model) searchParams.append('model', params.model);
    if (params.year) searchParams.append('year', params.year.toString());
    if (params.color) searchParams.append('color', params.color);
    if (params.bodyType) searchParams.append('bodyType', params.bodyType);
    if (params.registrationStatus) searchParams.append('registrationStatus', params.registrationStatus);
    if (params.insuranceStatus) searchParams.append('insuranceStatus', params.insuranceStatus);
    if (params.stolen !== undefined) searchParams.append('stolen', params.stolen.toString());
    if (params.ownerId) searchParams.append('ownerId', params.ownerId);

    const response = await fetch(`${API_BASE_URL}/export?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export vehicles: ${response.statusText}`);
    }

    return response.json();
  }

  // Получить статистику по транспортным средствам
  static async getVehicleStats(): Promise<VehicleStats> {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get vehicle stats: ${response.statusText}`);
    }

    return response.json();
  }
} 