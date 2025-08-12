// apps/server/src/core/services/CharacterService.ts

import { AppError } from '../../utils/AppError';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type Characters = Database['common']['Tables']['characters']['Row'];
type CharactersInsert = Database['common']['Tables']['characters']['Insert'];
type CharactersUpdate = Database['common']['Tables']['characters']['Update'];
type Profiles = Database['public']['Tables']['profiles']['Row'];
type LeoProfiles = never;
type LeoProfilesInsert = never;
type LeoProfilesUpdate = never;
type EmsProfiles = never;
type EmsProfilesInsert = never;
type EmsProfilesUpdate = never;

export class CharacterService {
  constructor(
    private readonly commonDb: SupabaseClient<Database, 'common'>,
    private readonly publicDb: SupabaseClient<Database>
  ) {}

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ С ПЕРСОНАЖАМИ
  // ===========================================

  public async getCharactersByUserId(userId: string): Promise<Characters[]> {
    // Типы db-types для rpc пока не описывают наши функции; приводим к any
    const { data, error } = await (this.commonDb as any).rpc('get_my_characters', { p_user_id: userId });

    if (error) {
      console.error(`[CharacterService] Error fetching characters for user ${userId}:`, error);
      throw new AppError('Ошибка при получении персонажей.', 500);
    }

    const list = (data || []) as Characters[];
    return Array.isArray(list) ? list : [];
  }
  
  public async getCharacterById(id: string): Promise<Characters | null> {
    const { data, error } = await (this.commonDb as any).rpc('get_character_by_id', { p_character_id: id });

    if (error) {
      console.error(`[CharacterService] Error fetching character ${id}:`, error);
      throw new AppError('Ошибка при получении персонажа.', 500);
    }
    const list = (data || []) as Characters[];
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  }
  
  public async createCharacter(characterData: CharactersInsert): Promise<Characters> {
    // Преобразуем данные для RPC функции
    const rpcData = {
      user_id: characterData.user_id, // Используем user_id, как в реальной базе данных
      first_name: characterData.first_name,
      last_name: characterData.last_name,
      date_of_birth: characterData.date_of_birth,
      gender: characterData.gender,
      phone_number: characterData.phone_number,
      address: characterData.address,
      occupation: characterData.occupation,
      ssn: characterData.ssn,
      // Эти поля отсутствуют в текущей схеме — пропускаем
      licenses: (characterData as any).licenses,
      medical_info: (characterData as any).medical_info,
      mugshot_url: characterData.mugshot_url,
      flags: characterData.flags
    };
    
    const { data, error } = await (this.commonDb as any).rpc('create_new_character', { p_data: rpcData });
        
    if (error) {
      console.error('[CharacterService] Error creating character:', error);
      throw new AppError('Не удалось создать персонажа.', 500);
    }
    const list = (data || []) as Characters[];
    if (!Array.isArray(list) || list.length === 0) {
      throw new AppError('Не удалось создать персонажа.', 500);
    }
    return list[0];
  }
  
  public async updateCharacter(id: string, updates: CharactersUpdate): Promise<Characters> {
    // Преобразуем данные для RPC функции
    const rpcData = {
      user_id: updates.user_id, // Оставляем как есть, функция сама обработает
      first_name: updates.first_name,
      last_name: updates.last_name,
      date_of_birth: updates.date_of_birth,
      gender: updates.gender,
      phone_number: updates.phone_number,
      address: updates.address,
      occupation: updates.occupation,
      ssn: updates.ssn,
      licenses: (updates as any).licenses,
      medical_info: (updates as any).medical_info,
      mugshot_url: updates.mugshot_url,
      flags: updates.flags
    };
    
    const { data, error } = await (this.commonDb as any).rpc('update_character', { p_character_id: id, p_updates: rpcData });

    if (error) {
      console.error(`[CharacterService] Error updating character ${id}:`, error);
      throw new AppError('Не удалось обновить персонажа.', 500);
    }
    const list = (data || []) as Characters[];
    if (!Array.isArray(list) || list.length === 0) {
      throw new AppError('Не удалось обновить персонажа.', 500);
    }
    return list[0];
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Удалить персонажа
   */
  public async deleteCharacter(id: string): Promise<void> {
    const { error } = await (this.commonDb as any).rpc('delete_character', { p_character_id: id });

    if (error) {
      console.error(`[CharacterService] Error deleting character ${id}:`, error);
      throw new AppError('Не удалось удалить персонажа.', 500);
    }
  }

  // ===========================================
  // ОПЕРАЦИИ С LEO ПРОФИЛЯМИ (В СХЕМЕ 'common')
  // ===========================================

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Создать LEO профиль
   */
  public async createLeoProfile(data: LeoProfilesInsert): Promise<LeoProfiles> {
    console.log('[DEBUG] CharacterService.createLeoProfile - Используем RPC функцию');
    // Используем SQL запрос для создания LEO профиля
    // TODO: Создать RPC функцию для создания LEO профиля
    console.log('[DEBUG] TODO: Создать RPC функцию для создания LEO профиля');
    throw new AppError('Функция создания LEO профиля пока не реализована.', 501);
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Обновить LEO профиль
   */
  public async updateLeoProfile(characterId: string, data: LeoProfilesUpdate): Promise<LeoProfiles> {
    console.log('[DEBUG] CharacterService.updateLeoProfile - Используем RPC функцию');
    // TODO: Создать RPC функцию для обновления LEO профиля
    console.log('[DEBUG] TODO: Создать RPC функцию для обновления LEO профиля');
    throw new AppError('Функция обновления LEO профиля пока не реализована.', 501);
  }
  
  // ===========================================
  // ОПЕРАЦИИ С EMS ПРОФИЛЯМИ (В СХЕМЕ 'common')
  // ===========================================

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Создать EMS профиль
   */
  public async createEmsProfile(data: EmsProfilesInsert): Promise<EmsProfiles> {
    console.log('[DEBUG] CharacterService.createEmsProfile - Используем RPC функцию');
    // TODO: Создать RPC функцию для создания EMS профиля
    console.log('[DEBUG] TODO: Создать RPC функцию для создания EMS профиля');
    throw new AppError('Функция создания EMS профиля пока не реализована.', 501);
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Обновить EMS профиль
   */
  public async updateEmsProfile(characterId: string, data: EmsProfilesUpdate): Promise<EmsProfiles> {
    console.log('[DEBUG] CharacterService.updateEmsProfile - Используем RPC функцию');
    // TODO: Создать RPC функцию для обновления EMS профиля
    console.log('[DEBUG] TODO: Создать RPC функцию для обновления EMS профиля');
    throw new AppError('Функция обновления EMS профиля пока не реализована.', 501);
  }

  // ===========================================
  // ОПЕРАЦИИ С ПРОФИЛЯМИ ПОЛЬЗОВАТЕЛЕЙ (В СХЕМЕ 'public')
  // ===========================================
  
  public async getProfileByUserId(userId: string): Promise<Profiles | null> {
    console.log('[DEBUG] CharacterService.getProfileByUserId - Используем схему public');
    const { data, error } = await this.publicDb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        if ((error as any).code === 'PGRST116') return null;
        console.error(`[CharacterService] Error fetching profile for user ${userId}:`, error);
        throw new AppError('Ошибка при получении профиля.', 500);
    }
    return data as Profiles;
  }
}