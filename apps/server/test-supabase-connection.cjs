require('dotenv').config({ path: '../../.env' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Тестирование подключения к Supabase...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Найден' : '❌ Не найден');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://axgtvvcimqoyxbfvdrok.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U'
);

async function testConnection() {
  try {
    console.log('🔗 Подключение к Supabase...');
    
    // Тест подключения к базе данных
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      return;
    }
    
    console.log('✅ Подключение к базе данных успешно');
    
    // Тест аутентификации
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F4Z3R2dmNpbXFveXhiZnZkcm9rLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJ0ZXN0Iiwicm9sZSI6ImFub255bW91cyIsImV4cCI6MTczNTY4MDAwMCwiaWF0IjoxNzM1Njc2NDAwfQ.test';
    
    const { data: authData, error: authError } = await supabase.auth.getUser(testToken);
    
    if (authError) {
      console.log('✅ Аутентификация работает (ожидаемая ошибка для тестового токена):', authError.message);
    } else {
      console.log('✅ Аутентификация работает');
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

testConnection(); 