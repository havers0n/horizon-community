import type { Bolos } from '@roleplay-identity/db-types';

export class BolosApi {
  static async getBolos(): Promise<Bolos[]> {
    const response = await fetch('/api/bolos');
    if (!response.ok) throw new Error('Failed to get BOLOs');
    return response.json();
  }

  static async createBolo(data: Omit<Bolos, 'id' | 'created_at'>): Promise<Bolos> {
    const response = await fetch('/api/bolos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create BOLO');
    return response.json();
  }
} 