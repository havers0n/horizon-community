const { createClient } = require('@supabase/supabase-js');

console.log('🔑 Вход тестового пользователя...');

// Используем anon ключ для входа
const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'
);

async function login() {
  try {
    const email = 'test@example.com';
    const password = 'test123456';
    
    console.log('📧 Email:', email);
    console.log('🔐 Пароль:', password);
    console.log('');
    console.log('🔍 Попытка входа...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.log('❌ Ошибка входа:', error.message);
      return;
    }
    
    console.log('✅ Вход успешен!');
    console.log('👤 Пользователь:', data.user?.email);
    console.log('🆔 ID:', data.user?.id);
    console.log('');
    console.log('🔑 ТОКЕН ДОСТУПА:');
    console.log('=====================================');
    console.log(data.session?.access_token);
    console.log('=====================================');
    console.log('');
    console.log('🔄 ТОКЕН ОБНОВЛЕНИЯ:');
    console.log('=====================================');
    console.log(data.session?.refresh_token);
    console.log('=====================================');
    console.log('');
    console.log('📅 Срок действия:');
    console.log('   Выдан:', new Date(data.session?.access_token_expires_at * 1000).toISOString());
    console.log('   Истекает:', new Date(data.session?.expires_at * 1000).toISOString());
    console.log('');
    console.log('🧪 Тест токена:');
    console.log(`curl -H "Authorization: Bearer ${data.session?.access_token}" http://localhost:5000/api/auth/me`);
    console.log('');
    console.log('📋 Использование в коде:');
    console.log('Authorization: Bearer ' + data.session?.access_token);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

login(); 