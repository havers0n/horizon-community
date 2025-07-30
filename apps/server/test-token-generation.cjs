require('dotenv').config({ path: '../../.env' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Тестирование генерации токена...');

const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U'
);

async function testTokenGeneration() {
  try {
    // Попробуем войти с существующими учетными данными
    console.log('🔍 Попытка входа с учетными данными...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danypetrov2000@gmail.com',
      password: 'test123456'
    });
    
    if (error) {
      console.log('❌ Ошибка входа:', error.message);
      
      // Попробуем создать нового пользователя
      console.log('🔍 Попытка создания нового пользователя...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'test123456'
      });
      
      if (signUpError) {
        console.log('❌ Ошибка создания пользователя:', signUpError.message);
      } else {
        console.log('✅ Пользователь создан:', signUpData.user?.id);
        console.log('📧 Проверьте email для подтверждения');
      }
    } else {
      console.log('✅ Вход успешен!');
      console.log('👤 Пользователь ID:', data.user?.id);
      console.log('🔑 Токен доступа:', data.session?.access_token);
      console.log('🔄 Токен обновления:', data.session?.refresh_token);
      
      // Тестируем токен
      console.log('🔍 Тестирование полученного токена...');
      const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);
      
      if (userError) {
        console.log('❌ Ошибка проверки токена:', userError.message);
      } else {
        console.log('✅ Токен работает правильно!');
        console.log('👤 Проверенный пользователь:', userData.user?.email);
      }
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

testTokenGeneration(); 