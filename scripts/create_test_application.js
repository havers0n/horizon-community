import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Используем service role key для создания заявки
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestApplication() {
  console.log('📝 Создание тестовой заявки на вступление...\n');

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
    console.log(`✅ Выбран департамент: ${department.name} (ID: ${department.id})`);

    // Создаем тестовую заявку
    const testApplicationData = {
      fullName: "Иванов Иван Иванович",
      birthDate: "1995-05-15",
      departmentId: department.id,
      departmentDescription: "Департамент полиции занимается обеспечением правопорядка, расследованием преступлений и защитой граждан.",
      motivation: "Хочу стать частью команды правоохранительных органов и помогать поддерживать порядок в городе. Имею опыт работы в сфере безопасности и готов к обучению.",
      hasMicrophone: true,
      meetsSystemRequirements: true,
      systemRequirementsLink: "https://example.com/requirements",
      sourceOfInformation: "discord",
      inOtherCommunities: false,
      wasInOtherCommunities: true,
      otherCommunitiesDetails: "Участвовал в ролевых серверах GTA V в течение 2 лет"
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
          comment: 'Заявка создана',
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

    // Создаем уведомление о создании заявки
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: user.id,
        content: `Ваша заявка на вступление в департамент ${department.name} успешно создана и отправлена на рассмотрение.`,
        link: '/applications',
        is_read: false
      });

    if (notificationError) {
      console.log('⚠️ Ошибка создания уведомления:', notificationError.message);
    } else {
      console.log('✅ Создано уведомление о заявке');
    }

    console.log('\n🎉 Тестовая заявка успешно создана!');
    console.log('=====================================');
    console.log(`👤 Пользователь: ${user.email}`);
    console.log(`🏢 Департамент: ${department.name}`);
    console.log(`📝 Заявка ID: ${application.id}`);
    console.log(`📊 Статус: ${application.status}`);
    console.log('=====================================');

  } catch (error) {
    console.log('❌ Ошибка при создании заявки:', error.message);
  }
}

createTestApplication().catch(console.error); 