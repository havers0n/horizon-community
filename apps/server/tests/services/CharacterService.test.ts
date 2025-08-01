import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CharacterService } from '../../services/CharacterService';
import { SupabaseStorage } from '../../services/SupabaseStorage';
import { Character, InsertCharacter, UpdateCharacter, User } from '@roleplay-identity/shared-types';

// Мокаем SupabaseStorage
jest.mock('../../services/SupabaseStorage');

describe('CharacterService', () => {
  let characterService: CharacterService;
  let mockStorage: jest.Mocked<SupabaseStorage>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'Citizen' as any,
    avatarUrl: 'https://example.com/avatar.jpg',
    isActive: true,
    isVerified: true,
    lastLoginAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockCharacter: Character = {
    id: '1',
    userId: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    nationality: 'American',
    address: '123 Main St',
    phoneNumber: '+1234567890',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/character.jpg',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockInsertCharacter: InsertCharacter = {
    userId: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    nationality: 'American',
    address: '123 Main St',
    phoneNumber: '+1234567890',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/character.jpg'
  };

  beforeEach(() => {
    mockStorage = new SupabaseStorage() as jest.Mocked<SupabaseStorage>;
    characterService = new CharacterService(mockStorage);
  });

  describe('createCharacter', () => {
    it('should create a character successfully', async () => {
      mockStorage.insert.mockResolvedValue(mockCharacter);

      const result = await characterService.createCharacter(mockInsertCharacter);

      expect(mockStorage.insert).toHaveBeenCalledWith('characters', mockInsertCharacter);
      expect(result).toEqual(mockCharacter);
    });

    it('should throw error if user not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      await expect(characterService.createCharacter(mockInsertCharacter)).rejects.toThrow(
        'Пользователь не найден или неактивен'
      );
    });

    it('should throw error if user is inactive', async () => {
      mockStorage.getById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(characterService.createCharacter(mockInsertCharacter)).rejects.toThrow(
        'Пользователь не найден или неактивен'
      );
    });
  });

  describe('getCharacterById', () => {
    it('should return character by id', async () => {
      mockStorage.getById.mockResolvedValue(mockCharacter);

      const result = await characterService.getCharacterById('1');

      expect(mockStorage.getById).toHaveBeenCalledWith('characters', '1');
      expect(result).toEqual(mockCharacter);
    });

    it('should return null if character not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await characterService.getCharacterById('999');

      expect(result).toBeNull();
    });
  });

  describe('getCharactersByUser', () => {
    it('should return characters by user id', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.list.mockResolvedValue(mockCharacters);

      const result = await characterService.getCharactersByUser('1');

      expect(mockStorage.list).toHaveBeenCalledWith('characters', { userId: '1', isActive: true });
      expect(result).toEqual(mockCharacters);
    });
  });

  describe('getAllCharacters', () => {
    it('should return all active characters', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.list.mockResolvedValue(mockCharacters);

      const result = await characterService.getAllCharacters();

      expect(mockStorage.list).toHaveBeenCalledWith('characters', { isActive: true });
      expect(result).toEqual(mockCharacters);
    });
  });

  describe('updateCharacter', () => {
    it('should update character successfully', async () => {
      const updateData: UpdateCharacter = {
        firstName: 'Jane',
        lastName: 'Smith'
      };
      const updatedCharacter = { ...mockCharacter, ...updateData };
      mockStorage.update.mockResolvedValue(updatedCharacter);

      const result = await characterService.updateCharacter('1', updateData);

      expect(mockStorage.update).toHaveBeenCalledWith('characters', '1', updateData);
      expect(result).toEqual(updatedCharacter);
    });

    it('should throw error if character not found', async () => {
      mockStorage.update.mockRejectedValue(new Error('Character not found'));

      await expect(characterService.updateCharacter('999', { firstName: 'Test' })).rejects.toThrow(
        'Character not found'
      );
    });
  });

  describe('deleteCharacter', () => {
    it('should soft delete character', async () => {
      mockStorage.update.mockResolvedValue({ ...mockCharacter, isActive: false });

      await characterService.deleteCharacter('1');

      expect(mockStorage.update).toHaveBeenCalledWith('characters', '1', { isActive: false });
    });
  });

  describe('searchCharacters', () => {
    it('should search characters by query', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.search.mockResolvedValue(mockCharacters);

      const result = await characterService.searchCharacters('john');

      expect(mockStorage.search).toHaveBeenCalledWith('characters', 'john', ['firstName', 'lastName', 'phoneNumber', 'email']);
      expect(result).toEqual(mockCharacters);
    });
  });

  describe('getCharactersWithDetails', () => {
    it('should return characters with user details', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.list.mockResolvedValue(mockCharacters);
      mockStorage.getById.mockResolvedValue(mockUser);

      const result = await characterService.getCharactersWithDetails();

      expect(result).toEqual([{
        ...mockCharacter,
        user: mockUser
      }]);
    });
  });

  describe('getCharacterWithDetails', () => {
    it('should return character with user details', async () => {
      mockStorage.getById
        .mockResolvedValueOnce(mockCharacter) // character
        .mockResolvedValueOnce(mockUser);     // user

      const result = await characterService.getCharacterWithDetails('1');

      expect(result).toEqual({
        ...mockCharacter,
        user: mockUser
      });
    });

    it('should return null if character not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await characterService.getCharacterWithDetails('999');

      expect(result).toBeNull();
    });
  });

  describe('getCharacterStats', () => {
    it('should return character statistics', async () => {
      mockStorage.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // active
        .mockResolvedValueOnce(50)  // male
        .mockResolvedValueOnce(30); // female

      const result = await characterService.getCharacterStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        byGender: {
          male: 50,
          female: 30,
          other: 0
        }
      });
    });
  });

  describe('getUserCharacterStats', () => {
    it('should return user character statistics', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.list.mockResolvedValue(mockCharacters);

      const result = await characterService.getUserCharacterStats('1');

      expect(result).toEqual({
        total: 1,
        active: 1,
        byGender: {
          male: 1,
          female: 0,
          other: 0
        }
      });
    });
  });

  describe('getCharacterActivity', () => {
    it('should return character activity statistics', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      mockStorage.count
        .mockResolvedValueOnce(20)  // newCharacters
        .mockResolvedValueOnce(10); // updatedCharacters

      const result = await characterService.getCharacterActivity(30);

      expect(result).toEqual({
        newCharacters: 20,
        updatedCharacters: 10
      });
    });
  });

  describe('validateCharacterData', () => {
    it('should validate character data correctly', () => {
      const result = characterService.validateCharacterData(mockInsertCharacter);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        ...mockInsertCharacter,
        firstName: '',
        phoneNumber: 'invalid'
      };

      const result = characterService.validateCharacterData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = '1990-01-01';
      const age = characterService.calculateAge(birthDate);

      const expectedAge = new Date().getFullYear() - 1990;
      expect(age).toBe(expectedAge);
    });

    it('should handle future birth dates', () => {
      const futureDate = '2030-01-01';
      const age = characterService.calculateAge(futureDate);

      expect(age).toBeLessThan(0);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone number correctly', () => {
      const phone = '+1234567890';
      const formatted = characterService.formatPhoneNumber(phone);

      expect(formatted).toBe('+1 (234) 567-890');
    });

    it('should handle invalid phone numbers', () => {
      const invalidPhone = 'invalid';
      const formatted = characterService.formatPhoneNumber(invalidPhone);

      expect(formatted).toBe(invalidPhone);
    });
  });

  describe('exportCharacterData', () => {
    it('should export character data for specific user', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.list.mockResolvedValue(mockCharacters);

      const result = await characterService.exportCharacterData('1');

      expect(result).toEqual(mockCharacters);
    });

    it('should export all character data when no userId provided', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.list.mockResolvedValue(mockCharacters);

      const result = await characterService.exportCharacterData();

      expect(result).toEqual(mockCharacters);
    });
  });

  describe('importCharacterData', () => {
    it('should import character data successfully', async () => {
      const mockCharacters = [mockCharacter];
      mockStorage.insert.mockResolvedValue(mockCharacter);
      mockStorage.getById.mockResolvedValue(mockUser);

      const result = await characterService.importCharacterData([mockInsertCharacter]);

      expect(result).toEqual(mockCharacters);
    });

    it('should handle import errors gracefully', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await characterService.importCharacterData([mockInsertCharacter]);

      expect(result).toEqual([]);
    });
  });
}); 