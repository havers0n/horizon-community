// Отключаем проверку TLS сертификатов для тестирования
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Жестко задаем переменные окружения для тестирования
process.env.SUPABASE_URL = 'https://axgtvvcimqoyxbfvdrok.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDMxMTcxNywiZXhwIjoyMDM1ODg3Nzc3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

import { SupabaseStorage } from './services/SupabaseStorage.ts';

async function testSupabaseDirect() {
  console.log('🔍 Testing SupabaseStorage directly...');
  
  try {
    const storage = new SupabaseStorage();
    
    // Тестируем подключение к базе данных
    console.log('📡 Testing database connection...');
    
    // Попробуем получить всех пользователей
    const users = await storage.getAllUsers();
    console.log(`✅ Successfully connected! Found ${users.length} users`);
    
    // Попробуем найти пользователя по email
    const testUser = await storage.getUserByEmail('danypetrov2000@gmail.com');
    if (testUser) {
      console.log(`✅ Found test user: ${testUser.username} (${testUser.email})`);
      console.log(`🎭 Role: ${testUser.role}`);
      console.log(`📊 Status: ${testUser.status}`);
    } else {
      console.log('⚠️ Test user not found');
    }
    
    // Попробуем найти пользователя по auth_id
    const authUser = await storage.getUserByAuthId('test-auth-id');
    if (authUser) {
      console.log(`✅ Found auth user: ${authUser.username}`);
    } else {
      console.log('⚠️ Auth user not found (expected)');
    }
    
    console.log('✅ SupabaseStorage direct test completed successfully!');
    
  } catch (error) {
    console.error('❌ SupabaseStorage direct test failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

testSupabaseDirect().catch(console.error); 