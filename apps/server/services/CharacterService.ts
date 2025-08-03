import { SupabaseClient } from '@supabase/supabase-js';
import {
  Database,
  // Импортируем типы из lib/supabase
  Characters,
  CharactersInsert,
  CharactersUpdate,
  LeoProfiles,
  EmsProfiles,
} from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { AppError } from '../utils/AppError';

// Локальные типы для Insert/Update операций
type LeoProfilesInsert = Omit<LeoProfiles, 'created_at' | 'updated_at'>;
type LeoProfilesUpdate = Partial<Omit<LeoProfiles, 'id' | 'created_at' | 'updated_at'>>;
type EmsProfilesInsert = Omit<EmsProfiles, 'created_at' | 'updated_at'>;
type EmsProfilesUpdate = Partial<Omit<EmsProfiles, 'id' | 'created_at' | 'updated_at'>>;

// Комбинированный тип для персонажа со всеми возможными профилями
export type CharacterWithProfiles = Characters & {
  leo_profiles: LeoProfiles | null;
  ems_profiles: EmsProfiles | null;
};

class CharacterService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabase;
  }

  /**
   * Найти персонажа по ID с профилями
   */
  public async findById(id: string): Promise<CharacterWithProfiles | null> {
    const { data, error } = await this.supabase
      .from('characters')
      .select(`
        *,
        leo_profiles(*),
        ems_profiles(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[CharacterService] Error finding by id ${id}:`, error);
      throw new AppError('Ошибка при поиске персонажа.', 500);
    }
    
    // TypeScript может не знать о вложенных объектах, поэтому приводим тип
    return data as unknown as CharacterWithProfiles;
  }

  /**
   * Найти всех персонажей пользователя
   */
  public async findByOwner(ownerId: string): Promise<Characters[]> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      console.error(`[CharacterService] Error finding by owner ${ownerId}:`, error);
      throw new AppError('Ошибка при поиске персонажей пользователя.', 500);
    }
    return data || [];
  }

  /**
   * Создать нового персонажа
   */
  public async create(data: CharactersInsert): Promise<Characters> {
    const { data: newChar, error } = await this.supabase
      .from('characters')
      .insert(data)
      .select()
      .single();
      
    if (error || !newChar) {
      console.error('[CharacterService] Error creating character:', error);
      throw new AppError('Не удалось создать персонажа.', 500);
    }
    return newChar;
  }

  /**
   * Обновить персонажа
   */
  public async update(id: string, data: CharactersUpdate): Promise<Characters> {
    const { data: updatedChar, error } = await this.supabase
      .from('characters')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedChar) {
      console.error(`[CharacterService] Error updating character ${id}:`, error);
      throw new AppError('Не удалось обновить персонажа.', 500);
    }
    return updatedChar;
  }

  /**
   * Удалить персонажа
   */
  public async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[CharacterService] Error deleting character ${id}:`, error);
      throw new AppError('Не удалось удалить персонажа.', 500);
    }
    return true;
  }

  /**
   * Поиск персонажей с фильтрами
   */
  public async search(query: string, limit: number = 10): Promise<Characters[]> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error(`[CharacterService] Error searching characters:`, error);
      throw new AppError('Ошибка при поиске персонажей.', 500);
    }
    return data || [];
  }

  // --- Методы для LEO профилей ---

  /**
   * Создать LEO профиль
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
   * Обновить LEO профиль
   */
  public async updateLeoProfile(characterId: string, data: LeoProfilesUpdate): Promise<LeoProfiles> {
    const { data: updatedProfile, error } = await this.supabase
      .from('leo_profiles')
      .update(data)
      .eq('id', characterId) // Связь 1-к-1, обновляем по ID персонажа
      .select()
      .single();

    if (error || !updatedProfile) {
      console.error(`[CharacterService] Error updating LEO profile for char ${characterId}:`, error);
      throw new AppError('Не удалось обновить LEO профиль.', 500);
    }
    return updatedProfile;
  }

  /**
   * Получить LEO профиль по ID персонажа
   */
  public async getLeoProfile(characterId: string): Promise<LeoProfiles | null> {
    const { data, error } = await this.supabase
      .from('leo_profiles')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[CharacterService] Error getting LEO profile for char ${characterId}:`, error);
      throw new AppError('Ошибка при получении LEO профиля.', 500);
    }
    return data;
  }

  /**
   * Удалить LEO профиль
   */
  public async deleteLeoProfile(characterId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('leo_profiles')
      .delete()
      .eq('id', characterId);

    if (error) {
      console.error(`[CharacterService] Error deleting LEO profile for char ${characterId}:`, error);
      throw new AppError('Не удалось удалить LEO профиль.', 500);
    }
    return true;
  }

  // --- Методы для EMS профилей ---

  /**
   * Создать EMS профиль
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
   * Обновить EMS профиль
   */
  public async updateEmsProfile(characterId: string, data: EmsProfilesUpdate): Promise<EmsProfiles> {
    const { data: updatedProfile, error } = await this.supabase
      .from('ems_profiles')
      .update(data)
      .eq('id', characterId) // Связь 1-к-1, обновляем по ID персонажа
      .select()
      .single();

    if (error || !updatedProfile) {
      console.error(`[CharacterService] Error updating EMS profile for char ${characterId}:`, error);
      throw new AppError('Не удалось обновить EMS профиль.', 500);
    }
    return updatedProfile;
  }

  /**
   * Получить EMS профиль по ID персонажа
   */
  public async getEmsProfile(characterId: string): Promise<EmsProfiles | null> {
    const { data, error } = await this.supabase
      .from('ems_profiles')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[CharacterService] Error getting EMS profile for char ${characterId}:`, error);
      throw new AppError('Ошибка при получении EMS профиля.', 500);
    }
    return data;
  }

  /**
   * Удалить EMS профиль
   */
  public async deleteEmsProfile(characterId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('ems_profiles')
      .delete()
      .eq('id', characterId);

    if (error) {
      console.error(`[CharacterService] Error deleting EMS profile for char ${characterId}:`, error);
      throw new AppError('Не удалось удалить EMS профиль.', 500);
    }
    return true;
  }

  // --- Дополнительные методы ---

  /**
   * Получить количество персонажей пользователя
   */
  public async getCountByOwner(ownerId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('characters')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    if (error) {
      console.error(`[CharacterService] Error getting count for owner ${ownerId}:`, error);
      throw new AppError('Ошибка при получении количества персонажей.', 500);
    }
    return count || 0;
  }

  /**
   * Проверить, существует ли персонаж
   */
  public async exists(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('id', { count: 'exact', head: true })
      .eq('id', id);

    if (error) {
      console.error(`[CharacterService] Error checking existence for ${id}:`, error);
      throw new AppError('Ошибка при проверке существования персонажа.', 500);
    }
    return (data?.length || 0) > 0;
  }

  /**
   * Получить персонажей с пагинацией
   */
  public async getPaginated(page: number = 1, limit: number = 20): Promise<{
    characters: Characters[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [charactersResult, countResult] = await Promise.all([
      this.supabase
        .from('characters')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false }),
      this.supabase
        .from('characters')
        .select('*', { count: 'exact', head: true })
    ]);

    if (charactersResult.error) {
      console.error('[CharacterService] Error getting paginated characters:', charactersResult.error);
      throw new AppError('Ошибка при получении персонажей.', 500);
    }

    if (countResult.error) {
      console.error('[CharacterService] Error getting characters count:', countResult.error);
      throw new AppError('Ошибка при получении количества персонажей.', 500);
    }

    const total = countResult.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      characters: charactersResult.data || [],
      total,
      page,
      totalPages
    };
  }
}

export default new CharacterService(); 