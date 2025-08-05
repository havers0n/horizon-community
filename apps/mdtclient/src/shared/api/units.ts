import type { Units } from '@roleplay-identity/db-types';

export class UnitsApi {
  static async getUnits(): Promise<Units[]> {
    const response = await fetch('/api/units');
    if (!response.ok) throw new Error('Failed to get units');
    return response.json();
  }

  static async updateUnitStatus(id: string, status: Units['status']): Promise<Units> {
    const response = await fetch(`/api/units/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update unit status');
    return response.json();
  }
} 