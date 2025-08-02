import { createClient } from '@supabase/supabase-js';
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes
} from '../../../packages/db-types/src/index';

// ===== ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ =====

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// ===== СОЗДАНИЕ SUPABASE КЛИЕНТА =====

/**
 * Основной Supabase клиент с правами администратора
 * Используется для всех серверных операций
 */
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'roleplay-identity-server'
      }
    }
  }
);

// ===== УТИЛИТЫ ДЛЯ РАБОТЫ С БД =====

/**
 * Получение типизированного клиента для конкретной схемы
 */
export function getSchemaClient(schema: 'public' | 'common' | 'mdt') {
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: schema as any
      },
      global: {
        headers: {
          'X-Client-Info': `roleplay-identity-server-${schema}`
        }
      }
    }
  );
}

/**
 * Клиент для работы с публичной схемой
 */
export const publicClient = getSchemaClient('public');

/**
 * Клиент для работы со схемой common
 */
export const commonClient = getSchemaClient('common');

/**
 * Клиент для работы со схемой mdt
 */
export const mdtClient = getSchemaClient('mdt');

// ===== ТИПИЗИРОВАННЫЕ ТАБЛИЦЫ =====

// Публичная схема
export type Profiles = Tables<'profiles'>;
export type Achievements = Tables<'achievements'>;
export type Badges = Tables<'badges'>;
export type UserAchievements = Tables<'user_achievements'>;
export type UserBadges = Tables<'user_badges'>;
export type UserStats = Tables<'user_stats'>;
export type JointPositionsHistory = Tables<'joint_positions_history'>;

// Схема common
export type Characters = Tables<{ schema: 'common' }, 'characters'>;
export type Companies = Tables<{ schema: 'common' }, 'companies'>;
export type CompanyEmployees = Tables<{ schema: 'common' }, 'company_employees'>;
export type Departments = Tables<{ schema: 'common' }, 'departments'>;
export type Divisions = Tables<{ schema: 'common' }, 'divisions'>;
export type LeoProfiles = Tables<{ schema: 'common' }, 'leo_profiles'>;
export type EmsProfiles = Tables<{ schema: 'common' }, 'ems_profiles'>;
export type Ranks = Tables<{ schema: 'common' }, 'ranks'>;
export type Units = Tables<{ schema: 'common' }, 'units'>;
export type Vehicles = Tables<{ schema: 'common' }, 'vehicles'>;
export type Weapons = Tables<{ schema: 'common' }, 'weapons'>;
export type CargoShipments = Tables<{ schema: 'common' }, 'cargo_shipments'>;
export type CharacterCareerHistory = Tables<{ schema: 'common' }, 'character_career_history'>;
export type CharacterQualifications = Tables<{ schema: 'common' }, 'character_qualifications'>;
export type ImpoundLots = Tables<{ schema: 'common' }, 'impound_lots'>;
export type ImpoundedVehicles = Tables<{ schema: 'common' }, 'impounded_vehicles'>;
export type Pets = Tables<{ schema: 'common' }, 'pets'>;
export type Qualifications = Tables<{ schema: 'common' }, 'qualifications'>;

// Схема mdt
export type Applications = Tables<{ schema: 'mdt' }, 'applications'>;
export type Calls = Tables<{ schema: 'mdt' }, 'calls'>;
export type Bolos = Tables<{ schema: 'mdt' }, 'bolos'>;
export type Complaints = Tables<{ schema: 'mdt' }, 'complaints'>;
export type EmsFdReports = Tables<{ schema: 'mdt' }, 'ems_fd_reports'>;
export type LawReports = Tables<{ schema: 'mdt' }, 'law_reports'>;
export type MdtSignals = Tables<{ schema: 'mdt' }, 'mdt_signals'>;
export type MdtSignalNotifications = Tables<{ schema: 'mdt' }, 'mdt_signal_notifications'>;
export type NotebookNotes = Tables<{ schema: 'mdt' }, 'notebook_notes'>;
export type Notifications = Tables<{ schema: 'mdt' }, 'notifications'>;
export type SupportTickets = Tables<{ schema: 'mdt' }, 'support_tickets'>;
export type Tests = Tables<{ schema: 'mdt' }, 'tests'>;
export type TestSessions = Tables<{ schema: 'mdt' }, 'test_sessions'>;
export type TestResults = Tables<{ schema: 'mdt' }, 'test_results'>;
export type UnitsOnDuty = Tables<{ schema: 'mdt' }, 'units_on_duty'>;

// ===== ТИПЫ ДЛЯ INSERT И UPDATE =====

// Публичная схема
export type ProfilesInsert = TablesInsert<'profiles'>;
export type ProfilesUpdate = TablesUpdate<'profiles'>;

// Схема common
export type CharactersInsert = TablesInsert<{ schema: 'common' }, 'characters'>;
export type CharactersUpdate = TablesUpdate<{ schema: 'common' }, 'characters'>;

export type DepartmentsInsert = TablesInsert<{ schema: 'common' }, 'departments'>;
export type DepartmentsUpdate = TablesUpdate<{ schema: 'common' }, 'departments'>;

export type VehiclesInsert = TablesInsert<{ schema: 'common' }, 'vehicles'>;
export type VehiclesUpdate = TablesUpdate<{ schema: 'common' }, 'vehicles'>;

export type WeaponsInsert = TablesInsert<{ schema: 'common' }, 'weapons'>;
export type WeaponsUpdate = TablesUpdate<{ schema: 'common' }, 'weapons'>;

// Схема mdt
export type ApplicationsInsert = TablesInsert<{ schema: 'mdt' }, 'applications'>;
export type ApplicationsUpdate = TablesUpdate<{ schema: 'mdt' }, 'applications'>;

export type BolosInsert = TablesInsert<{ schema: 'mdt' }, 'bolos'>;
export type BolosUpdate = TablesUpdate<{ schema: 'mdt' }, 'bolos'>;

// ===== УТИЛИТЫ ДЛЯ ВАЛИДАЦИИ =====

/**
 * Проверка валидности UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Генерация UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Проверка подключения к Supabase
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
}

// ===== ЭКСПОРТЫ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

// Оставляем старые экспорты для обратной совместимости
// TODO: Удалить после полного рефакторинга всех сервисов

// Эти типы теперь конфликтуют с импортированными, поэтому переименовываем их
export type LegacyTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type LegacyInserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type LegacyUpdates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 