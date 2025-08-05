// apps/server/src/api/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Создает и возвращает новый экземпляр Supabase клиента для указанной схемы.
 * @param schema - Имя схемы базы данных ('public', 'mdt', 'common', и т.д.).
 */
export function createSupabaseClient(schema: string) {
  return createClient(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: schema,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Готовый экземпляр Supabase клиента для схемы 'public'
 */
export const supabase = createSupabaseClient('public'); 