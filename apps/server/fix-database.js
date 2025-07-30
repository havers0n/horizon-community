/**
 * Скрипт для исправления структуры базы данных
 * Добавляет поле updated_at в таблицу users
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Загружаем переменные окружения
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔧 Исправление структуры базы данных...\n');

  try {
    // 1. Проверяем текущую структуру таблицы users
    console.log('1️⃣ Проверка текущей структуры таблицы users...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .in('column_name', ['created_at', 'updated_at'])
      .order('column_name');

    if (columnsError) {
      console.error('❌ Ошибка при получении структуры таблицы:', columnsError);
      return;
    }

    console.log('Текущие колонки:', columns.map(c => c.column_name));
    
    const hasUpdatedAt = columns.some(c => c.column_name === 'updated_at');
    
    if (hasUpdatedAt) {
      console.log('✅ Колонка updated_at уже существует');
    } else {
      console.log('❌ Колонка updated_at отсутствует - добавляем...');
    }

    // 2. Добавляем колонку updated_at если её нет
    if (!hasUpdatedAt) {
      console.log('\n2️⃣ Добавление колонки updated_at...');
      
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `
      });

      if (alterError) {
        console.error('❌ Ошибка при добавлении колонки:', alterError);
        return;
      }

      console.log('✅ Колонка updated_at добавлена');
    }

    // 3. Обновляем существующие записи
    console.log('\n3️⃣ Обновление существующих записей...');
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ updated_at: supabase.sql`created_at` })
      .is('updated_at', null);

    if (updateError) {
      console.error('❌ Ошибка при обновлении записей:', updateError);
      return;
    }

    console.log('✅ Существующие записи обновлены');

    // 4. Создаем триггер для автоматического обновления
    console.log('\n4️⃣ Создание триггера для автоматического обновления...');
    
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (triggerError) {
      console.error('❌ Ошибка при создании триггера:', triggerError);
      return;
    }

    console.log('✅ Триггер создан');

    // 5. Проверяем результат
    console.log('\n5️⃣ Проверка результата...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, created_at, updated_at, role, status')
      .limit(3);

    if (usersError) {
      console.error('❌ Ошибка при проверке данных:', usersError);
      return;
    }

    console.log('Пример данных пользователей:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Username: ${user.username}, Updated: ${user.updated_at}`);
    });

    console.log('\n🎉 База данных успешно исправлена!');
    console.log('Теперь можно перезапускать сервер.');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем исправление
fixDatabase(); 