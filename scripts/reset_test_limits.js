import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Используем service role key для сброса лимитов
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetTestLimits() {
  console.log('🔄 Сброс лимитов заявок для тестовых пользователей...\n');

  try {
    // Получаем пользователя candidate
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', 'candidate@horizon.com')
      .single();

    if (userError) {
      console.log('❌ Ошибка получения пользователя:', userError.message);
      return;
    }

    console.log(`✅ Найден пользователь: ${user.email} (ID: ${user.id})`);

    // Удаляем все заявки на вступление за текущий месяц
    const currentMonth = new Date();
    currentMonth.setDate(1); // Первый день месяца
    currentMonth.setHours(0, 0, 0, 0);

    const { data: deletedApps, error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('author_id', user.id)
      .eq('type', 'entry')
      .gte('created_at', currentMonth.toISOString());

    if (deleteError) {
      console.log('❌ Ошибка удаления заявок:', deleteError.message);
      return;
    }

    console.log(`✅ Удалено заявок на вступление: ${deletedApps?.length || 0}`);

    // Создаем уведомление о сбросе лимитов
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: user.id,
        content: 'Лимиты заявок сброшены для тестирования. Вы можете подать новую заявку на вступление.',
        link: '/dashboard',
        is_read: false
      });

    if (notificationError) {
      console.log('⚠️ Ошибка создания уведомления:', notificationError.message);
    } else {
      console.log('✅ Создано уведомление о сбросе лимитов');
    }

    console.log('\n🎉 Лимиты успешно сброшены!');
    console.log('=====================================');
    console.log(`👤 Пользователь: ${user.email}`);
    console.log(`📝 Теперь можно подать заявку на вступление`);
    console.log('=====================================');

  } catch (error) {
    console.log('❌ Ошибка при сбросе лимитов:', error.message);
  }
}

resetTestLimits().catch(console.error); 