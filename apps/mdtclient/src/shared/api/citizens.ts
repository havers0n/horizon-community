import type { Characters, CharactersInsert, CharactersUpdate } from '@roleplay-identity/db-types';

export interface SearchCitizensRequest {
  query: string;
  limit?: number;
}

// Используем строго типизированные типы из БД
export type CreateCitizenRequest = CharactersInsert;

export class CitizensApi {
  static async searchCitizens(data: SearchCitizensRequest): Promise<Characters[]> {
    const response = await fetch('/api/citizens/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to search citizens');
    }

    return response.json();
  }

  static async getCitizen(id: string): Promise<Characters> {
    const response = await fetch(`/api/citizens/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get citizen');
    }

    return response.json();
  }

  static async createCitizen(data: CreateCitizenRequest): Promise<Characters> {
    const response = await fetch('/api/citizens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create citizen');
    }

    return response.json();
  }

  static async updateCitizen(id: string, data: CharactersUpdate): Promise<Characters> {
    const response = await fetch(`/api/citizens/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update citizen');
    }

    return response.json();
  }

  static async deleteCitizen(id: string): Promise<void> {
    const response = await fetch(`/api/citizens/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete citizen');
    }
  }
} 