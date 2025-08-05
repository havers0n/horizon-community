// apps/server/tests/services/CharacterService.test.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
// ✅ ИСПОЛЬЗУЕМ ПОЛНЫЙ АЛИАС
import characterService from '@roleplay-identity/server/src/core/services/CharacterService';
import { createSupabaseClient } from '@roleplay-identity/server/src/core/lib/supabase';
// ✅ ИСПОЛЬЗУЕМ ПОЛНЫЙ АЛИАС
import type { Characters, CharactersInsert, CharactersUpdate } from '@roleplay-identity/db-types';

// ✅✅✅ УМНЫЙ МОК ✅✅✅
// Мы мокаем модуль и явно указываем, что createSupabaseClient - это jest.Mock
jest.mock('@roleplay-identity/server/src/core/lib/supabase');
const mockedCreateSupabaseClient = createSupabaseClient as jest.Mock;

describe('CharacterService', () => {
  // Создаем "скелеты" для каждого типа клиента, который нам нужен
  let mockCommonClient: any;
  let mockPublicClient: any;

  const mockCharacter: Characters = {
    id: 'char-uuid-123',
    owner_id: 'user-uuid-456', // ✅ ИСПРАВЛЕНО
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: new Date().toISOString(),
    gender: 'male',
    address: null,
    flags: null,
    licenses: null,
    medical_info: null,
    mugshot_url: null,
    occupation: null,
    phone_number: null,
    ssn: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Настраиваем скелет для клиента 'common'
    mockCommonClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    // Настраиваем скелет для клиента 'public'
    mockPublicClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    // ✅✅✅ ГЛАВНОЕ ИЗМЕНЕНИЕ ✅✅✅
    // Учим наш мок вести себя по-разному в зависимости от аргумента
    mockedCreateSupabaseClient.mockImplementation((schema: any) => {
      if (schema === 'common') {
        return mockCommonClient;
      }
      if (schema === 'public') {
        return mockPublicClient;
      }
      // Возвращаем дефолтный мок для других случаев, чтобы избежать ошибок
      return { from: jest.fn() }; 
    });
  });

  it('getCharacterById должен вызывать select на клиенте "common"', async () => {
    // Настраиваем поведение для КОНКРЕТНОГО клиента
    mockCommonClient.single.mockResolvedValue({ data: mockCharacter, error: null });

    const result = await characterService.getCharacterById('char-uuid-123');

    // Проверяем вызовы на КОНКРЕТНОМ клиенте
    expect(mockCommonClient.from).toHaveBeenCalledWith('characters');
    expect(mockCommonClient.eq).toHaveBeenCalledWith('id', 'char-uuid-123');
    expect(result).toEqual(mockCharacter);
  });
  it('createCharacter должен вызывать insert с правильными данными', async () => {
    const newCharacterData: CharactersInsert = {
      owner_id: 'user-uuid-456', // ✅ ИСПРАВЛЕНО
      first_name: 'Jane',
      last_name: 'Doe',
    };
    // Настраиваем `single()` для возврата созданного персонажа
    mockCommonClient.single.mockResolvedValue({ data: { id: 'new-char-uuid', ...newCharacterData }, error: null });

    await characterService.createCharacter(newCharacterData);

    expect(mockCommonClient.from).toHaveBeenCalledWith('characters');
    expect(mockCommonClient.insert).toHaveBeenCalledWith(newCharacterData);
    expect(mockCommonClient.select).toHaveBeenCalled();
    expect(mockCommonClient.single).toHaveBeenCalled();
  });

  it('updateCharacter должен вызывать update с правильными данными', async () => {
    const updates: CharactersUpdate = { first_name: 'Johnathan' };
    mockCommonClient.single.mockResolvedValue({ data: { ...mockCharacter, ...updates }, error: null });

    await characterService.updateCharacter('char-uuid-123', updates);

    expect(mockCommonClient.from).toHaveBeenCalledWith('characters');
    expect(mockCommonClient.update).toHaveBeenCalledWith(updates);
    expect(mockCommonClient.eq).toHaveBeenCalledWith('id', 'char-uuid-123');
    expect(mockCommonClient.select).toHaveBeenCalled();
    expect(mockCommonClient.single).toHaveBeenCalled();
  });
}); 