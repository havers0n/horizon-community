import { authUtils } from '../../lib/auth';
import type { Call911, Unit, BOLO, DispatchStats, UnitAssignment } from '../types';

export class DispatchApi {
  private static baseUrl = '/api/mdt';

  // === Active Calls API ===
  static async getActiveCalls(): Promise<Call911[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/active`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching active calls:', error);
      return [];
    }
  }

  static async createCall911(callData: Partial<Call911>): Promise<Call911> {
    try {
      const response = await fetch(`${this.baseUrl}/calls`, {
        method: 'POST',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  static async updateCallStatus(callId: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/status`, {
        method: 'PATCH',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }

  // === Active Units API ===
  static async getActiveUnits(): Promise<Unit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/units/active`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching active units:', error);
      return [];
    }
  }

  static async updateUnitStatus(unitId: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/units/${unitId}/status`, {
        method: 'PATCH',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating unit status:', error);
      throw error;
    }
  }

  static async assignUnitToCall(callId: string, unitId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/assign`, {
        method: 'POST',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ unitId })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error assigning unit to call:', error);
      throw error;
    }
  }

  // === BOLO API ===
  static async getActiveBolos(): Promise<BOLO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos/active`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching active BOLOs:', error);
      return [];
    }
  }

  static async createBolo(boloData: Partial<BOLO>): Promise<BOLO> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos`, {
        method: 'POST',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(boloData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating BOLO:', error);
      throw error;
    }
  }

  // === Statistics API ===
  static async getDispatchStats(): Promise<DispatchStats> {
    try {
      const [units, calls, bolos] = await Promise.all([
        this.getActiveUnits(),
        this.getActiveCalls(),
        this.getActiveBolos()
      ]);

      return {
        activeUnitsCount: units.length,
        activeCallsCount: calls.length,
        activeBolosCount: bolos.length,
        pendingCallsCount: calls.filter(call => call.status === 'pending').length
      };
    } catch (error) {
      console.error('Error fetching dispatch stats:', error);
      return {
        activeUnitsCount: 0,
        activeCallsCount: 0,
        activeBolosCount: 0,
        pendingCallsCount: 0
      };
    }
  }

  // === Notifications API ===
  static async sendNotification(notification: {
    type: string;
    message: string;
    targetDepartments?: string[];
  }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
} 