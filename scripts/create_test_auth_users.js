import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Используем service role key для создания пользователей
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Тестовые пользователи
const testUsers = [
  {
    email: 'admin@horizon.com',
    password: 'Test1234!',
    username: 'admin',
    role: 'admin',
    department_id: 1,
    rank: 'Chief',
    division: 'Administration'
  },
  {
    email: 'john.doe@horizon.com',
    password: 'Test1234!',
    username: 'john_doe',
    role: 'member',
    department_id: 1,
    rank: 'Officer',
    division: 'Patrol'
  },
  {
    email: 'jane.smith@horizon.com',
    password: 'Test1234!',
    username: 'jane_smith',
    role: 'member',
    department_id: 2,
    rank: 'Firefighter',
    division: 'Rescue'
  },
  {
    email: 'candidate@horizon.com',
    password: 'Test1234!',
    username: 'candidate_test',
    role: 'candidate',
    department_id: null,
    rank: null,
    division: null
  },
  {
    email: 'guest@horizon.com',
    password: 'Test1234!',
    username: 'guest_user',
    role: 'candidate',
    status: 'guest',
    department_id: null,
    rank: null,
    division: null
  },
  {
    email: 'supervisor@horizon.com',
    password: 'Test1234!',
    username: 'supervisor_test',
    role: 'supervisor',
    department_id: 1,
    rank: 'Lieutenant',
    division: 'Administration'
  }
];

async function createTestUsers() {
  console.log('🚀 Создание тестовых пользователей...\n');

  for (const user of testUsers) {
    try {
      // Создаем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username
        }
      });

      if (authError) {
        console.log(`❌ Ошибка создания ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Создан пользователь ${user.email} (auth_id: ${authData.user.id})`);

      // Обновляем запись в таблице users
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          auth_id: authData.user.id,
          role: user.role,
          status: user.status || 'active',
          department_id: user.department_id,
          rank: user.rank,
          division: user.division
        })
        .eq('email', user.email);

      if (updateError) {
        // Если записи нет, создаем новую
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            username: user.username,
            email: user.email,
            password_hash: 'supabase_auth',
            auth_id: authData.user.id,
            role: user.role,
            status: user.status || 'active',
            department_id: user.department_id,
            rank: user.rank,
            division: user.division
          });

        if (insertError) {
          console.log(`⚠️  Не удалось обновить/создать запись в users для ${user.email}:`, insertError.message);
        }
      }

    } catch (error) {
      console.log(`❌ Ошибка при создании ${user.email}:`, error.message);
    }
  }

  console.log('\n📋 Список тестовых пользователей:');
  console.log('=====================================');
  testUsers.forEach(user => {
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Пароль: ${user.password}`);
    console.log(`👤 Логин: ${user.username}`);
    console.log(`🎭 Роль: ${user.role}`);
    if (user.status) {
      console.log(`📌 Статус: ${user.status}`);
    }
    console.log('-------------------------------------');
  });
}

createTestUsers().catch(console.error);
