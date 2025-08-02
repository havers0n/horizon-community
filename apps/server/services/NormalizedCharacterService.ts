import { characterService } from './CharacterService.js';
import {
  Character,
  LeoProfile,
  EmsProfile,
  FireProfile,
  FullCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateLeoProfileRequest,
  UpdateLeoProfileRequest,
  CreateEmsProfileRequest,
  UpdateEmsProfileRequest,
  CreateFireProfileRequest,
  UpdateFireProfileRequest,
  CharacterFilters,
  LeoProfileFilters,
  EmsProfileFilters,
  FireProfileFilters,
  CharacterStats,
  LeoProfileStats,
  EmsProfileStats,
  FireProfileStats,
  ValidationResult,
  LegacyCharacter
} from '../types/normalized-character.types';

// =================================================================
// НОРМАЛИЗОВАННЫЙ CHARACTER SERVICE
// Работает с новой структурой БД: common.characters + профили
// Использует CharacterService с RPC-функциями
// =================================================================

export class NormalizedCharacterService {
  
  // ===== АДАПТЕРЫ ТИПОВ =====

  private adaptCharacterServiceToNormalized(character: any): Character {
    return {
      id: character.id,
      ownerId: character.ownerId,
      firstName: character.firstName,
      lastName: character.lastName,
      dateOfBirth: character.dateOfBirth || undefined,
      gender: character.gender || undefined,
      phoneNumber: character.phoneNumber || undefined,
      address: character.address || undefined,
      occupation: character.occupation || undefined,
      ssn: character.ssn || undefined,
      licenses: character.licenses || undefined,
      medicalInfo: character.medicalInfo || undefined,
      photoUrl: character.mugshotUrl || undefined,
      flags: character.flags || undefined,
      createdAt: character.createdAt || undefined,
      updatedAt: character.updatedAt || undefined
    };
  }

  private adaptCreateRequestToCharacterService(request: CreateCharacterRequest): any {
    return {
      firstName: request.firstName,
      lastName: request.lastName,
      dateOfBirth: request.dateOfBirth,
      gender: request.gender,
      address: request.address,
      phoneNumber: request.phoneNumber,
      occupation: request.occupation,
      mugshotUrl: request.photoUrl,
      ssn: request.ssn,
      licenses: request.licenses,
      medicalInfo: request.medicalInfo,
      flags: request.flags || []
    };
  }

  private adaptUpdateRequestToCharacterService(request: UpdateCharacterRequest): any {
    const updates: any = {};
    
    if (request.firstName !== undefined) updates.firstName = request.firstName;
    if (request.lastName !== undefined) updates.lastName = request.lastName;
    if (request.dateOfBirth !== undefined) updates.dateOfBirth = request.dateOfBirth;
    if (request.gender !== undefined) updates.gender = request.gender;
    if (request.address !== undefined) updates.address = request.address;
    if (request.phoneNumber !== undefined) updates.phoneNumber = request.phoneNumber;
    if (request.occupation !== undefined) updates.occupation = request.occupation;
    if (request.photoUrl !== undefined) updates.mugshotUrl = request.photoUrl;
    if (request.ssn !== undefined) updates.ssn = request.ssn;
    if (request.licenses !== undefined) updates.licenses = request.licenses;
    if (request.medicalInfo !== undefined) updates.medicalInfo = request.medicalInfo;
    if (request.flags !== undefined) updates.flags = request.flags;
    
    return updates;
  }

  // ===== ОСНОВНЫЕ МЕТОДЫ ДЛЯ ПЕРСОНАЖЕЙ =====

  async getCharacter(id: string): Promise<Character | undefined> {
    try {
      const character = await characterService.getCharacter(id);
      if (!character) return undefined;
      
      return this.adaptCharacterServiceToNormalized(character);
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting character:', error);
      return undefined;
    }
  }

  async getFullCharacter(id: string): Promise<FullCharacter | undefined> {
    try {
      const character = await characterService.getCharacter(id);
      if (!character) return undefined;
      
      const fullCharacter: FullCharacter = this.adaptCharacterServiceToNormalized(character);
      
      // TODO: Добавить получение профилей LEO, EMS, FIRE когда будут созданы соответствующие RPC-функции
      // fullCharacter.leoProfile = await this.getLeoProfileByCharacterId(id);
      // fullCharacter.emsProfile = await this.getEmsProfileByCharacterId(id);
      // fullCharacter.fireProfile = await this.getFireProfileByCharacterId(id);
      
      return fullCharacter;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting full character:', error);
      return undefined;
    }
  }

  async getCharactersByOwner(ownerId: string): Promise<Character[]> {
    try {
      const characters = await characterService.getCharactersByOwner(ownerId);
      return characters.map(char => this.adaptCharacterServiceToNormalized(char));
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting characters by owner:', error);
      return [];
    }
  }

  async createCharacter(ownerId: string, character: CreateCharacterRequest): Promise<Character> {
    try {
      console.log('[NormalizedCharacterService] createCharacter called with ownerId:', ownerId);
      
      const characterData = this.adaptCreateRequestToCharacterService(character);
      characterData.ownerId = ownerId;
      
      const newCharacter = await characterService.createCharacter(characterData);
      console.log('[NormalizedCharacterService] Character created successfully');
      
      return this.adaptCharacterServiceToNormalized(newCharacter);
    } catch (error) {
      console.error('[NormalizedCharacterService] Error creating character:', error);
      throw error;
    }
  }

  async updateCharacter(id: string, ownerId: string, updates: UpdateCharacterRequest): Promise<Character | undefined> {
    try {
      const updateData = this.adaptUpdateRequestToCharacterService(updates);
      const updatedCharacter = await characterService.updateCharacter(id, updateData, ownerId);
      
      if (!updatedCharacter) return undefined;
      
      return this.adaptCharacterServiceToNormalized(updatedCharacter);
    } catch (error) {
      console.error('[NormalizedCharacterService] Error updating character:', error);
      return undefined;
    }
  }

  async deleteCharacter(id: string, ownerId: string): Promise<boolean> {
    try {
      // Проверяем, что персонаж принадлежит пользователю
      const character = await characterService.getCharacter(id);
      if (!character || character.ownerId !== ownerId) {
        return false;
      }
      
      return await characterService.deleteCharacter(id);
    } catch (error) {
      console.error('[NormalizedCharacterService] Error deleting character:', error);
      return false;
    }
  }

  async getAllCharacters(): Promise<Character[]> {
    try {
      const characters = await characterService.getAllCharacters();
      return characters.map(char => this.adaptCharacterServiceToNormalized(char));
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting all characters:', error);
      return [];
    }
  }

  // ===== МЕТОДЫ ДЛЯ ПРОФИЛЕЙ LEO =====

  async getLeoProfileByCharacterId(characterId: string): Promise<LeoProfile | undefined> {
    try {
      // TODO: Создать RPC-функцию для получения LEO профиля
      console.warn('[NormalizedCharacterService] getLeoProfileByCharacterId not implemented yet');
      return undefined;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting LEO profile:', error);
      return undefined;
    }
  }

  async createLeoProfile(profile: CreateLeoProfileRequest): Promise<LeoProfile> {
    try {
      // TODO: Создать RPC-функцию для создания LEO профиля
      console.warn('[NormalizedCharacterService] createLeoProfile not implemented yet');
      throw new Error('LEO profile creation not implemented yet');
    } catch (error) {
      console.error('[NormalizedCharacterService] Error creating LEO profile:', error);
      throw error;
    }
  }

  async updateLeoProfile(characterId: string, updates: UpdateLeoProfileRequest): Promise<LeoProfile | undefined> {
    try {
      // TODO: Создать RPC-функцию для обновления LEO профиля
      console.warn('[NormalizedCharacterService] updateLeoProfile not implemented yet');
      return undefined;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error updating LEO profile:', error);
      return undefined;
    }
  }

  async deleteLeoProfile(characterId: string): Promise<boolean> {
    try {
      // TODO: Создать RPC-функцию для удаления LEO профиля
      console.warn('[NormalizedCharacterService] deleteLeoProfile not implemented yet');
      return false;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error deleting LEO profile:', error);
      return false;
    }
  }

  // ===== МЕТОДЫ ДЛЯ ПРОФИЛЕЙ EMS =====

  async getEmsProfileByCharacterId(characterId: string): Promise<EmsProfile | undefined> {
    try {
      // TODO: Создать RPC-функцию для получения EMS профиля
      console.warn('[NormalizedCharacterService] getEmsProfileByCharacterId not implemented yet');
      return undefined;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting EMS profile:', error);
      return undefined;
    }
  }

  async createEmsProfile(profile: CreateEmsProfileRequest): Promise<EmsProfile> {
    try {
      // TODO: Создать RPC-функцию для создания EMS профиля
      console.warn('[NormalizedCharacterService] createEmsProfile not implemented yet');
      throw new Error('EMS profile creation not implemented yet');
    } catch (error) {
      console.error('[NormalizedCharacterService] Error creating EMS profile:', error);
      throw error;
    }
  }

  async updateEmsProfile(characterId: string, updates: UpdateEmsProfileRequest): Promise<EmsProfile | undefined> {
    try {
      // TODO: Создать RPC-функцию для обновления EMS профиля
      console.warn('[NormalizedCharacterService] updateEmsProfile not implemented yet');
      return undefined;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error updating EMS profile:', error);
      return undefined;
    }
  }

  async deleteEmsProfile(characterId: string): Promise<boolean> {
    try {
      // TODO: Создать RPC-функцию для удаления EMS профиля
      console.warn('[NormalizedCharacterService] deleteEmsProfile not implemented yet');
      return false;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error deleting EMS profile:', error);
      return false;
    }
  }

  // ===== МЕТОДЫ ДЛЯ ПРОФИЛЕЙ FIRE =====

  async getFireProfileByCharacterId(characterId: string): Promise<FireProfile | undefined> {
    try {
      // TODO: Создать RPC-функцию для получения FIRE профиля
      console.warn('[NormalizedCharacterService] getFireProfileByCharacterId not implemented yet');
      return undefined;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting FIRE profile:', error);
      return undefined;
    }
  }

  async createFireProfile(profile: CreateFireProfileRequest): Promise<FireProfile> {
    try {
      // TODO: Создать RPC-функцию для создания FIRE профиля
      console.warn('[NormalizedCharacterService] createFireProfile not implemented yet');
      throw new Error('FIRE profile creation not implemented yet');
    } catch (error) {
      console.error('[NormalizedCharacterService] Error creating FIRE profile:', error);
      throw error;
    }
  }

  async updateFireProfile(characterId: string, updates: UpdateFireProfileRequest): Promise<FireProfile | undefined> {
    try {
      // TODO: Создать RPC-функцию для обновления FIRE профиля
      console.warn('[NormalizedCharacterService] updateFireProfile not implemented yet');
      return undefined;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error updating FIRE profile:', error);
      return undefined;
    }
  }

  async deleteFireProfile(characterId: string): Promise<boolean> {
    try {
      // TODO: Создать RPC-функцию для удаления FIRE профиля
      console.warn('[NormalizedCharacterService] deleteFireProfile not implemented yet');
      return false;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error deleting FIRE profile:', error);
      return false;
    }
  }

  // ===== МЕТОДЫ ПОИСКА И ФИЛЬТРАЦИИ =====

  async searchCharacters(query: string, limit: number = 10): Promise<Character[]> {
    try {
      const characters = await characterService.searchCharacters(query, limit);
      return characters.map(char => this.adaptCharacterServiceToNormalized(char));
    } catch (error) {
      console.error('[NormalizedCharacterService] Error searching characters:', error);
      return [];
    }
  }

  async getCharactersWithFilters(filters: CharacterFilters): Promise<Character[]> {
    try {
      const characterFilters = {
        ownerId: filters.ownerId,
        gender: filters.gender,
        occupation: filters.occupation,
        limit: filters.limit,
        offset: filters.offset
      };
      
      const characters = await characterService.getCharactersWithFilters(characterFilters);
      return characters.map(char => this.adaptCharacterServiceToNormalized(char));
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting characters with filters:', error);
      return [];
    }
  }

  // ===== СТАТИСТИКА =====

  async getCharacterCount(): Promise<number> {
    try {
      return await characterService.getCharacterCount();
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting character count:', error);
      return 0;
    }
  }

  async getCharacterCountByOwner(ownerId: string): Promise<number> {
    try {
      return await characterService.getCharacterCountByOwner(ownerId);
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting character count by owner:', error);
      return 0;
    }
  }

  // ===== БИЗНЕС-ЛОГИКА =====

  async getCharacterFullName(id: string): Promise<string | undefined> {
    try {
      const fullName = await characterService.getCharacterFullName(id);
      return fullName === null ? undefined : fullName;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting character full name:', error);
      return undefined;
    }
  }

  async getCharacterAge(id: string): Promise<number | undefined> {
    try {
      const age = await characterService.getCharacterAge(id);
      return age === null ? undefined : age;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting character age:', error);
      return undefined;
    }
  }

  async isCharacterAdult(id: string): Promise<boolean> {
    try {
      return await characterService.isCharacterAdult(id);
    } catch (error) {
      console.error('[NormalizedCharacterService] Error checking if character is adult:', error);
      return false;
    }
  }

  async validateCharacterData(character: CreateCharacterRequest): Promise<ValidationResult> {
    try {
      const characterData = this.adaptCreateRequestToCharacterService(character);
      const result = await characterService.validateCharacterData(characterData);
      return result;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error validating character data:', error);
      return {
        isValid: false,
        errors: ['Validation error occurred']
      };
    }
  }

  async getCharacterLegacyFormat(id: string): Promise<LegacyCharacter | undefined> {
    try {
      const character = await characterService.getCharacter(id);
      if (!character) return undefined;
      
      const legacyCharacter: LegacyCharacter = {
        id: character.id,
        firstName: character.firstName,
        lastName: character.lastName,
        dateOfBirth: character.dateOfBirth || '',
        gender: character.gender || undefined,
        address: character.address || undefined,
        phoneNumber: character.phoneNumber || undefined,
        occupation: character.occupation || undefined,
        photoUrl: character.mugshotUrl || undefined,
        ssn: character.ssn || undefined,
        flags: character.flags || [],
        addressFlags: [], // Пока не поддерживается
        createdAt: character.createdAt || new Date().toISOString(),
        updatedAt: character.updatedAt || new Date().toISOString()
      };
      
      return legacyCharacter;
    } catch (error) {
      console.error('[NormalizedCharacterService] Error getting character in legacy format:', error);
      return undefined;
    }
  }
}

// Экспортируем единственный экземпляр
export const normalizedCharacterService = new NormalizedCharacterService(); 