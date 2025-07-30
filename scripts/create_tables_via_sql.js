import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTablesViaSQL() {
  try {
    console.log('🔧 Создаем таблицы через SQL запросы...');
    
    // Создаем таблицу departments
    console.log('📋 Создаем таблицу departments...');
    const { data: deptResult, error: deptError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.departments (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            logo_url TEXT,
            description TEXT,
            gallery TEXT[] DEFAULT '{}'
          );
        `
      });

    if (deptError) {
      console.log('ℹ️ Таблица departments уже существует или ошибка:', deptError.message);
    } else {
      console.log('✅ Таблица departments создана');
    }

    // Создаем таблицу characters
    console.log('👤 Создаем таблицу characters...');
    const { data: charResult, error: charError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.characters (
            id SERIAL PRIMARY KEY,
            owner_id UUID NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('civilian', 'leo', 'fire', 'ems')),
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            dob DATE NOT NULL,
            address TEXT NOT NULL,
            insurance_number TEXT NOT NULL UNIQUE,
            licenses JSONB NOT NULL DEFAULT '{}',
            medical_info JSONB NOT NULL DEFAULT '{}',
            mugshot_url TEXT,
            is_unit BOOLEAN NOT NULL DEFAULT FALSE,
            unit_info JSONB,
            department_id INTEGER REFERENCES public.departments(id),
            rank_id INTEGER,
            division_id INTEGER,
            unit_id INTEGER,
            badge_number TEXT,
            employee_id TEXT,
            hire_date DATE,
            termination_date DATE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
          );
        `
      });

    if (charError) {
      console.log('ℹ️ Таблица characters уже существует или ошибка:', charError.message);
    } else {
      console.log('✅ Таблица characters создана');
    }

    // Создаем таблицу bolos
    console.log('🚨 Создаем таблицу bolos...');
    const { data: boloResult, error: boloError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.bolos (
            id BIGSERIAL PRIMARY KEY,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            vehicle TEXT,
            plate TEXT,
            reason TEXT,
            priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
            location TEXT,
            issued_by TEXT,
            timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            additional_info TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          );
        `
      });

    if (boloError) {
      console.log('ℹ️ Таблица bolos уже существует или ошибка:', boloError.message);
    } else {
      console.log('✅ Таблица bolos создана');
    }

    // Создаем таблицу units
    console.log('🚔 Создаем таблицу units...');
    const { data: unitResult, error: unitError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.units (
            id SERIAL PRIMARY KEY,
            character_id INTEGER REFERENCES public.characters(id),
            unit_number VARCHAR NOT NULL,
            department_id INTEGER REFERENCES public.departments(id),
            status VARCHAR DEFAULT 'available',
            location JSONB,
            current_call_id INTEGER,
            partner_id INTEGER REFERENCES public.units(id),
            vehicle_id INTEGER,
            is_panic BOOLEAN DEFAULT FALSE,
            last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
          );
        `
      });

    if (unitError) {
      console.log('ℹ️ Таблица units уже существует или ошибка:', unitError.message);
    } else {
      console.log('✅ Таблица units создана');
    }

    console.log('🎉 Создание таблиц завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createTablesViaSQL(); 