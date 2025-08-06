// apps/server/src/core/services/CharacterService.ts

import { AppError } from '../../utils/AppError';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type Characters = Database['common']['Tables']['characters']['Row'];
type CharactersInsert = Database['common']['Tables']['characters']['Insert'];
type CharactersUpdate = Database['common']['Tables']['characters']['Update'];
type Profiles = Database['public']['Tables']['profiles']['Row'];
type LeoProfiles = Database['common']['Tables']['leo_profiles']['Row'];
type LeoProfilesInsert = Database['common']['Tables']['leo_profiles']['Insert'];
type LeoProfilesUpdate = Database['common']['Tables']['leo_profiles']['Update'];
type EmsProfiles = Database['common']['Tables']['ems_profiles']['Row'];
type EmsProfilesInsert = Database['common']['Tables']['ems_profiles']['Insert'];
type EmsProfilesUpdate = Database['common']['Tables']['ems_profiles']['Update'];


export class CharacterService {
  // Конструктор не нужен

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ С ПЕРСОНАЖАМИ
  // ===========================================

  public async getCharactersByUserId(userId: string): Promise<Characters[]> {
    console.log('[DEBUG] CharacterService.getCharactersByUserId - Используем RPC функцию get_my_characters');
    
    // Создаем НОВЫЙ клиент прямо здесь
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    console.log('[DEBUG] Создан свежий клиент с URL:', supabaseUrl);
    console.log('[DEBUG] Используем RPC функцию get_my_characters');
    console.log('[DEBUG] Ищем персонажей для пользователя:', userId);
    
    // Используем RPC функцию для доступа к схеме common
    const { data, error } = await freshSupabase
      .rpc('get_my_characters', { p_user_id: userId });

    if (error) {
      console.error(`[CharacterService] Error fetching characters for user ${userId}:`, error);
      throw new AppError('Ошибка при получении персонажей.', 500);
    }
    
    console.log('[DEBUG] Получено персонажей:', data?.length || 0);
    return data || [];
  }
  
  public async getCharacterById(id: string): Promise<Characters | null> {
    console.log('[DEBUG] CharacterService.getCharacterById - Используем RPC функцию get_character_by_id');
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { data, error } = await freshSupabase
      .rpc('get_character_by_id', { p_character_id: id });

    if (error) {
      console.error(`[CharacterService] Error fetching character ${id}:`, error);
      throw new AppError('Ошибка при получении персонажа.', 500);
    }
    
    return data?.[0] || null;
  }
  
  public async createCharacter(characterData: CharactersInsert): Promise<Characters> {
    console.log('[DEBUG] CharacterService.createCharacter - Используем RPC функцию create_new_character');
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
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
      licenses: characterData.licenses,
      medical_info: characterData.medical_info,
      mugshot_url: characterData.mugshot_url,
      flags: characterData.flags
    };
    
    const { data, error } = await freshSupabase
      .rpc('create_new_character', { p_data: rpcData });
      
    if (error || !data || data.length === 0) {
      console.error('[CharacterService] Error creating character:', error);
      throw new AppError('Не удалось создать персонажа.', 500);
    }
    return data[0];
  }
  
  public async updateCharacter(id: string, updates: CharactersUpdate): Promise<Characters> {
    console.log('[DEBUG] CharacterService.updateCharacter - Используем RPC функцию update_character');
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
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
      licenses: updates.licenses,
      medical_info: updates.medical_info,
      mugshot_url: updates.mugshot_url,
      flags: updates.flags
    };
    
    const { data, error } = await freshSupabase
      .rpc('update_character', { p_character_id: id, p_updates: rpcData });

    if (error || !data || data.length === 0) {
      console.error(`[CharacterService] Error updating character ${id}:`, error);
      throw new AppError('Не удалось обновить персонажа.', 500);
    }
    return data[0];
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Удалить персонажа
   */
  public async deleteCharacter(id: string): Promise<void> {
    console.log('[DEBUG] CharacterService.deleteCharacter - Используем RPC функцию delete_character');
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { error } = await freshSupabase
      .rpc('delete_character', { p_character_id: id });

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
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
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
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
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
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // TODO: Создать RPC функцию для создания EMS профиля
    console.log('[DEBUG] TODO: Создать RPC функцию для создания EMS профиля');
    throw new AppError('Функция создания EMS профиля пока не реализована.', 501);
  }

  /**
   * ✅ ДОБАВЛЕН МЕТОД: Обновить EMS профиль
   */
  public async updateEmsProfile(characterId: string, data: EmsProfilesUpdate): Promise<EmsProfiles> {
    console.log('[DEBUG] CharacterService.updateEmsProfile - Используем RPC функцию');
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // TODO: Создать RPC функцию для обновления EMS профиля
    console.log('[DEBUG] TODO: Создать RPC функцию для обновления EMS профиля');
    throw new AppError('Функция обновления EMS профиля пока не реализована.', 501);
  }

  // ===========================================
  // ОПЕРАЦИИ С ПРОФИЛЯМИ ПОЛЬЗОВАТЕЛЕЙ (В СХЕМЕ 'public')
  // ===========================================
  
  public async getProfileByUserId(userId: string): Promise<Profiles | null> {
    console.log('[DEBUG] CharacterService.getProfileByUserId - Используем схему public');
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const freshSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { data, error } = await freshSupabase
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