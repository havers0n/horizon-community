import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPublicTables() {
  try {
    console.log('🔍 Проверяем таблицы в схеме public...');
    
    // Проверяем таблицу users
    try {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ users: не существует');
      } else {
        console.log('✅ users: существует');
      }
    } catch (err) {
      console.log('❌ users: не существует');
    }
    
    // Проверяем таблицу characters
    try {
      const { data: chars, error } = await supabaseAdmin
        .from('characters')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ characters: не существует');
      } else {
        console.log('✅ characters: существует');
      }
    } catch (err) {
      console.log('❌ characters: не существует');
    }
    
    // Проверяем таблицу departments
    try {
      const { data: depts, error } = await supabaseAdmin
        .from('departments')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ departments: не существует');
      } else {
        console.log('✅ departments: существует');
      }
    } catch (err) {
      console.log('❌ departments: не существует');
    }
    
    // Проверяем таблицу applications
    try {
      const { data: apps, error } = await supabaseAdmin
        .from('applications')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ applications: не существует');
      } else {
        console.log('✅ applications: существует');
      }
    } catch (err) {
      console.log('❌ applications: не существует');
    }
    
    // Проверяем таблицу bolos
    try {
      const { data: bolos, error } = await supabaseAdmin
        .from('bolos')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ bolos: не существует');
      } else {
        console.log('✅ bolos: существует');
      }
    } catch (err) {
      console.log('❌ bolos: не существует');
    }
    
    // Проверяем таблицу units
    try {
      const { data: units, error } = await supabaseAdmin
        .from('units')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ units: не существует');
      } else {
        console.log('✅ units: существует');
      }
    } catch (err) {
      console.log('❌ units: не существует');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkPublicTables(); 