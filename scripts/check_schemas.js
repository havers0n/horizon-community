import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchemas() {
  try {
    console.log('🔍 Проверяем схемы в базе данных...');
    
    // Проверяем таблицы в схеме common
    console.log('\n📋 Схема common:');
    try {
      const { data: commonTables, error: commonError } = await supabaseAdmin
        .from('common.users')
        .select('count')
        .limit(1);
      
      if (commonError) {
        console.log('❌ common.users: не существует');
      } else {
        console.log('✅ common.users: существует');
      }
    } catch (err) {
      console.log('❌ common.users: не существует');
    }
    
    try {
      const { data: commonDepts, error: commonDeptError } = await supabaseAdmin
        .from('common.departments')
        .select('count')
        .limit(1);
      
      if (commonDeptError) {
        console.log('❌ common.departments: не существует');
      } else {
        console.log('✅ common.departments: существует');
      }
    } catch (err) {
      console.log('❌ common.departments: не существует');
    }
    
    try {
      const { data: commonChars, error: commonCharError } = await supabaseAdmin
        .from('common.characters')
        .select('count')
        .limit(1);
      
      if (commonCharError) {
        console.log('❌ common.characters: не существует');
      } else {
        console.log('✅ common.characters: существует');
      }
    } catch (err) {
      console.log('❌ common.characters: не существует');
    }
    
    // Проверяем таблицы в схеме mdt
    console.log('\n📋 Схема mdt:');
    try {
      const { data: mdtBolos, error: mdtBoloError } = await supabaseAdmin
        .from('mdt.bolos')
        .select('count')
        .limit(1);
      
      if (mdtBoloError) {
        console.log('❌ mdt.bolos: не существует');
      } else {
        console.log('✅ mdt.bolos: существует');
      }
    } catch (err) {
      console.log('❌ mdt.bolos: не существует');
    }
    
    try {
      const { data: mdtUnits, error: mdtUnitError } = await supabaseAdmin
        .from('mdt.units')
        .select('count')
        .limit(1);
      
      if (mdtUnitError) {
        console.log('❌ mdt.units: не существует');
      } else {
        console.log('✅ mdt.units: существует');
      }
    } catch (err) {
      console.log('❌ mdt.units: не существует');
    }
    
    // Проверяем таблицы в схеме public
    console.log('\n📋 Схема public:');
    try {
      const { data: publicUsers, error: publicUserError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      if (publicUserError) {
        console.log('❌ public.users: не существует');
      } else {
        console.log('✅ public.users: существует');
      }
    } catch (err) {
      console.log('❌ public.users: не существует');
    }
    
    try {
      const { data: publicApps, error: publicAppError } = await supabaseAdmin
        .from('applications')
        .select('count')
        .limit(1);
      
      if (publicAppError) {
        console.log('❌ public.applications: не существует');
      } else {
        console.log('✅ public.applications: существует');
      }
    } catch (err) {
      console.log('❌ public.applications: не существует');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkSchemas(); 