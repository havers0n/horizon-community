import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  try {
    console.log('🔧 Создаем тестового пользователя диспетчера...');
    
    const email = 'dispatcher@test.com';
    const password = 'Test1234!';
    const username = 'test_dispatcher';
    
    // Создаем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Ошибка создания пользователя в Auth:', authError);
      return;
    }
    
    console.log('✅ Пользователь создан в Auth:', authData.user.id);
    
    // Создаем запись в таблице users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        email,
        password_hash: 'dummy_hash_for_auth_users', // Заглушка для пользователей с auth_id
        role: 'Dispatch',
        status: 'active',
        game_warnings: 0,
        admin_warnings: 0,
        auth_id: authData.user.id,
        department_id: 6, // Диспетчерская служба
        rank: 'Dispatcher'
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Ошибка создания пользователя в БД:', userError);
      return;
    }
    
    console.log('✅ Пользователь создан в БД:', userData);
    
    // Создаем персонажа
    const { data: characterData, error: characterError } = await supabaseAdmin
      .from('characters')
      .insert({
        owner_id: userData.id,
        first_name: 'John',
        last_name: 'Doe',
        department_id: 6,
        rank: 'Dispatcher',
        status: 'active',
        insurance_number: 'INS123456',
        address: '123 Main St'
      })
      .select()
      .single();
    
    if (characterError) {
      console.error('❌ Ошибка создания персонажа:', characterError);
      return;
    }
    
    console.log('✅ Персонаж создан:', characterData);
    
    console.log('🎉 Тестовый пользователь создан успешно!');
    console.log('📧 Email:', email);
    console.log('🔑 Пароль:', password);
    console.log('👤 Username:', username);
    console.log('🏢 Департамент: Диспетчерская служба');
    console.log('⭐ Ранг: Dispatcher');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createTestUser(); 