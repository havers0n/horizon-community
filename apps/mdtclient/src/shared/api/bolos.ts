// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Bolo } from '@/entities/dispatch/model/types';

export class BolosApi {
  static async getBolos(): Promise<Bolo[]> {
    const response = await fetch('/api/bolos');
    if (!response.ok) throw new Error('Failed to get BOLOs');
    return response.json();
  }

  static async createBolo(data: Omit<Bolo, 'id' | 'created_at'>): Promise<Bolo> {
    const response = await fetch('/api/bolos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create BOLO');
    return response.json();
  }
} 