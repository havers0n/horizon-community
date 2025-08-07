import { createClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[DEBUG] Создаем клиенты Supabase...');
console.log('[DEBUG] URL:', supabaseUrl);
console.log('[DEBUG] Service Key (первые 10 символов):', supabaseServiceKey?.slice(0, 10) + '...');

// --- СОЗДАЕМ ОТДЕЛЬНЫЕ КЛИЕНТЫ ДЛЯ КАЖДОЙ СХЕМЫ ---

// Основной клиент для public схемы
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
console.log('[DEBUG] Создан клиент supabase (public схема)');

// Клиент для common схемы
export const commonSupabase = createClient<Database, 'common'>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'common'
  }
});
console.log('[DEBUG] Создан клиент commonSupabase (common схема)');

// Клиент для mdt схемы  
export const mdtSupabase = createClient<Database, 'mdt'>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'mdt'
  },
  global: {
    headers: {
      'X-Schema': 'mdt'
    }
  }
});
console.log('[DEBUG] Создан клиент mdtSupabase (mdt схема)');

// --- ДОБАВЛЯЕМ ОТЛАДОЧНУЮ ИНФОРМАЦИЮ ---
(supabase as any).__SCHEMA = 'PUBLIC';
(commonSupabase as any).__SCHEMA = 'COMMON';
(mdtSupabase as any).__SCHEMA = 'MDT';

console.log('[DEBUG] Supabase clients have been tagged with schema names.');
console.log('[DEBUG] supabase.__SCHEMA:', (supabase as any).__SCHEMA);
console.log('[DEBUG] commonSupabase.__SCHEMA:', (commonSupabase as any).__SCHEMA);
console.log('[DEBUG] mdtSupabase.__SCHEMA:', (mdtSupabase as any).__SCHEMA);

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