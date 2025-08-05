import type { Vehicles } from '@roleplay-identity/db-types';

export class VehiclesApi {
  static async searchVehicles(query: string): Promise<Vehicles[]> {
    const response = await fetch(`/api/vehicles/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search vehicles');
    return response.json();
  }

  static async getVehicle(id: string): Promise<Vehicles> {
    const response = await fetch(`/api/vehicles/${id}`);
    if (!response.ok) throw new Error('Failed to get vehicle');
    return response.json();
  }
} 