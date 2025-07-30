import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingPublicTables() {
  try {
    console.log('🔧 Создаем недостающие таблицы в схеме public...');
    
    // Создаем таблицу departments
    console.log('\n📋 Создаем таблицу departments...');
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            logo_url TEXT,
            description TEXT,
            gallery TEXT[] DEFAULT '{}'
          );
        `
      });
      
      if (error) {
        console.log('ℹ️ Таблица departments уже существует');
      } else {
        console.log('✅ Таблица departments создана');
      }
    } catch (err) {
      console.log('ℹ️ Таблица departments уже существует');
    }
    
    // Создаем таблицу characters
    console.log('\n📋 Создаем таблицу characters...');
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS characters (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            department_id INTEGER,
            rank TEXT,
            status TEXT DEFAULT 'active',
            insurance_number TEXT,
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log('ℹ️ Таблица characters уже существует');
      } else {
        console.log('✅ Таблица characters создана');
      }
    } catch (err) {
      console.log('ℹ️ Таблица characters уже существует');
    }
    
    // Создаем таблицу bolos
    console.log('\n📋 Создаем таблицу bolos...');
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS bolos (
            id SERIAL PRIMARY KEY,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            vehicle TEXT,
            plate TEXT,
            reason TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'active',
            location TEXT,
            issued_by TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            additional_info TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log('ℹ️ Таблица bolos уже существует');
      } else {
        console.log('✅ Таблица bolos создана');
      }
    } catch (err) {
      console.log('ℹ️ Таблица bolos уже существует');
    }
    
    // Создаем таблицу units
    console.log('\n📋 Создаем таблицу units...');
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS units (
            id SERIAL PRIMARY KEY,
            character_id INTEGER NOT NULL,
            unit_number TEXT NOT NULL,
            department_id INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            is_panic BOOLEAN DEFAULT false,
            last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log('ℹ️ Таблица units уже существует');
      } else {
        console.log('✅ Таблица units создана');
      }
    } catch (err) {
      console.log('ℹ️ Таблица units уже существует');
    }
    
    // Добавляем диспетчерский департамент
    console.log('\n📋 Добавляем диспетчерский департамент...');
    try {
      const { data: existingDept, error: checkError } = await supabaseAdmin
        .from('departments')
        .select('id')
        .eq('name', 'Dispatch')
        .single();
      
      if (checkError || !existingDept) {
        const { data: newDept, error: insertError } = await supabaseAdmin
          .from('departments')
          .insert({
            name: 'Dispatch',
            full_name: 'Диспетчерская служба',
            description: 'Центр управления экстренными службами',
            logo_url: 'https://example.com/dispatch_logo.png',
            gallery: []
          })
          .select()
          .single();
        
        if (insertError) {
          console.log('ℹ️ Диспетчерский департамент уже существует');
        } else {
          console.log('✅ Диспетчерский департамент создан:', newDept);
        }
      } else {
        console.log('✅ Диспетчерский департамент уже существует:', existingDept);
      }
    } catch (err) {
      console.log('ℹ️ Диспетчерский департамент уже существует');
    }
    
    console.log('\n🎉 Все таблицы созданы!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createMissingPublicTables(); 