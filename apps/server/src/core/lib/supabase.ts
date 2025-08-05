// apps/server/src/core/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Типизируем возможные имена схем из вашего сгенерированного типа Database
type SchemaName = keyof Database;

/**
 * Создает и возвращает новый экземпляр Supabase клиента для указанной схемы.
 * ✅ Делаем функцию generic <S extends SchemaName>
 * @param schema - Имя схемы базы данных ('public', 'mdt', 'common', 'graphql_public').
 */
export const createSupabaseClient = <S extends SchemaName>(schema: S): SupabaseClient<Database, S> => {
  return createClient<Database, S>(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: schema,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Готовый экземпляр Supabase клиента для схемы 'public'
 */
export const supabase = createSupabaseClient('public');

/**
 * Готовый экземпляр Supabase клиента для схемы 'mdt'
 */
export const mdtClient = createSupabaseClient('mdt');