import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Используем service role key для проверки лимитов
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserLimits() {
  console.log('🔍 Проверка лимитов пользователя...\n');

  try {
    // Получаем пользователя candidate
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, role')
      .eq('email', 'candidate@horizon.com')
      .single();

    if (userError) {
      console.log('❌ Ошибка получения пользователя:', userError.message);
      return;
    }

    console.log(`✅ Пользователь: ${user.email} (ID: ${user.id}, Роль: ${user.role})`);

    // Получаем все заявки пользователя за текущий месяц
    const currentMonth = new Date();
    currentMonth.setDate(1); // Первый день месяца
    currentMonth.setHours(0, 0, 0, 0);

    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, type, status, created_at')
      .eq('author_id', user.id)
      .gte('created_at', currentMonth.toISOString());

    if (appsError) {
      console.log('❌ Ошибка получения заявок:', appsError.message);
      return;
    }

    console.log(`\n📊 Заявки за текущий месяц (${currentMonth.toLocaleDateString()}):`);
    console.log('=====================================');
    
    const entryApps = applications.filter(app => app.type === 'entry');
    const leaveApps = applications.filter(app => app.type === 'leave');
    
    console.log(`📝 Заявки на вступление: ${entryApps.length}/3`);
    entryApps.forEach(app => {
      console.log(`  - ID: ${app.id}, Статус: ${app.status}, Дата: ${new Date(app.created_at).toLocaleDateString()}`);
    });
    
    console.log(`📋 Заявки на отпуск: ${leaveApps.length}/2`);
    leaveApps.forEach(app => {
      console.log(`  - ID: ${app.id}, Статус: ${app.status}, Дата: ${new Date(app.created_at).toLocaleDateString()}`);
    });

    console.log(`📈 Всего заявок: ${applications.length}`);
    
    // Проверяем лимиты
    const entryLimitReached = entryApps.length >= 3;
    const leaveLimitReached = leaveApps.length >= 2;
    
    console.log('\n🎯 Статус лимитов:');
    console.log('=====================================');
    console.log(`📝 Вступление (3/месяц): ${entryLimitReached ? '❌ ИСЧЕРПАН' : '✅ Доступно'}`);
    console.log(`📋 Отпуск (2/месяц): ${leaveLimitReached ? '❌ ИСЧЕРПАН' : '✅ Доступно'}`);
    
    if (entryLimitReached) {
      console.log(`\n💡 Для сброса лимитов выполните: node scripts/reset_test_limits.js`);
    }

  } catch (error) {
    console.log('❌ Ошибка при проверке лимитов:', error.message);
  }
}

checkUserLimits().catch(console.error); 