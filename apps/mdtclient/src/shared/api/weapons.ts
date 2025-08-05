import type { Weapons } from '@roleplay-identity/db-types';

export class WeaponsApi {
  static async searchWeapons(query: string): Promise<Weapons[]> {
    const response = await fetch(`/api/weapons/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search weapons');
    return response.json();
  }

  static async getWeapon(id: string): Promise<Weapons> {
    const response = await fetch(`/api/weapons/${id}`);
    if (!response.ok) throw new Error('Failed to get weapon');
    return response.json();
  }
} 