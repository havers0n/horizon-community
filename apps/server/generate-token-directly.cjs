const { createClient } = require('@supabase/supabase-js');

console.log('🔑 Генерация токена напрямую...');

// Используем service role ключ
const supabase = createClient(
  'https://axgtvvcimqoyxbfvdrok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U'
);

async function generateToken() {
  try {
    const userId = '06c72184-62e6-41f8-ac88-03e007ac37f8'; // ID созданного пользователя
    
    console.log('👤 Пользователь ID:', userId);
    console.log('🔍 Генерация токена...');
    
    // Создаем токен для пользователя
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: 'test@example.com'
    });
    
    if (error) {
      console.log('❌ Ошибка генерации токена:', error.message);
      
      // Попробуем другой способ - создадим сессию
      console.log('🔍 Попытка создания сессии...');
      
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
        user_id: userId
      });
      
      if (sessionError) {
        console.log('❌ Ошибка создания сессии:', sessionError.message);
        return;
      }
      
      console.log('✅ Сессия создана!');
      console.log('🔑 ТОКЕН ДОСТУПА:');
      console.log('=====================================');
      console.log(sessionData.session?.access_token);
      console.log('=====================================');
      console.log('');
      console.log('🧪 Тест токена:');
      console.log(`curl -H "Authorization: Bearer ${sessionData.session?.access_token}" http://localhost:5000/api/auth/me`);
      
    } else {
      console.log('✅ Токен создан!');
      console.log('🔗 Ссылка:', data.properties?.action_link);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

generateToken(); 