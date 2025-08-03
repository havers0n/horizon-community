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

// Расширенная тестовая функция для проверки таблицы characters
export async function testCharactersTable() {
  try {
    console.log('[Test] 🔍 Начинаем проверку таблицы characters...');
    
    // Тест 1: Проверяем подключение к базе данных через публичный API
    console.log('[Test] 1️⃣ Проверяем подключение к базе данных через публичный API...');
    try {
      const response = await fetch('http://localhost:5000/api/public/departments');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API returned error');
      }
      
      console.log('[Test] ✅ Подключение к базе данных работает через публичный API');
    } catch (connectionError) {
      console.error('[Test] ❌ Ошибка подключения к базе данных:', connectionError);
      return { success: false, error: 'Connection failed', details: connectionError };
    }
    
    console.log('[Test] ✅ Подключение к базе данных работает');
    
    // Тест 2: Проверяем существование таблицы characters
    console.log('[Test] 2️⃣ Проверяем существование таблицы characters...');
    const { data: charactersTest, error: charactersError } = await supabase
      .from('characters')
      .select('count')
      .limit(1);
    
    if (charactersError) {
      console.error('[Test] ❌ Ошибка при обращении к таблице characters:', charactersError);
      return { success: false, error: 'Characters table error', details: charactersError };
    }
    
    console.log('[Test] ✅ Таблица characters доступна');
    
    // Тест 3: Проверяем количество записей
    console.log('[Test] 3️⃣ Проверяем количество записей в таблице characters...');
    const { count, error: countError } = await supabase
      .from('characters')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('[Test] ❌ Ошибка при подсчете записей:', countError);
      return { success: false, error: 'Count error', details: countError };
    }
    
    console.log(`[Test] ✅ В таблице characters найдено ${count} записей`);
    
    // Тест 4: Проверяем структуру таблицы
    console.log('[Test] 4️⃣ Проверяем структуру таблицы characters...');
    const { data: structureTest, error: structureError } = await supabase
      .from('characters')
      .select('id, first_name, last_name, owner_id')
      .limit(1);
    
    if (structureError) {
      console.error('[Test] ❌ Ошибка при проверке структуры:', structureError);
      return { success: false, error: 'Structure error', details: structureError };
    }
    
    console.log('[Test] ✅ Структура таблицы characters корректна');
    console.log('[Test] ✅ Все тесты пройдены успешно!');
    
    return { 
      success: true, 
      count: count,
      structure: structureTest,
      message: 'Characters table is working correctly' 
    };
    
  } catch (err) {
    console.error('[Test] ❌ Исключение при проверке таблицы characters:', err);
    return { success: false, error: 'Exception', details: err };
  }
}

// Функция для создания тестового персонажа
export async function createTestCharacter() {
  try {
    console.log('[Test] 🧪 Создаем тестового персонажа...');
    
    const testCharacter = {
      owner_id: '00000000-0000-0000-0000-000000000000', // Тестовый UUID
      first_name: 'Test',
      last_name: 'User',
      date_of_birth: '1990-01-01',
      gender: 'male',
      address: '123 Test St, Los Santos',
      phone_number: '+1234567890',
      occupation: 'Civilian'
    };
    
    const { data, error } = await supabase
      .from('characters')
      .insert(testCharacter)
      .select()
      .single();
    
    if (error) {
      console.error('[Test] ❌ Ошибка при создании тестового персонажа:', error);
      return { success: false, error: error };
    }
    
    console.log('[Test] ✅ Тестовый персонаж создан успешно:', data);
    return { success: true, data: data };
    
  } catch (err) {
    console.error('[Test] ❌ Исключение при создании тестового персонажа:', err);
    return { success: false, error: err };
  }
}

console.log('[Supabase Client] ✅ Supabase клиент создан успешно!');
console.log('[Supabase Client] === ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ==='); 