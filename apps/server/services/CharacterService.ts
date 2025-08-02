import { supabase } from '../lib/supabase';
import type { Database } from '../../../packages/db-types/src/index';

type Characters = Database['common']['Tables']['characters']['Row'];
type CharactersInsert = Database['common']['Tables']['characters']['Insert'];
type CharactersUpdate = Database['common']['Tables']['characters']['Update'];

// ===== CHARACTER SERVICE - БИЗНЕС-ЛОГИКА ДЛЯ ПЕРСОНАЖЕЙ =====

export interface Character {
  id: string; // UUID
  ownerId: string; // UUID из profiles
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string | null;
  address: string | null;
  occupation: string | null;
  ssn: string | null;
  licenses: any | null;
  medicalInfo: any | null;
  mugshotUrl: string | null;
  flags: string[] | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateCharacterData {
  ownerId: string; // UUID из profiles
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  occupation?: string | null;
  ssn?: string | null;
  licenses?: any | null;
  medicalInfo?: any | null;
  mugshotUrl?: string | null;
  flags?: string[] | null;
}

export interface UpdateCharacterData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  occupation?: string | null;
  ssn?: string | null;
  licenses?: any | null;
  medicalInfo?: any | null;
  mugshotUrl?: string | null;
  flags?: string[] | null;
}

export interface CharacterFilters {
  ownerId?: string;
  gender?: string;
  occupation?: string;
  limit?: number;
  offset?: number;
}

export class CharacterService {
  
  // ===== АДАПТЕРЫ ТИПОВ =====
  
  private adaptSupabaseCharacterToCharacter(supabaseCharacter: Characters): Character {
    return {
      id: supabaseCharacter.id,
      ownerId: supabaseCharacter.owner_id,
      firstName: supabaseCharacter.first_name,
      lastName: supabaseCharacter.last_name,
      dateOfBirth: supabaseCharacter.date_of_birth,
      gender: supabaseCharacter.gender,
      phoneNumber: supabaseCharacter.phone_number,
      address: supabaseCharacter.address,
      occupation: supabaseCharacter.occupation,
      ssn: supabaseCharacter.ssn,
      licenses: supabaseCharacter.licenses,
      medicalInfo: supabaseCharacter.medical_info,
      mugshotUrl: supabaseCharacter.mugshot_url,
      flags: supabaseCharacter.flags,
      createdAt: supabaseCharacter.created_at,
      updatedAt: supabaseCharacter.updated_at
    };
  }

  private adaptCharacterToSupabaseInsert(character: CreateCharacterData): CharactersInsert {
    return {
      owner_id: character.ownerId,
      first_name: character.firstName,
      last_name: character.lastName,
      date_of_birth: character.dateOfBirth,
      gender: character.gender,
      phone_number: character.phoneNumber,
      address: character.address,
      occupation: character.occupation,
      ssn: character.ssn,
      licenses: character.licenses,
      medical_info: character.medicalInfo,
      mugshot_url: character.mugshotUrl,
      flags: character.flags
    };
  }

  private adaptCharacterToSupabaseUpdate(updates: UpdateCharacterData): CharactersUpdate {
    const supabaseUpdates: CharactersUpdate = {};
    
    if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
    if (updates.dateOfBirth !== undefined) supabaseUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.gender !== undefined) supabaseUpdates.gender = updates.gender;
    if (updates.phoneNumber !== undefined) supabaseUpdates.phone_number = updates.phoneNumber;
    if (updates.address !== undefined) supabaseUpdates.address = updates.address;
    if (updates.occupation !== undefined) supabaseUpdates.occupation = updates.occupation;
    if (updates.ssn !== undefined) supabaseUpdates.ssn = updates.ssn;
    if (updates.licenses !== undefined) supabaseUpdates.licenses = updates.licenses;
    if (updates.medicalInfo !== undefined) supabaseUpdates.medical_info = updates.medicalInfo;
    if (updates.mugshotUrl !== undefined) supabaseUpdates.mugshot_url = updates.mugshotUrl;
    if (updates.flags !== undefined) supabaseUpdates.flags = updates.flags;
    
    return supabaseUpdates;
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ =====
  
  async getCharacter(id: string): Promise<Character | null> {
    try {
      console.log('[CharacterService] 🔍 Getting character by ID:', id);
      
      const { data: characters, error } = await supabase
        .rpc('get_character_by_id', { p_character_id: id });

      if (error) {
        console.error('[CharacterService] ❌ Error getting character:', error);
        return null;
      }

      if (!characters || characters.length === 0) {
        console.log('[CharacterService] ❌ Character not found for ID:', id);
        return null;
      }

      console.log('[CharacterService] ✅ Character retrieved successfully');
      return this.adaptSupabaseCharacterToCharacter(characters[0]);
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character:', error);
      return null;
    }
  }

  async getCharactersByOwner(ownerId: string): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting characters by owner:', ownerId);
      
      // Используем get_characters_with_filters с фильтром по owner_id
      const { data: characters, error } = await supabase
        .rpc('get_characters_with_filters', { p_owner_id: ownerId });

      if (error) {
        console.error('[CharacterService] ❌ Error getting characters by owner:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting characters by owner:', error);
      return [];
    }
  }

  async getMyCharacters(userId: string): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting my characters for user:', userId);
      
      const { data: characters, error } = await (supabase as any)
        .rpc('get_my_characters', { p_user_id: userId });

      if (error) {
        console.error('[CharacterService] ❌ Error getting my characters:', error);
        return [];
      }

      console.log('[CharacterService] ✅ My characters retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting my characters:', error);
      return [];
    }
  }

  async createCharacter(characterData: CreateCharacterData): Promise<Character> {
    try {
      console.log('[CharacterService] 📝 Creating new character...');
      
      // Валидация данных
      const validation = await this.validateCharacterData(characterData);
      if (!validation.isValid) {
        console.log('[CharacterService] Validation failed:', validation.errors);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const supabaseCharacter = this.adaptCharacterToSupabaseInsert(characterData);
      
      const { data: characters, error } = await supabase
        .rpc('create_new_character', { p_data: supabaseCharacter });

      if (error) {
        console.error('[CharacterService] ❌ Error creating character:', error);
        throw new Error(`Failed to create character: ${error.message}`);
      }

      if (!characters || characters.length === 0) {
        throw new Error('Character was not created');
      }

      console.log('[CharacterService] ✅ Character created successfully');
      return this.adaptSupabaseCharacterToCharacter(characters[0]);
    } catch (error) {
      console.error('[CharacterService] ❌ Error creating character:', error);
      throw error;
    }
  }

  async updateCharacter(id: string, updates: UpdateCharacterData, ownerId?: string): Promise<Character | null> {
    try {
      console.log('[CharacterService] 🔄 Updating character:', id);
      
      // Если передан ownerId, проверяем права доступа
      if (ownerId) {
        const character = await this.getCharacter(id);
        if (!character || character.ownerId !== ownerId) {
          console.log('[CharacterService] ❌ Access denied: character not found or not owned by user');
          return null;
        }
      }
      
      const supabaseUpdates = this.adaptCharacterToSupabaseUpdate(updates);
      
      const { data: characters, error } = await supabase
        .rpc('update_character', { 
          p_character_id: id,
          p_updates: supabaseUpdates
        });

      if (error) {
        console.error('[CharacterService] ❌ Error updating character:', error);
        return null;
      }

      if (!characters || characters.length === 0) {
        console.log('[CharacterService] ❌ Character not found for update');
        return null;
      }

      console.log('[CharacterService] ✅ Character updated successfully');
      return this.adaptSupabaseCharacterToCharacter(characters[0]);
    } catch (error) {
      console.error('[CharacterService] ❌ Error updating character:', error);
      return null;
    }
  }

  async deleteCharacter(id: string): Promise<boolean> {
    try {
      console.log('[CharacterService] 🗑️ Deleting character:', id);
      
      const { error } = await supabase
        .rpc('delete_character', { p_character_id: id });

      if (error) {
        console.error('[CharacterService] ❌ Error deleting character:', error);
        return false;
      }

      console.log('[CharacterService] ✅ Character deleted successfully');
      return true;
    } catch (error) {
      console.error('[CharacterService] ❌ Error deleting character:', error);
      return false;
    }
  }

  async getAllCharacters(limit: number = 100, offset: number = 0): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting all characters...');
      
      const { data: characters, error } = await supabase
        .rpc('get_all_characters', { 
          p_limit: limit, 
          p_offset: offset 
        });

      if (error) {
        console.error('[CharacterService] ❌ Error getting all characters:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting all characters:', error);
      return [];
    }
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====
  
  async searchCharacters(query: string, limit: number = 10): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Searching characters with query:', query);
      
      const { data: characters, error } = await supabase
        .rpc('search_characters', { 
          p_query: query, 
          p_limit: limit 
        });

      if (error) {
        console.error('[CharacterService] ❌ Error searching characters:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters search completed');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error searching characters:', error);
      return [];
    }
  }

  async getCharactersWithFilters(filters: CharacterFilters): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting characters with filters:', filters);
      
      const { data: characters, error } = await supabase
        .rpc('get_characters_with_filters', {
          p_owner_id: filters.ownerId,
          p_gender: filters.gender,
          p_occupation: filters.occupation,
          p_limit: filters.limit || 100,
          p_offset: filters.offset || 0
        });

      if (error) {
        console.error('[CharacterService] ❌ Error getting characters with filters:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters with filters retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting characters with filters:', error);
      return [];
    }
  }

  async getCharactersByGender(gender: string): Promise<Character[]> {
    return this.getCharactersWithFilters({ gender });
  }

  async getCharactersByOccupation(occupation: string): Promise<Character[]> {
    return this.getCharactersWithFilters({ occupation });
  }

  // ===== СТАТИСТИКА =====
  
  async getCharacterCount(): Promise<number> {
    try {
      const { data: count, error } = await supabase
        .rpc('get_character_count');

      if (error) {
        console.error('[CharacterService] ❌ Error getting character count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character count:', error);
      return 0;
    }
  }

  async getCharacterCountByOwner(ownerId: string): Promise<number> {
    try {
      const { data: count, error } = await supabase
        .rpc('get_character_count_by_owner', { p_owner_id: ownerId });

      if (error) {
        console.error('[CharacterService] ❌ Error getting character count by owner:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character count by owner:', error);
      return 0;
    }
  }

  async getCharacterCountByGender(gender: string): Promise<number> {
    try {
      const { data: count, error } = await supabase
        .rpc('get_character_count_by_gender', { p_gender: gender });

      if (error) {
        console.error('[CharacterService] ❌ Error getting character count by gender:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character count by gender:', error);
      return 0;
    }
  }

  // ===== БИЗНЕС-ЛОГИКА =====
  
  async getCharacterFullName(id: string): Promise<string | null> {
    const character = await this.getCharacter(id);
    if (!character) return null;
    
    return `${character.firstName} ${character.lastName}`;
  }

  async getCharacterAge(id: string): Promise<number | null> {
    const character = await this.getCharacter(id);
    if (!character || !character.dateOfBirth) return null;
    
    const birthDate = new Date(character.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  async isCharacterAdult(id: string): Promise<boolean> {
    const age = await this.getCharacterAge(id);
    return age !== null && age >= 18;
  }

  async transferCharacterOwnership(characterId: string, newOwnerId: string): Promise<boolean> {
    try {
      console.log('[CharacterService] 🔄 Transferring character ownership:', characterId, 'to:', newOwnerId);
      
      const { error } = await supabase
        .rpc('transfer_character_ownership', { 
          p_character_id: characterId,
          p_new_owner_id: newOwnerId
        });

      if (error) {
        console.error('[CharacterService] ❌ Error transferring character ownership:', error);
        return false;
      }

      console.log('[CharacterService] ✅ Character ownership transferred successfully');
      return true;
    } catch (error) {
      console.error('[CharacterService] ❌ Error transferring character ownership:', error);
      return false;
    }
  }

  async getCharactersByAgeRange(minAge: number, maxAge: number): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting characters by age range:', minAge, '-', maxAge);
      
      const { data: characters, error } = await supabase
        .rpc('get_characters_by_age_range', { 
          p_min_age: minAge, 
          p_max_age: maxAge 
        });

      if (error) {
        console.error('[CharacterService] ❌ Error getting characters by age range:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters by age range retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting characters by age range:', error);
      return [];
    }
  }

  async getCharactersByBirthYear(year: number): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting characters by birth year:', year);
      
      const { data: characters, error } = await supabase
        .rpc('get_characters_by_birth_year', { p_year: year });

      if (error) {
        console.error('[CharacterService] ❌ Error getting characters by birth year:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters by birth year retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting characters by birth year:', error);
      return [];
    }
  }

  async getCharactersByBirthMonth(month: number): Promise<Character[]> {
    try {
      console.log('[CharacterService] 🔍 Getting characters by birth month:', month);
      
      const { data: characters, error } = await supabase
        .rpc('get_characters_by_birth_month', { p_month: month });

      if (error) {
        console.error('[CharacterService] ❌ Error getting characters by birth month:', error);
        return [];
      }

      console.log('[CharacterService] ✅ Characters by birth month retrieved successfully');
      return (characters || []).map(character => this.adaptSupabaseCharacterToCharacter(character));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting characters by birth month:', error);
      return [];
    }
  }

  async validateCharacterData(character: CreateCharacterData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!character.firstName || character.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!character.lastName || character.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!character.ownerId || character.ownerId.trim().length === 0) {
      errors.push('Owner ID is required');
    }
    
    if (character.dateOfBirth) {
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

  // ===== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ =====

  private adaptCompositeCharacterToCharacter(compositeCharacter: any): Character {
    return {
      id: compositeCharacter.id || '',
      ownerId: compositeCharacter.owner_id || '',
      firstName: compositeCharacter.first_name || '',
      lastName: compositeCharacter.last_name || '',
      dateOfBirth: compositeCharacter.date_of_birth,
      gender: compositeCharacter.gender,
      phoneNumber: compositeCharacter.phone_number,
      address: compositeCharacter.address,
      occupation: compositeCharacter.occupation,
      ssn: compositeCharacter.ssn,
      licenses: compositeCharacter.licenses,
      medicalInfo: compositeCharacter.medical_info,
      mugshotUrl: compositeCharacter.mugshot_url,
      flags: compositeCharacter.flags,
      createdAt: compositeCharacter.created_at,
      updatedAt: compositeCharacter.updated_at
    };
  }

  async getCharacterWithProfile(id: string): Promise<(Character & { owner?: any }) | null> {
    try {
      console.log('[CharacterService] 🔍 Getting character with profile:', id);
      
      const { data: characters, error } = await supabase
        .rpc('get_character_with_profile', { p_character_id: id });

      if (error) {
        console.error('[CharacterService] ❌ Error getting character with profile:', error);
        return null;
      }

      if (!characters || characters.length === 0) {
        return null;
      }

      const character = characters[0];
      const result = this.adaptCompositeCharacterToCharacter(character);
      return {
        ...result,
        owner: {
          id: character.profile_id,
          username: character.profile_username,
          email: character.profile_email,
          role: character.profile_role
        }
      };
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character with profile:', error);
      return null;
    }
  }

  async getCharactersWithProfiles(ownerId: string): Promise<(Character & { owner?: any })[]> {
    try {
      console.log('[CharacterService] 🔍 Getting characters with profiles for owner:', ownerId);
      
      const { data: characters, error } = await supabase
        .rpc('get_characters_with_profiles', { p_owner_id: ownerId });

      if (error) {
        console.error('[CharacterService] ❌ Error getting characters with profiles:', error);
        return [];
      }

      return (characters || []).map(character => ({
        ...this.adaptCompositeCharacterToCharacter(character),
        owner: {
          id: character.profile_id,
          username: character.profile_username,
          email: character.profile_email,
          role: character.profile_role
        }
      }));
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting characters with profiles:', error);
      return [];
    }
  }

  // ===== МЕТОДЫ ДЛЯ РАБОТЫ С ЛИЦЕНЗИЯМИ =====

  async getCharacterLicenses(id: string): Promise<any | null> {
    try {
      console.log('[CharacterService] 🔍 Getting character licenses:', id);
      
      const { data: licenses, error } = await supabase
        .rpc('get_character_licenses', { p_character_id: id });

      if (error) {
        console.error('[CharacterService] ❌ Error getting character licenses:', error);
        return null;
      }

      return licenses;
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character licenses:', error);
      return null;
    }
  }

  async updateCharacterLicenses(id: string, licenses: any): Promise<any | null> {
    try {
      console.log('[CharacterService] 🔄 Updating character licenses:', id);
      
      const { data: updatedLicenses, error } = await supabase
        .rpc('update_character_licenses', { 
          p_character_id: id,
          p_new_licenses: licenses
        });

      if (error) {
        console.error('[CharacterService] ❌ Error updating character licenses:', error);
        return null;
      }

      console.log('[CharacterService] ✅ Character licenses updated successfully');
      return updatedLicenses;
    } catch (error) {
      console.error('[CharacterService] ❌ Error updating character licenses:', error);
      return null;
    }
  }

  // ===== МЕТОДЫ ДЛЯ РАБОТЫ С МЕДИЦИНСКОЙ ИНФОРМАЦИЕЙ =====

  async getCharacterMedicalInfo(id: string): Promise<any | null> {
    try {
      console.log('[CharacterService] 🔍 Getting character medical info:', id);
      
      const { data: medicalInfo, error } = await supabase
        .rpc('get_character_medical_info', { p_character_id: id });

      if (error) {
        console.error('[CharacterService] ❌ Error getting character medical info:', error);
        return null;
      }

      return medicalInfo;
    } catch (error) {
      console.error('[CharacterService] ❌ Error getting character medical info:', error);
      return null;
    }
  }

  async updateCharacterMedicalInfo(id: string, medicalInfo: any): Promise<any | null> {
    try {
      console.log('[CharacterService] 🔄 Updating character medical info:', id);
      
      const { data: updatedMedicalInfo, error } = await supabase
        .rpc('update_character_medical_info', { 
          p_character_id: id,
          p_new_medical_info: medicalInfo
        });

      if (error) {
        console.error('[CharacterService] ❌ Error updating character medical info:', error);
        return null;
      }

      console.log('[CharacterService] ✅ Character medical info updated successfully');
      return updatedMedicalInfo;
    } catch (error) {
      console.error('[CharacterService] ❌ Error updating character medical info:', error);
      return null;
    }
  }
}

// Экспортируем единственный экземпляр
export const characterService = new CharacterService(); 