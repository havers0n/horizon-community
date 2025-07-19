import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugApplications() {
  console.log('🔍 Отладка заявок в базе данных...\n');

  try {
    // Получаем все заявки пользователя candidate
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('author_id', 19);

    if (error) {
      console.log('❌ Ошибка получения заявок:', error.message);
      return;
    }

    console.log(`📊 Найдено заявок: ${applications.length}`);
    console.log('=====================================');

    applications.forEach((app, index) => {
      console.log(`${index + 1}. Заявка ID: ${app.id}`);
      console.log(`   Тип: ${app.type}`);
      console.log(`   Статус: ${app.status}`);
      console.log(`   Создана: ${app.created_at}`);
      console.log(`   Обновлена: ${app.updated_at}`);
      console.log(`   Автор ID: ${app.author_id}`);
      console.log('   ---');
    });

    // Проверяем текущий месяц
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    console.log(`📅 Текущий месяц: ${currentMonth.toISOString()}`);

    // Фильтруем заявки за текущий месяц
    const thisMonthApps = applications.filter(app => 
      new Date(app.created_at) >= currentMonth
    );

    console.log(`📝 Заявок за текущий месяц: ${thisMonthApps.length}`);
    thisMonthApps.forEach((app, index) => {
      console.log(`  ${index + 1}. ID: ${app.id}, Тип: ${app.type}, Создана: ${app.created_at}`);
    });

    // Проверяем заявки на вступление
    const entryApps = thisMonthApps.filter(app => app.type === 'entry');
    console.log(`🎯 Заявок на вступление за месяц: ${entryApps.length}/3`);

    if (entryApps.length >= 3) {
      console.log('❌ Лимит заявок на вступление ИСЧЕРПАН!');
    } else {
      console.log('✅ Лимит заявок на вступление ДОСТУПЕН!');
    }

  } catch (error) {
    console.log('❌ Ошибка при отладке:', error.message);
  }
}

debugApplications().catch(console.error); 