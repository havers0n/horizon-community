// @ts-nocheck - TODO: Remove after major refactoring is complete
import {
  Incident,
  CreateCall911Request,
  UpdateCall911Request,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  DispatchSearchParams,
  DispatchSearchResult,
  Bolo,
  Warrant,
  Signal,
  NotebookNote,
  GameZone
} from '@/shared/types';
import type { Call911, Unit } from '@/shared/types';
import { authUtils } from '../../../lib/auth';

export class DispatchApi {
  private static baseUrl = '/api/mdt';

  // === Call911 API ===
  static async getCalls911(params: DispatchSearchParams = {}): Promise<DispatchSearchResult<Call911>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${this.baseUrl}/calls?${queryParams}`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Проверяем формат ответа сервера
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        // Сервер возвращает { success: true, data: { items, total, page, limit } }
        return result.data;
      } else if (result && typeof result === 'object' && 'items' in result) {
        // Сервер возвращает { items, total, page, limit } напрямую
        return result;
      } else {
        console.warn('Unexpected calls response format:', result);
        return { items: [], total: 0, hasMore: false };
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  }

  static async getCall911(id: string): Promise<Call911> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${id}`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching call:', error);
      throw error;
    }
  }

  static async createCall911(data: CreateCall911Request): Promise<Call911> {
    try {
      const response = await fetch(`${this.baseUrl}/calls`, {
        method: 'POST',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  static async updateCall911(data: UpdateCall911Request): Promise<Call911> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${data.id}`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating call:', error);
      throw error;
    }
  }

  static async deleteCall911(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting call:', error);
      throw error;
    }
  }

  // === Incident API ===
  static async getIncidents(params: DispatchSearchParams = {}): Promise<DispatchSearchResult<Incident>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${this.baseUrl}/incidents?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  }

  static async getIncident(id: string): Promise<Incident> {
    try {
      const response = await fetch(`${this.baseUrl}/incidents/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching incident:', error);
      throw error;
    }
  }

  static async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    try {
      const response = await fetch(`${this.baseUrl}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  static async updateIncident(data: UpdateIncidentRequest): Promise<Incident> {
    try {
      const response = await fetch(`${this.baseUrl}/incidents/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  }

  static async deleteIncident(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/incidents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  }

  // === Units API ===
  static async getUnits(): Promise<Unit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/units`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Проверяем формат ответа сервера
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        // Сервер возвращает { success: true, data: units }
        return Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        // Сервер возвращает массив напрямую
        return result;
      } else {
        console.warn('Unexpected units response format:', result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
  }

  static async getUnit(id: string): Promise<Unit> {
    try {
      const response = await fetch(`${this.baseUrl}/units/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching unit:', error);
      throw error;
    }
  }

  static async updateUnitStatus(id: string, status: string): Promise<Unit> {
    try {
      const response = await fetch(`${this.baseUrl}/units/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating unit status:', error);
      throw error;
    }
  }

  // === BOLO API ===
  static async getBolos(): Promise<Bolo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos`, {
        headers: authUtils.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Проверяем формат ответа сервера
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        // Сервер возвращает { success: true, data: bolos }
        return Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        // Сервер возвращает массив напрямую
        return result;
      } else {
        console.warn('Unexpected BOLOs response format:', result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching BOLOs:', error);
      throw error;
    }
  }

  static async createBolo(data: Omit<Bolo, 'id' | 'createdAt'>): Promise<Bolo> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos`, {
        method: 'POST',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating BOLO:', error);
      throw error;
    }
  }

  // === Warrants API ===
  static async getWarrants(): Promise<Warrant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/warrants`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching warrants:', error);
      throw error;
    }
  }

  // === Signals API ===
  static async getSignals(): Promise<Signal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/signals`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching signals:', error);
      throw error;
    }
  }

  // === Notes API ===
  static async getNotes(): Promise<NotebookNote[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  // === Game Zones API ===
  static async getGameZones(): Promise<GameZone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/game-zones`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching game zones:', error);
      throw error;
    }
  }

  // === Statistics API ===
  static async getDispatchStats(): Promise<{
    totalCalls: number;
    activeIncidents: number;
    availableUnits: number;
    pendingCalls: number;
    completedCalls: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        headers: authUtils.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Проверяем формат ответа сервера
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        // Сервер возвращает { success: true, data: stats }
        return result.data;
      } else if (result && typeof result === 'object' && 'totalCalls' in result) {
        // Сервер возвращает stats напрямую
        return result;
      } else {
        console.warn('Unexpected stats response format:', result);
        return {
          totalCalls: 0,
          activeIncidents: 0,
          availableUnits: 0,
          pendingCalls: 0,
          completedCalls: 0,
        };
      }
    } catch (error) {
      console.error('Error fetching dispatch stats:', error);
      throw error;
    }
  }
} 