import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Логирование подключения Supabase
console.log('🔧 [Personal Cabinet] Проверка переменных окружения Supabase:')
console.log('🔧 [Personal Cabinet] VITE_SUPABASE_URL:', supabaseUrl ? '✅ Установлен' : '❌ Отсутствует')
console.log('🔧 [Personal Cabinet] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Установлен' : '❌ Отсутствует')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🔴 [Personal Cabinet] ОШИБКА: Отсутствуют переменные окружения Supabase!')
  console.error('🔴 [Personal Cabinet] Убедитесь, что в файле .env установлены:')
  console.error('🔴 [Personal Cabinet] - VITE_SUPABASE_URL')
  console.error('🔴 [Personal Cabinet] - VITE_SUPABASE_ANON_KEY')
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ [Personal Cabinet] Supabase клиент успешно инициализирован')

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 