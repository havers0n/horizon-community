require('dotenv').config({ path: '../../.env' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Получение нового токена...');

// Создаем клиент с anon ключом для аутентификации
const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'
);

async function getNewToken() {
  try {
    console.log('🔑 Попытка входа...');
    
    // Попробуем войти с учетными данными
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danypetrov2000@gmail.com',
      password: 'your_password_here' // Замените на реальный пароль
    });
    
    if (error) {
      console.log('❌ Ошибка входа:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 Возможные решения:');
        console.log('   1. Проверьте правильность email и пароля');
        console.log('   2. Убедитесь, что пользователь существует в Supabase');
        console.log('   3. Проверьте, что email подтвержден');
      }
      
      return;
    }
    
    console.log('✅ Вход успешен!');
    console.log('👤 Пользователь ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('');
    console.log('🔑 НОВЫЙ ТОКЕН ДОСТУПА:');
    console.log(data.session?.access_token);
    console.log('');
    console.log('🔄 ТОКЕН ОБНОВЛЕНИЯ:');
    console.log(data.session?.refresh_token);
    console.log('');
    console.log('📅 Срок действия токена:');
    console.log('   Выдан:', new Date(data.session?.access_token_expires_at * 1000).toISOString());
    console.log('   Истекает:', new Date(data.session?.expires_at * 1000).toISOString());
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

getNewToken(); 