const { createClient } = require('@supabase/supabase-js');

console.log('👤 Создание нового пользователя...');

// Используем правильный anon ключ
const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'
);

async function createUser() {
  try {
    const email = 'test@example.com';
    const password = 'test123456';
    
    console.log('📧 Email:', email);
    console.log('🔐 Пароль:', password);
    console.log('');
    console.log('🔍 Создание пользователя...');
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) {
      console.log('❌ Ошибка создания:', error.message);
      
      if (error.message.includes('already registered')) {
        console.log('💡 Пользователь уже существует, попробуем войти...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (loginError) {
          console.log('❌ Ошибка входа:', loginError.message);
          return;
        }
        
        console.log('✅ Вход успешен!');
        console.log('👤 Пользователь:', loginData.user?.email);
        console.log('');
        console.log('🔑 ТОКЕН ДОСТУПА:');
        console.log('=====================================');
        console.log(loginData.session?.access_token);
        console.log('=====================================');
      }
      return;
    }
    
    console.log('✅ Пользователь создан!');
    console.log('👤 ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('');
    console.log('📧 Проверьте email для подтверждения аккаунта');
    console.log('После подтверждения используйте этот скрипт для входа');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createUser(); 