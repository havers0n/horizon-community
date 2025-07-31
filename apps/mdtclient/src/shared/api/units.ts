// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Unit } from '@/shared/types';

export class UnitsApi {
  static async getUnits(): Promise<Unit[]> {
    const response = await fetch('/api/units');
    if (!response.ok) throw new Error('Failed to get units');
    return response.json();
  }

  static async updateUnitStatus(id: string, status: Unit['status']): Promise<Unit> {
    const response = await fetch(`/api/units/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update unit status');
    return response.json();
  }
} 