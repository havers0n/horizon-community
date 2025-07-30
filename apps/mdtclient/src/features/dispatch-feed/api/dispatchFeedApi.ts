import { Call911, MDTUnit, Bolo } from '../../entities/dispatch/model/types';
import { authUtils } from '../../../lib/auth';

export interface ActiveCall {
  id: number;
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  type: 'police' | 'fire' | 'ems';
  priority: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveUnit {
  id: number;
  characterId: number;
  callsign: string;
  unitNumber?: string;
  departmentId: number;
  status: string;
  location?: any;
  isActive: boolean;
  isPanic: boolean;
  lastUpdate: string;
  createdAt: string;
}

export interface ActiveBolo {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export class DispatchFeedApi {
  private static baseUrl = '/api/mdt';

  // === Active Calls API ===
  static async getActiveCalls(): Promise<ActiveCall[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calls`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data; // Поддержка разных форматов ответа
    } catch (error) {
      console.error('Error fetching active calls:', error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }

  // === Active Units API ===
  static async getActiveUnits(): Promise<ActiveUnit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/units`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data; // Поддержка разных форматов ответа
    } catch (error) {
      console.error('Error fetching active units:', error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }

  // === BOLO API ===
  static async getActiveBolos(): Promise<ActiveBolo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/signals`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const signals = data.data || data;
      
      // Фильтруем только активные сигналы (BOLO)
      return signals.filter((signal: any) => signal.isActive);
    } catch (error) {
      console.error('Error fetching active BOLOs:', error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }

  // === Statistics API ===
  static async getDispatchStats(): Promise<{
    activeUnitsCount: number;
    activeCallsCount: number;
    activeBolosCount: number;
  }> {
    try {
      const [units, calls, bolos] = await Promise.all([
        this.getActiveUnits(),
        this.getActiveCalls(),
        this.getActiveBolos()
      ]);

      return {
        activeUnitsCount: units.length,
        activeCallsCount: calls.length,
        activeBolosCount: bolos.length
      };
    } catch (error) {
      console.error('Error fetching dispatch stats:', error);
      return {
        activeUnitsCount: 0,
        activeCallsCount: 0,
        activeBolosCount: 0
      };
    }
  }
} 