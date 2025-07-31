// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { BOLO } from '@/shared/types';

export class BolosApi {
  static async getBolos(): Promise<BOLO[]> {
    const response = await fetch('/api/bolos');
    if (!response.ok) throw new Error('Failed to get BOLOs');
    return response.json();
  }

  static async createBolo(data: Omit<BOLO, 'id' | 'createdAt'>): Promise<BOLO> {
    const response = await fetch('/api/bolos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create BOLO');
    return response.json();
  }
} 