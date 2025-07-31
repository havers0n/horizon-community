// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Citizen, CitizenSearchResult } from '@/shared/types';

export interface SearchCitizensRequest {
  query: string;
  limit?: number;
}

export interface CreateCitizenRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  gender: 'male' | 'female' | 'other';
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  weight: number;
  height: number;
  postalCode?: string;
  address?: string;
  phoneNumber?: string;
  occupation?: string;
  additionalInfo?: string;
}

export class CitizensApi {
  static async searchCitizens(data: SearchCitizensRequest): Promise<CitizenSearchResult[]> {
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

  static async getCitizen(id: string): Promise<Citizen> {
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

  static async createCitizen(data: CreateCitizenRequest): Promise<Citizen> {
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

  static async updateCitizen(id: string, data: Partial<Citizen>): Promise<Citizen> {
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