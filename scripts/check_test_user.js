import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTestUser() {
  try {
    console.log('🔍 Проверяем тестового пользователя...');
    
    const email = 'dispatcher@test.com';
    
    // Проверяем в Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Ошибка получения пользователей из Auth:', authError);
      return;
    }
    
    const authUser = authData.users.find(u => u.email === email);
    
    if (authUser) {
      console.log('✅ Пользователь найден в Auth:', authUser.id);
      
              // Проверяем в БД
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();
      
      if (userError) {
        console.log('❌ Пользователь не найден в БД, создаем...');
        
        // Создаем запись в БД
        const { data: newUserData, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            username: 'test_dispatcher',
            email,
            password_hash: 'dummy_hash_for_auth_users',
            role: 'Dispatch',
            status: 'active',
            game_warnings: 0,
            admin_warnings: 0,
            auth_id: authUser.id,
            department_id: 5,
            rank: 'Dispatcher'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Ошибка создания пользователя в БД:', createError);
          return;
        }
        
        console.log('✅ Пользователь создан в БД:', newUserData);
        
        // Создаем персонажа
                  const { data: characterData, error: characterError } = await supabaseAdmin
            .from('characters')
            .insert({
              owner_id: newUserData.id,
              first_name: 'John',
              last_name: 'Doe',
              department_id: 5,
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
        
      } else {
        console.log('✅ Пользователь найден в БД:', userData);
        
        // Проверяем персонажей
        const { data: characters, error: charsError } = await supabaseAdmin
          .from('characters')
          .select('*')
          .eq('owner_id', userData.id);
        
        if (charsError) {
          console.error('❌ Ошибка получения персонажей:', charsError);
          return;
        }
        
        if (characters.length === 0) {
          console.log('❌ Персонажи не найдены, создаем...');
          
          const { data: characterData, error: characterError } = await supabaseAdmin
            .from('characters')
            .insert({
              owner_id: userData.id,
              first_name: 'John',
              last_name: 'Doe',
              department_id: 5,
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
        } else {
          console.log('✅ Персонажи найдены:', characters);
        }
      }
      
    } else {
      console.log('❌ Пользователь не найден в Auth');
    }
    
    console.log('🎉 Проверка завершена!');
    console.log('📧 Email: dispatcher@test.com');
    console.log('🔑 Пароль: Test1234!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkTestUser(); 