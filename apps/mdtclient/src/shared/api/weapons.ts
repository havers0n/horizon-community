// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Weapon } from '@/shared/types';

export class WeaponsApi {
  static async searchWeapons(query: string): Promise<Weapon[]> {
    const response = await fetch(`/api/weapons/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search weapons');
    return response.json();
  }

  static async getWeapon(id: string): Promise<Weapon> {
    const response = await fetch(`/api/weapons/${id}`);
    if (!response.ok) throw new Error('Failed to get weapon');
    return response.json();
  }
} 