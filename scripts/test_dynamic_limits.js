import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Используем service role key для создания заявок
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDynamicLimits() {
  console.log('🧪 Тестирование динамического обновления лимитов...\n');

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

    console.log(`✅ Пользователь: ${user.email} (ID: ${user.id})`);

    // Получаем первый департамент
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .limit(1);

    if (deptError || !departments || departments.length === 0) {
      console.log('❌ Ошибка получения департаментов:', deptError?.message);
      return;
    }

    const department = departments[0];
    console.log(`✅ Департамент: ${department.name} (ID: ${department.id})`);

    // Проверяем текущие заявки
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data: currentApps, error: appsError } = await supabase
      .from('applications')
      .select('id, type, status, created_at')
      .eq('author_id', user.id)
      .eq('type', 'entry')
      .gte('created_at', currentMonth.toISOString());

    if (appsError) {
      console.log('❌ Ошибка получения заявок:', appsError.message);
      return;
    }

    console.log(`📊 Текущие заявки: ${currentApps.length}/3`);

    // Создаем заявки до достижения лимита
    const appsToCreate = 3 - currentApps.length;
    
    if (appsToCreate <= 0) {
      console.log('✅ Лимит уже достигнут. Создаем еще одну заявку для тестирования...');
    } else {
      console.log(`📝 Создаем ${appsToCreate} заявок для достижения лимита...`);
    }

    // Создаем одну дополнительную заявку
    const testApplicationData = {
      fullName: "Тестовый Пользователь",
      birthDate: "1990-01-01",
      departmentId: department.id,
      departmentDescription: "Тестовое описание департамента",
      motivation: "Тестовая мотивация для проверки динамического обновления лимитов",
      hasMicrophone: true,
      meetsSystemRequirements: true,
      systemRequirementsLink: "https://example.com/requirements",
      sourceOfInformation: "discord",
      inOtherCommunities: false,
      wasInOtherCommunities: false,
      otherCommunitiesDetails: ""
    };

    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        author_id: user.id,
        type: 'entry',
        status: 'pending',
        data: testApplicationData,
        status_history: [{
          status: 'pending',
          date: new Date().toISOString(),
          comment: 'Заявка создана для тестирования динамических лимитов',
          reviewerId: null
        }]
      })
      .select()
      .single();

    if (appError) {
      console.log('❌ Ошибка создания заявки:', appError.message);
      return;
    }

    console.log(`✅ Создана заявка ID: ${application.id}`);

    // Проверяем обновленное количество заявок
    const { data: updatedApps, error: updatedAppsError } = await supabase
      .from('applications')
      .select('id, type, status, created_at')
      .eq('author_id', user.id)
      .eq('type', 'entry')
      .gte('created_at', currentMonth.toISOString());

    if (updatedAppsError) {
      console.log('❌ Ошибка получения обновленных заявок:', updatedAppsError.message);
      return;
    }

    console.log(`📊 Обновленное количество заявок: ${updatedApps.length}/3`);
    
    const isLimitReached = updatedApps.length >= 3;
    console.log(`🎯 Лимит исчерпан: ${isLimitReached ? '❌ ДА' : '✅ НЕТ'}`);

    console.log('\n🎉 Тестирование завершено!');
    console.log('=====================================');
    console.log('💡 Теперь проверьте фронтенд:');
    console.log('1. Откройте http://localhost:5173');
    console.log('2. Войдите как candidate@horizon.com');
    console.log('3. Проверьте, изменилась ли кнопка на "Лимит заявок исчерпан"');
    console.log('4. Нажмите "Обновить" для проверки динамического обновления');
    console.log('=====================================');

  } catch (error) {
    console.log('❌ Ошибка при тестировании:', error.message);
  }
}

testDynamicLimits().catch(console.error); 