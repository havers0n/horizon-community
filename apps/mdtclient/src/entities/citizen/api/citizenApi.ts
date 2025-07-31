// @ts-nocheck - TODO: Remove after major refactoring is complete
// API слой для сущности Citizen

import { 
  Citizen, 
  CriminalRecord,
  MedicalInfo,
  EmergencyContact,
  CreateCitizenRequest,
  UpdateCitizenRequest,
  CitizenSearchParams,
  CitizenSearchResult,
  CitizenExportData
} from '@/shared/types';

const API_BASE_URL = '/api/citizens';

export class CitizenApi {
  // Получить список граждан с поиском и фильтрацией
  static async searchCitizens(params: CitizenSearchParams): Promise<CitizenSearchResult> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.gender) searchParams.append('gender', params.gender);
    if (params.licenseStatus) searchParams.append('licenseStatus', params.licenseStatus);
    if (params.hasCriminalRecord !== undefined) searchParams.append('hasCriminalRecord', params.hasCriminalRecord.toString());
    if (params.city) searchParams.append('city', params.city);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/search?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search citizens: ${response.statusText}`);
    }

    return response.json();
  }

  // Получить гражданина по ID
  static async getCitizenById(id: string): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get citizen: ${response.statusText}`);
    }

    return response.json();
  }

  // Создать нового гражданина
  static async createCitizen(data: CreateCitizenRequest): Promise<Citizen> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create citizen: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить гражданина
  static async updateCitizen(data: UpdateCitizenRequest): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update citizen: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить гражданина
  static async deleteCitizen(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete citizen: ${response.statusText}`);
    }
  }

  // Добавить криминальную запись
  static async addCriminalRecord(citizenId: string, record: Omit<CriminalRecord, 'id'>): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/criminal-record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error(`Failed to add criminal record: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить криминальную запись
  static async updateCriminalRecord(citizenId: string, recordId: string, record: Partial<CriminalRecord>): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/criminal-record/${recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error(`Failed to update criminal record: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить криминальную запись
  static async deleteCriminalRecord(citizenId: string, recordId: string): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/criminal-record/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete criminal record: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить медицинскую информацию
  static async updateMedicalInfo(citizenId: string, medicalInfo: MedicalInfo): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/medical-info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(medicalInfo),
    });

    if (!response.ok) {
      throw new Error(`Failed to update medical info: ${response.statusText}`);
    }

    return response.json();
  }

  // Добавить контакт для экстренной связи
  static async addEmergencyContact(citizenId: string, contact: Omit<EmergencyContact, 'id'>): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/emergency-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`Failed to add emergency contact: ${response.statusText}`);
    }

    return response.json();
  }

  // Обновить контакт для экстренной связи
  static async updateEmergencyContact(citizenId: string, contactId: string, contact: Partial<EmergencyContact>): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/emergency-contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`Failed to update emergency contact: ${response.statusText}`);
    }

    return response.json();
  }

  // Удалить контакт для экстренной связи
  static async deleteEmergencyContact(citizenId: string, contactId: string): Promise<Citizen> {
    const response = await fetch(`${API_BASE_URL}/${citizenId}/emergency-contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete emergency contact: ${response.statusText}`);
    }

    return response.json();
  }

  // Экспорт данных граждан
  static async exportCitizens(params: CitizenSearchParams): Promise<CitizenExportData> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.gender) searchParams.append('gender', params.gender);
    if (params.licenseStatus) searchParams.append('licenseStatus', params.licenseStatus);
    if (params.hasCriminalRecord !== undefined) searchParams.append('hasCriminalRecord', params.hasCriminalRecord.toString());
    if (params.city) searchParams.append('city', params.city);

    const response = await fetch(`${API_BASE_URL}/export?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export citizens: ${response.statusText}`);
    }

    return response.json();
  }

  // Получить статистику по гражданам
  static async getCitizenStats(): Promise<{
    total: number;
    byGender: { male: number; female: number; other: number };
    byLicenseStatus: { valid: number; expired: number; suspended: number; revoked: number; none: number };
    withCriminalRecord: number;
    byCity: Record<string, number>;
  }> {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get citizen stats: ${response.statusText}`);
    }

    return response.json();
  }
} 