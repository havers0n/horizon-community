import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchemasDetailed() {
  try {
    console.log('🔍 Проверяем схемы и таблицы...');
    
    // Проверяем схему public
    console.log('\n📋 Схема public:');
    const publicTables = ['users', 'applications', 'departments', 'characters', 'bolos', 'units'];
    
    for (const table of publicTables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: существует`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }
    
    // Проверяем схему common
    console.log('\n📋 Схема common:');
    const commonTables = ['departments', 'characters', 'units', 'vehicles'];
    
    for (const table of commonTables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(`common.${table}`)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: существует`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }
    
    // Проверяем схему mdt
    console.log('\n📋 Схема mdt:');
    const mdtTables = ['bolos', 'mdt_units', 'mdt_calls_911', 'active_units'];
    
    for (const table of mdtTables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(`mdt.${table}`)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: существует`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }
    
    // Проверяем количество записей в существующих таблицах
    console.log('\n📊 Количество записей:');
    
    try {
      const { count: usersCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });
      console.log(`  👥 Пользователи: ${usersCount || 0}`);
    } catch (err) {
      console.log(`  👥 Пользователи: ошибка - ${err.message}`);
    }
    
    try {
      const { count: deptCount } = await supabaseAdmin
        .from('common.departments')
        .select('*', { count: 'exact', head: true });
      console.log(`  🏢 Департаменты (common): ${deptCount || 0}`);
    } catch (err) {
      console.log(`  🏢 Департаменты (common): ошибка - ${err.message}`);
    }
    
    try {
      const { count: boloCount } = await supabaseAdmin
        .from('mdt.bolos')
        .select('*', { count: 'exact', head: true });
      console.log(`  🚨 BOLO: ${boloCount || 0}`);
    } catch (err) {
      console.log(`  🚨 BOLO: ошибка - ${err.message}`);
    }
    
    try {
      const { count: unitCount } = await supabaseAdmin
        .from('mdt.mdt_units')
        .select('*', { count: 'exact', head: true });
      console.log(`  🚔 Юниты: ${unitCount || 0}`);
    } catch (err) {
      console.log(`  🚔 Юниты: ошибка - ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkSchemasDetailed(); 