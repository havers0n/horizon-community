import { createClient } from '@supabase/supabase-js'

// СТРОГАЯ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ДЛЯ БЕЗОПАСНОСТИ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// КРИТИЧЕСКАЯ ПРОВЕРКА БЕЗОПАСНОСТИ
if (!supabaseUrl) {
  console.error('[SECURITY] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_URL отсутствует!')
  throw new Error('VITE_SUPABASE_URL environment variable is required')
}

if (!supabaseAnonKey) {
  console.error('[SECURITY] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_ANON_KEY отсутствует!')
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
