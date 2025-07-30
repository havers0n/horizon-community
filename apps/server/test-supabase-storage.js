// Отключаем проверку TLS сертификатов для тестирования
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import 'dotenv/config';
import { SupabaseStorage } from './services/SupabaseStorage.ts';

async function testSupabaseStorage() {
  console.log('🔍 Testing SupabaseStorage...');
  
  try {
    const storage = new SupabaseStorage();
    
    // Тестируем подключение к базе данных
    console.log('📡 Testing database connection...');
    
    // Попробуем получить всех пользователей
    const users = await storage.getAllUsers();
    console.log(`✅ Successfully connected! Found ${users.length} users`);
    
    // Попробуем получить все департаменты
    const departments = await storage.getAllDepartments();
    console.log(`✅ Found ${departments.length} departments`);
    
    // Попробуем найти пользователя по email
    const testUser = await storage.getUserByEmail('danypetrov2000@gmail.com');
    if (testUser) {
      console.log(`✅ Found test user: ${testUser.username} (${testUser.email})`);
    } else {
      console.log('⚠️ Test user not found');
    }
    
    console.log('✅ SupabaseStorage test completed successfully!');
    
  } catch (error) {
    console.error('❌ SupabaseStorage test failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

testSupabaseStorage().catch(console.error); 