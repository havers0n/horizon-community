// apps/server/src/core/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from 'db-types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Создает и возвращает новый экземпляр Supabase клиента для указанной схемы.
 * @param schema - Имя схемы базы данных ('public', 'mdt', 'common', и т.д.).
 */
// ✅✅✅ ИЗМЕНЕННАЯ СИГНАТУРА С ДЖЕНЕРИКОМ ✅✅✅
export function createSupabaseClient<
  SchemaName extends keyof Database = 'public'
>(schema: SchemaName): SupabaseClient<Database, SchemaName> {
  // Теперь TypeScript понимает, что если на вход пришло 'mdt',
  // то и на выходе будет клиент с типом для 'mdt'.
  return createClient<Database, SchemaName>(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: schema,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}