import { createClient } from '@supabase/supabase-js'

// МАКСИМАЛЬНО ДЕТАЛЬНАЯ ДИАГНОСТИКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
console.log('🔍 === ГЛУБОКАЯ ДИАГНОСТИКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===');
console.log('🔍 import.meta.env:', import.meta.env);
console.log('🔍 import.meta.env.MODE:', import.meta.env.MODE);
console.log('🔍 import.meta.env.DEV:', import.meta.env.DEV);
console.log('🔍 import.meta.env.PROD:', import.meta.env.PROD);
console.log('🔍 import.meta.env.BASE_URL:', import.meta.env.BASE_URL);

// Проверяем ВСЕ возможные варианты переменных
console.log('🔍 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔍 VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('🔍 SUPABASE_URL:', import.meta.env.SUPABASE_URL);
console.log('🔍 SUPABASE_ANON_KEY:', import.meta.env.SUPABASE_ANON_KEY);

// Проверяем, есть ли вообще какие-то VITE_ переменные
const viteEnvVars = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
console.log('🔍 Все VITE_ переменные:', viteEnvVars);

// Проверяем, есть ли вообще какие-то переменные
const allEnvVars = Object.keys(import.meta.env);
console.log('🔍 Все переменные окружения:', allEnvVars);

// Проверяем, что именно undefined
console.log('🔍 VITE_SUPABASE_URL === undefined:', import.meta.env.VITE_SUPABASE_URL === undefined);
console.log('🔍 VITE_SUPABASE_URL === null:', import.meta.env.VITE_SUPABASE_URL === null);
console.log('🔍 VITE_SUPABASE_URL === ""', import.meta.env.VITE_SUPABASE_URL === '');
console.log('🔍 VITE_SUPABASE_URL type:', typeof import.meta.env.VITE_SUPABASE_URL);

console.log('🔍 === ДИАГНОСТИКА ЗАВЕРШЕНА ===');

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axgtvvcimqoyxbfvdrok.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'

console.log('[Supabase Client] Используемый URL:', supabaseUrl);
console.log('[Supabase Client] Используемый ключ:', supabaseAnonKey ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ');

if (!supabaseAnonKey) {
  console.error('[Supabase Client] ❌ КРИТИЧЕСКАЯ ОШИБКА: VITE_SUPABASE_ANON_KEY отсутствует!');
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

console.log('[Supabase Client] ✅ Создание Supabase клиента...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Экспортируем mdtClient как алиас для совместимости
export const mdtClient = supabase

console.log('[Supabase Client] ✅ Supabase клиент создан успешно!');
console.log('[Supabase Client] === ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ==='); 