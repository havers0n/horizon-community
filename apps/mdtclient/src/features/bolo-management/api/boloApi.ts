// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Bolo, CreateBoloData, UpdateBoloData } from '../../../entities/dispatch/model/types';
import { authUtils } from '../../../lib/auth';

// Используем единый тип Bolo
export type BOLO = Bolo;

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
      console.log('[BoloApi] Creating BOLO with data:', data);
      console.log('[BoloApi] Request URL:', `${this.baseUrl}/bolos`);
      
      const headers = {
        ...authUtils.getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      
      console.log('[BoloApi] Request headers:', headers);
      console.log('[BoloApi] Auth token present:', !!headers.Authorization);
      
      const response = await fetch(`${this.baseUrl}/bolos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      console.log('[BoloApi] Response status:', response.status);
      console.log('[BoloApi] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          console.log('[BoloApi] Error response data:', errorData);
          
          if (errorData.error) {
            errorMessage = errorData.error;
          }
          if (errorData.details) {
            errorDetails = errorData.details;
          }
        } catch (parseError) {
          console.log('[BoloApi] Could not parse error response as JSON');
        }
        
        const fullError = errorDetails 
          ? `${errorMessage} - Details: ${JSON.stringify(errorDetails)}`
          : errorMessage;
          
        throw new Error(fullError);
      }

      const result = await response.json();
      console.log('[BoloApi] Success response:', result);
      
      if (!result.data) {
        throw new Error('No data received from server');
      }
      
      return this.mapBoloFromApi(result.data);
    } catch (error) {
      console.error('[BoloApi] Error creating BOLO:', error);
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
      description: apiData.subjectDescription || apiData.description || '',
      vehicle: apiData.vehicleDescription || apiData.vehicle,
      plate: apiData.vehiclePlate || apiData.plate,
      reason: apiData.reason,
      timestamp: apiData.created_at || apiData.timestamp,
      priority: apiData.priority || 'medium',
      issuedBy: apiData.issued_by || apiData.author_name || 'Unknown',
      status: apiData.status || 'active',
      location: apiData.location,
      additionalInfo: apiData.additional_info || apiData.notes || ''
    };
  }
} 