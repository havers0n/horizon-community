const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют необходимые переменные окружения');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyJointMigration() {
  try {
    console.log('🚀 Начинаем применение миграции совмещений...');
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '../supabase/migrations/006_joint_positions_history.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Читаем файл миграции:', migrationPath);
    
    // Применяем миграцию
    console.log('🔧 Применяем миграцию к базе данных...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Ошибка при применении миграции:', error);
      throw error;
    }
    
    console.log('✅ Миграция совмещений успешно применена!');
    
    // Проверяем, что таблица создана
    console.log('🔍 Проверяем создание таблицы...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'joint_positions_history');
    
    if (tablesError) {
      console.error('❌ Ошибка при проверке таблицы:', tablesError);
    } else if (tables && tables.length > 0) {
      console.log('✅ Таблица joint_positions_history успешно создана');
    } else {
      console.log('⚠️  Таблица joint_positions_history не найдена');
    }
    
    // Проверяем функции
    console.log('🔍 Проверяем создание функций...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['check_joint_position_limit', 'get_active_joint_positions']);
    
    if (functionsError) {
      console.error('❌ Ошибка при проверке функций:', functionsError);
    } else if (functions && functions.length > 0) {
      console.log('✅ Функции успешно созданы:', functions.map(f => f.routine_name).join(', '));
    } else {
      console.log('⚠️  Функции не найдены');
    }
    
    console.log('🎉 Миграция совмещений завершена успешно!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка при применении миграции:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
applyJointMigration(); 