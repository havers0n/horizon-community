// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Call911 } from '@/shared/types';

export class CallsApi {
  static async getCalls(): Promise<Call911[]> {
    const response = await fetch('/api/calls');
    if (!response.ok) throw new Error('Failed to get calls');
    return response.json();
  }

  static async assignUnitToCall(callId: string, unitId: string): Promise<Call911> {
    const response = await fetch(`/api/calls/${callId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId })
    });
    if (!response.ok) throw new Error('Failed to assign unit to call');
    return response.json();
  }
} 