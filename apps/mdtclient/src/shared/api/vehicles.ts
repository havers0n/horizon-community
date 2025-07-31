// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Vehicle } from '@/shared/types';

export class VehiclesApi {
  static async searchVehicles(query: string): Promise<Vehicle[]> {
    const response = await fetch(`/api/vehicles/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search vehicles');
    return response.json();
  }

  static async getVehicle(id: string): Promise<Vehicle> {
    const response = await fetch(`/api/vehicles/${id}`);
    if (!response.ok) throw new Error('Failed to get vehicle');
    return response.json();
  }
} 