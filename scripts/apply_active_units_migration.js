#!/usr/bin/env node

/**
 * Скрипт для применения миграции active_units
 * Добавляет поле isActive в таблицу active_units
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', 'apps', 'server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Начинаем применение миграции active_units...');

    // Читаем SQL файл миграции
    const migrationPath = join(__dirname, '..', 'migrations', '0004_add_is_active_to_active_units.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Применяем SQL миграцию...');
    
    // Выполняем миграцию
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Ошибка при применении миграции:', error);
      process.exit(1);
    }

    console.log('✅ Миграция active_units успешно применена!');
    
    // Проверяем результат
    console.log('🔍 Проверяем результат...');
    const { data: checkResult, error: checkError } = await supabase
      .from('active_units')
      .select('id, is_active')
      .limit(5);

    if (checkError) {
      console.error('❌ Ошибка при проверке:', checkError);
    } else {
      console.log('📊 Пример записей после миграции:', checkResult);
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
applyMigration(); 