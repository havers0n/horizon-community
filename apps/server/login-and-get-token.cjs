const { createClient } = require('@supabase/supabase-js');

console.log('🔑 Вход в систему для получения токена...');

const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'
);

async function login() {
  try {
    console.log('📧 Email: danypetrov2000@gmail.com');
    console.log('🔐 Введите пароль:');
    
    // Здесь нужно ввести пароль
    const password = 'your_password_here'; // Замените на ваш пароль
    
    console.log('🔍 Попытка входа...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danypetrov2000@gmail.com',
      password: password
    });
    
    if (error) {
      console.log('❌ Ошибка входа:', error.message);
      console.log('');
      console.log('💡 Возможные причины:');
      console.log('   - Неверный пароль');
      console.log('   - Email не подтвержден');
      console.log('   - Пользователь не существует');
      console.log('');
      console.log('🔧 Решения:');
      console.log('   1. Проверьте пароль');
      console.log('   2. Создайте нового пользователя');
      console.log('   3. Сбросьте пароль через Supabase Dashboard');
      return;
    }
    
    console.log('✅ Вход успешен!');
    console.log('👤 Пользователь:', data.user?.email);
    console.log('');
    console.log('🔑 НОВЫЙ ТОКЕН ДОСТУПА:');
    console.log('=====================================');
    console.log(data.session?.access_token);
    console.log('=====================================');
    console.log('');
    console.log('📋 Как использовать:');
    console.log('1. Скопируйте токен выше');
    console.log('2. Используйте его в заголовке Authorization:');
    console.log('   Authorization: Bearer [ВАШ_ТОКЕН]');
    console.log('');
    console.log('🧪 Тест токена:');
    console.log(`curl -H "Authorization: Bearer ${data.session?.access_token}" http://localhost:5000/api/auth/me`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

login(); 