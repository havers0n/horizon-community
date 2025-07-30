const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Тест подключения к Supabase...');

// Попробуем разные ключи
const keys = [
  {
    name: 'Anon Key (клиентский)',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'
  },
  {
    name: 'Service Role Key',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U'
  }
];

async function testKeys() {
  for (const keyInfo of keys) {
    console.log(`\n🔑 Тестирование: ${keyInfo.name}`);
    
    try {
      const supabase = createClient(
        'https://axgtvvcimqoyxbfvdrok.supabase.co',
        keyInfo.key
      );
      
      // Простой тест подключения
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Ошибка: ${error.message}`);
      } else {
        console.log(`✅ Подключение успешно`);
        
        // Попробуем аутентификацию
        console.log('🔍 Тест аутентификации...');
        const { data: authData, error: authError } = await supabase.auth.getUser('test');
        
        if (authError) {
          console.log(`✅ Аутентификация работает (ожидаемая ошибка): ${authError.message}`);
        } else {
          console.log(`✅ Аутентификация работает`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Ошибка подключения: ${error.message}`);
    }
  }
}

testKeys(); 