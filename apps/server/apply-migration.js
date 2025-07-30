/**
 * Скрипт для применения миграции базы данных
 * Добавляет поле updated_at в таблицу users
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Применение миграции базы данных...\n');

  try {
    // Читаем SQL файл миграции
    const migrationPath = path.join(process.cwd(), '..', 'supabase', 'migrations', '004_add_updated_at_to_users.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Файл миграции не найден:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Файл миграции найден и загружен');

    // Выполняем миграцию
    console.log('\n1️⃣ Выполнение миграции...');
    
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (migrationError) {
      console.error('❌ Ошибка при выполнении миграции:', migrationError);
      
      // Попробуем выполнить по частям
      console.log('\n🔄 Попытка выполнения по частям...');
      
      const parts = migrationSQL.split(';').filter(part => part.trim());
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (part) {
          console.log(`Выполняем часть ${i + 1}/${parts.length}...`);
          
          const { error: partError } = await supabase.rpc('exec_sql', {
            sql: part + ';'
          });
          
          if (partError) {
            console.error(`❌ Ошибка в части ${i + 1}:`, partError);
          } else {
            console.log(`✅ Часть ${i + 1} выполнена успешно`);
          }
        }
      }
    } else {
      console.log('✅ Миграция выполнена успешно');
    }

    // Проверяем результат
    console.log('\n2️⃣ Проверка результата...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, created_at, updated_at')
      .limit(3);

    if (usersError) {
      console.error('❌ Ошибка при проверке:', usersError);
      return;
    }

    console.log('✅ Проверка успешна');
    console.log('Пример данных пользователей:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Username: ${user.username}`);
      console.log(`    Created: ${user.created_at}`);
      console.log(`    Updated: ${user.updated_at}`);
    });

    console.log('\n🎉 Миграция успешно применена!');
    console.log('Теперь можно перезапускать сервер.');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

applyMigration(); 