/**
 * Простой скрипт для проверки структуры базы данных
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Проверка структуры базы данных...\n');

  try {
    // Проверяем таблицу users
    console.log('1️⃣ Проверка таблицы users...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Ошибка при доступе к таблице users:', usersError.message);
      
      if (usersError.message.includes('updated_at')) {
        console.log('\n🔧 Проблема найдена: отсутствует поле updated_at');
        console.log('Выполните SQL скрипт fix-users-table.sql в Supabase SQL Editor');
      }
      
      return;
    }

    console.log('✅ Таблица users доступна');
    console.log('Колонки:', Object.keys(users[0] || {}));

    // Проверяем есть ли updated_at
    if (users[0] && 'updated_at' in users[0]) {
      console.log('✅ Поле updated_at существует');
    } else {
      console.log('❌ Поле updated_at отсутствует');
      console.log('Необходимо выполнить миграцию базы данных');
    }

    // Проверяем AuthService
    console.log('\n2️⃣ Проверка AuthService...');
    
    try {
      const { data: testUser, error: testError } = await supabase
        .from('users')
        .select('id, username, email, created_at, updated_at')
        .limit(1);

      if (testError) {
        console.error('❌ Ошибка в AuthService:', testError.message);
      } else {
        console.log('✅ AuthService работает корректно');
        console.log('Пример пользователя:', testUser[0]);
      }
    } catch (error) {
      console.error('❌ Критическая ошибка в AuthService:', error.message);
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

checkDatabase(); 