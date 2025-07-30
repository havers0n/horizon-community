require('dotenv').config({ path: '../../.env' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Тестирование аутентификации Supabase...');

const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U'
);

async function testAuth() {
  try {
    // Тест с неверным токеном
    const invalidToken = 'invalid.token.here';
    
    console.log('🔍 Тестирование с неверным токеном...');
    const { data, error } = await supabase.auth.getUser(invalidToken);
    
    if (error) {
      console.log('✅ Ожидаемая ошибка для неверного токена:', error.message);
    } else {
      console.log('❌ Неожиданный успех для неверного токена');
    }
    
    // Тест с пустым токеном
    console.log('🔍 Тестирование с пустым токеном...');
    const { data: data2, error: error2 } = await supabase.auth.getUser('');
    
    if (error2) {
      console.log('✅ Ожидаемая ошибка для пустого токена:', error2.message);
    } else {
      console.log('❌ Неожиданный успех для пустого токена');
    }
    
    console.log('✅ Тесты аутентификации завершены');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testAuth(); 