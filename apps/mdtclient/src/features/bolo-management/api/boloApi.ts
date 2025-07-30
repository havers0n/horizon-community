import { BOLO } from '../model/store';
import { authUtils } from '../../../lib/auth';

export interface CreateBoloData {
  type: 'vehicle' | 'person' | 'general';
  description: string;
  vehicle?: string;
  plate?: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  additionalInfo?: string;
  expiresAt?: string;
}

export interface UpdateBoloData extends Partial<CreateBoloData> {
  status?: 'active' | 'resolved' | 'expired';
}

export class BoloApi {
  private static baseUrl = '/api/mdt';

  /**
   * Получить все BOLO
   */
  static async getBolos(): Promise<BOLO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos`, {
        headers: authUtils.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data.map(this.mapBoloFromApi);
    } catch (error) {
      console.error('Error fetching BOLOs:', error);
      throw error;
    }
  }

  /**
   * Создать новый BOLO
   */
  static async createBolo(data: CreateBoloData): Promise<BOLO> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos`, {
        method: 'POST',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return this.mapBoloFromApi(result.data);
    } catch (error) {
      console.error('Error creating BOLO:', error);
      throw error;
    }
  }

  /**
   * Обновить BOLO
   */
  static async updateBolo(id: string, data: UpdateBoloData): Promise<BOLO> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos/${id}`, {
        method: 'PUT',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return this.mapBoloFromApi(result.data);
    } catch (error) {
      console.error('Error updating BOLO:', error);
      throw error;
    }
  }

  /**
   * Удалить BOLO
   */
  static async deleteBolo(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bolos/${id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting BOLO:', error);
      throw error;
    }
  }

  /**
   * Маппинг данных из API в модель BOLO
   */
  private static mapBoloFromApi(apiData: any): BOLO {
    return {
      id: apiData.id,
      type: apiData.type,
      description: apiData.description,
      vehicle: apiData.vehicle,
      plate: apiData.plate,
      reason: apiData.reason,
      timestamp: apiData.created_at || apiData.timestamp,
      priority: apiData.priority,
      issuedBy: apiData.issued_by || apiData.author_name || 'Unknown',
      status: apiData.status,
      location: apiData.location,
      additionalInfo: apiData.additional_info || apiData.notes
    };
  }
} 