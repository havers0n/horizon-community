const { createClient } = require('@supabase/supabase-js');

console.log('👤 Создание пользователя с Service Role Key...');

// Используем service role ключ для создания пользователя
const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U'
);

async function createUser() {
  try {
    const email = 'test@example.com';
    const password = 'test123456';
    
    console.log('📧 Email:', email);
    console.log('🔐 Пароль:', password);
    console.log('');
    console.log('🔍 Создание пользователя...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Автоматически подтверждаем email
    });
    
    if (error) {
      console.log('❌ Ошибка создания:', error.message);
      
      if (error.message.includes('already registered')) {
        console.log('💡 Пользователь уже существует, попробуем войти...');
        
        // Создаем клиент с anon ключом для входа
        const anonSupabase = createClient(
          'https://axgtvvcimqoyxbfvdrok.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'
        );
        
        const { data: loginData, error: loginError } = await anonSupabase.auth.signInWithPassword({
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
        console.log('');
        console.log('🧪 Тест токена:');
        console.log(`curl -H "Authorization: Bearer ${loginData.session?.access_token}" http://localhost:5000/api/auth/me`);
      }
      return;
    }
    
    console.log('✅ Пользователь создан!');
    console.log('👤 ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('');
    console.log('🔑 ТОКЕН ДОСТУПА:');
    console.log('=====================================');
    console.log(data.user?.id);
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createUser(); 