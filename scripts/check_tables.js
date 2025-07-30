import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('🔍 Проверяем таблицы в базе данных...');
    
    // Получаем список всех таблиц
    const { data: tables, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Ошибка получения таблиц:', error);
      return;
    }
    
    console.log('📋 Таблицы в базе данных:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Проверяем конкретные таблицы
    const importantTables = ['users', 'characters', 'departments', 'applications', 'reports'];
    
    console.log('\n🔍 Проверяем важные таблицы:');
    for (const tableName of importantTables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName}: существует`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkTables(); 