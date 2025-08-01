import { supabaseStorage } from './SupabaseStorage.js';
import type { Character, InsertCharacter } from '../types.js';

// ===== CHARACTER SERVICE - БИЗНЕС-ЛОГИКА ДЛЯ ПЕРСОНАЖЕЙ =====

export class CharacterService {
  
  // ===== АДАПТЕРЫ ТИПОВ =====
  
  private adaptSupabaseCharacterToCharacter(supabaseCharacter: any): Character {
    return {
      id: supabaseCharacter.id,
      ownerId: supabaseCharacter.owner_id,
      firstName: supabaseCharacter.first_name,
      lastName: supabaseCharacter.last_name,
      dateOfBirth: supabaseCharacter.date_of_birth,
      gender: supabaseCharacter.gender,
      nationality: supabaseCharacter.nationality,
      phoneNumber: supabaseCharacter.phone_number || undefined,
      address: supabaseCharacter.address || undefined,
      createdAt: new Date(supabaseCharacter.created_at),
      updatedAt: new Date(supabaseCharacter.updated_at)
    };
  }

  private adaptCharacterToSupabaseCharacter(character: InsertCharacter): any {
    return {
      owner_id: character.ownerId,
      first_name: character.firstName,
      last_name: character.lastName,
      date_of_birth: character.dateOfBirth,
      gender: character.gender,
      nationality: character.nationality,
      phone_number: character.phoneNumber || null,
      address: character.address || null
    };
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ =====
  
  async getCharacter(id: number): Promise<Character | undefined> {
    const data = await supabaseStorage.getById('characters', id);
    return data ? this.adaptSupabaseCharacterToCharacter(data) : undefined;
  }

  async getCharactersByOwner(ownerId: number): Promise<Character[]> {
    const data = await supabaseStorage.list('characters', { owner_id: ownerId });
    return data.map(character => this.adaptSupabaseCharacterToCharacter(character));
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const supabaseCharacter = this.adaptCharacterToSupabaseCharacter(character);
    const data = await supabaseStorage.insert('characters', supabaseCharacter);
    
    if (!data) {
      throw new Error('Failed to create character');
    }
    
    return this.adaptSupabaseCharacterToCharacter(data);
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const supabaseUpdates: any = {};
    
    if (updates.ownerId !== undefined) supabaseUpdates.owner_id = updates.ownerId;
    if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
    if (updates.dateOfBirth !== undefined) supabaseUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.gender !== undefined) supabaseUpdates.gender = updates.gender;
    if (updates.nationality !== undefined) supabaseUpdates.nationality = updates.nationality;
    if (updates.phoneNumber !== undefined) supabaseUpdates.phone_number = updates.phoneNumber;
    if (updates.address !== undefined) supabaseUpdates.address = updates.address;
    
    const data = await supabaseStorage.update('characters', id, supabaseUpdates);
    return data ? this.adaptSupabaseCharacterToCharacter(data) : undefined;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return await supabaseStorage.delete('characters', id);
  }

  async getAllCharacters(): Promise<Character[]> {
    const data = await supabaseStorage.list('characters');
    return data.map(character => this.adaptSupabaseCharacterToCharacter(character));
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====
  
  async searchCharacters(query: string, limit: number = 10): Promise<Character[]> {
    const data = await supabaseStorage.search('characters', ['first_name', 'last_name'], query, limit);
    return data.map(character => this.adaptSupabaseCharacterToCharacter(character));
  }

  async getCharactersWithFilters(filters: {
    ownerId?: number;
    gender?: string;
    nationality?: string;
    limit?: number;
    offset?: number;
  }): Promise<Character[]> {
    const supabaseFilters: Record<string, any> = {};
    
    if (filters.ownerId !== undefined) supabaseFilters.owner_id = filters.ownerId;
    if (filters.gender !== undefined) supabaseFilters.gender = filters.gender;
    if (filters.nationality !== undefined) supabaseFilters.nationality = filters.nationality;
    
    const data = await supabaseStorage.list('characters', supabaseFilters, {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { column: 'created_at', ascending: false }
    });
    
    return data.map(character => this.adaptSupabaseCharacterToCharacter(character));
  }

  async getCharactersByGender(gender: string): Promise<Character[]> {
    const data = await supabaseStorage.list('characters', { gender });
    return data.map(character => this.adaptSupabaseCharacterToCharacter(character));
  }

  async getCharactersByNationality(nationality: string): Promise<Character[]> {
    const data = await supabaseStorage.list('characters', { nationality });
    return data.map(character => this.adaptSupabaseCharacterToCharacter(character));
  }

  // ===== СТАТИСТИКА =====
  
  async getCharacterCount(): Promise<number> {
    return await supabaseStorage.count('characters');
  }

  async getCharacterCountByOwner(ownerId: number): Promise<number> {
    return await supabaseStorage.count('characters', { owner_id: ownerId });
  }

  async getCharacterCountByGender(gender: string): Promise<number> {
    return await supabaseStorage.count('characters', { gender });
  }

  async getCharacterCountByNationality(nationality: string): Promise<number> {
    return await supabaseStorage.count('characters', { nationality });
  }

  // ===== БИЗНЕС-ЛОГИКА =====
  
  async getCharacterFullName(id: number): Promise<string | undefined> {
    const character = await this.getCharacter(id);
    if (!character) return undefined;
    
    return `${character.firstName} ${character.lastName}`;
  }

  async getCharacterAge(id: number): Promise<number | undefined> {
    const character = await this.getCharacter(id);
    if (!character) return undefined;
    
    const birthDate = new Date(character.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  async isCharacterAdult(id: number): Promise<boolean> {
    const age = await this.getCharacterAge(id);
    return age !== undefined && age >= 18;
  }

  async transferCharacterOwnership(characterId: number, newOwnerId: number): Promise<Character | undefined> {
    return await this.updateCharacter(characterId, { ownerId: newOwnerId });
  }

  async getCharactersByAgeRange(minAge: number, maxAge: number): Promise<Character[]> {
    const allCharacters = await this.getAllCharacters();
    const charactersInRange: Character[] = [];
    
    for (const character of allCharacters) {
      const age = await this.getCharacterAge(character.id);
      if (age !== undefined && age >= minAge && age <= maxAge) {
        charactersInRange.push(character);
      }
    }
    
    return charactersInRange;
  }

  async getCharactersByBirthYear(year: number): Promise<Character[]> {
    const allCharacters = await this.getAllCharacters();
    return allCharacters.filter(character => {
      const birthYear = new Date(character.dateOfBirth).getFullYear();
      return birthYear === year;
    });
  }

  async getCharactersByBirthMonth(month: number): Promise<Character[]> {
    const allCharacters = await this.getAllCharacters();
    return allCharacters.filter(character => {
      const birthMonth = new Date(character.dateOfBirth).getMonth() + 1; // +1 because getMonth() returns 0-11
      return birthMonth === month;
    });
  }

  async validateCharacterData(character: InsertCharacter): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!character.firstName || character.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!character.lastName || character.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!character.dateOfBirth) {
      errors.push('Date of birth is required');
    } else {
      const birthDate = new Date(character.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        errors.push('Invalid date of birth format');
      } else {
        const today = new Date();
        if (birthDate > today) {
          errors.push('Date of birth cannot be in the future');
        }
      }
    }
    
    if (!character.gender || character.gender.trim().length === 0) {
      errors.push('Gender is required');
    }
    
    if (!character.nationality || character.nationality.trim().length === 0) {
      errors.push('Nationality is required');
    }
    
    if (character.phoneNumber && character.phoneNumber.trim().length > 0) {
      // Простая валидация телефона
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(character.phoneNumber.replace(/\s/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Экспортируем единственный экземпляр
export const characterService = new CharacterService(); 