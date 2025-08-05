// apps/server/src/core/services/CharacterService.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// ✅ Импортируем ВСЕ нужные типы, включая профили
import type {
  Database,
  Characters,
  CharactersInsert,
  CharactersUpdate,
  Profiles,
  LeoProfiles,
  LeoProfilesInsert,
  LeoProfilesUpdate,
  EmsProfiles,
  EmsProfilesInsert,
  EmsProfilesUpdate,
} from '@roleplay-identity/db-types';


export class CharacterService {
  // ✅ Указываем, что основной клиент работает со схемой 'common'
  private supabase: SupabaseClient<Database, 'common'>;
  // ✅ Создаем отдельный клиент для работы со схемой 'public' (для профилей пользователей)
  private publicSupabase: SupabaseClient<Database, 'public'>;

  constructor() {
    this.supabase = createSupabaseClient('common');
    this.publicSupabase = createSupabaseClient('public');
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ С ПЕРСОНАЖАМИ
  // ===========================================

  public async getCharactersByUserId(userId: string): Promise<Characters[]> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .eq('owner_id', userId); // ✅ ИСПРАВЛЕНО

    if (error) {
      console.error(`[CharacterService] Error fetching characters for user ${userId}:`, error);
      throw new AppError('Ошибка при получении персонажей.', 500);
    }
    return data || [];
  }
  
  public async getCharacterById(id: string): Promise<Characters | null> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[CharacterService] Error fetching character ${id}:`, error);
      throw new AppError('Ошибка при получении персонажа.', 500);
    }
    return data;
  }
  
  public async createCharacter(characterData: CharactersInsert): Promise<Characters> {
    const { data, error } = await this.supabase
      .from('characters')
      .insert(characterData)
      .select()
      .single();

    if (error || !data) {
      console.error('[CharacterService] Error creating character:', error);
      throw new AppError('Не удалось создать персонажа.', 500);
    }
    return data;
  }
  
  public async updateCharacter(id: string, updates: CharactersUpdate): Promise<Characters> {
    const { data, error } = await this.supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`[CharacterService] Error updating character ${id}:`, error);
      throw new AppError('Не удалось обновить персонажа.', 500);
    }
    return data;
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Удалить персонажа
   */
  public async deleteCharacter(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('characters')
      .delete()
      .eq('id', id);

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
    const { data: newProfile, error } = await this.supabase
      .from('leo_profiles')
      .insert(data)
      .select()
      .single();

    if (error || !newProfile) {
      console.error('[CharacterService] Error creating LEO profile:', error);
      throw new AppError('Не удалось создать LEO профиль.', 500);
    }
    return newProfile;
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Обновить LEO профиль
   */
  public async updateLeoProfile(characterId: string, data: LeoProfilesUpdate): Promise<LeoProfiles> {
    const result = await (this.supabase as any)
      .from('leo_profiles')
      .update(data)
      .eq('character_id', characterId)
      .select()
      .single();

    if (result.error || !result.data) {
      console.error(`[CharacterService] Error updating LEO profile for char ${characterId}:`, result.error);
      throw new AppError('Не удалось обновить LEO профиль.', 500);
    }
    return result.data;
  }
  
  // ===========================================
  // ОПЕРАЦИИ С EMS ПРОФИЛЯМИ (В СХЕМЕ 'common')
  // ===========================================

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Создать EMS профиль
   */
  public async createEmsProfile(data: EmsProfilesInsert): Promise<EmsProfiles> {
    const { data: newProfile, error } = await this.supabase
      .from('ems_profiles')
      .insert(data)
      .select()
      .single();

    if (error || !newProfile) {
      console.error('[CharacterService] Error creating EMS profile:', error);
      throw new AppError('Не удалось создать EMS профиль.', 500);
    }
    return newProfile;
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Обновить EMS профиль
   */
  public async updateEmsProfile(characterId: string, data: EmsProfilesUpdate): Promise<EmsProfiles> {
    const result = await (this.supabase as any)
      .from('ems_profiles')
      .update(data)
      .eq('character_id', characterId)
      .select()
      .single();

    if (result.error || !result.data) {
      console.error(`[CharacterService] Error updating EMS profile for char ${characterId}:`, result.error);
      throw new AppError('Не удалось обновить EMS профиль.', 500);
    }
    return result.data;
  }

  // ===========================================
  // ОПЕРАЦИИ С ПРОФИЛЯМИ ПОЛЬЗОВАТЕЛЕЙ (В СХЕМЕ 'public')
  // ===========================================
  
  public async getProfileByUserId(userId: string): Promise<Profiles | null> {
    const { data, error } = await this.publicSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error(`[CharacterService] Error fetching profile for user ${userId}:`, error);
        throw new AppError('Ошибка при получении профиля.', 500);
    }
    return data;
  }
}