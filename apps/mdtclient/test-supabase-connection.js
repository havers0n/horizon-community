// Тестовый скрипт для проверки Supabase подключения
import { createClient } from '@supabase/supabase-js'

console.log('=== ТЕСТ SUPABASE ПОДКЛЮЧЕНИЯ ===');

// Те же переменные, что и в .env файле
const supabaseUrl = 'https://axgtvvcimqoyxbfvdrok.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'

console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);

try {
  console.log('Создание Supabase клиента...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('Тестирование подключения...');
  
  // Простой тест подключения
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('❌ Ошибка подключения:', error);
  } else {
    console.log('✅ Подключение успешно!');
    console.log('Данные:', data);
  }
  
} catch (err) {
  console.error('❌ Критическая ошибка:', err);
}

console.log('=== ТЕСТ ЗАВЕРШЕН ==='); 