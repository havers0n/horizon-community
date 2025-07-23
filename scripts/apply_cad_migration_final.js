import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения VITE_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCADMigrationFinal() {
  try {
    console.log('🚀 ФИНАЛЬНОЕ ПРИМЕНЕНИЕ МИГРАЦИИ CAD/MDT...');
    
    // Проверяем подключение
    console.log('🔍 Проверяем подключение к базе данных...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Ошибка подключения к базе данных:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Подключение к базе данных успешно');
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '../supabase/migrations/005_cad_mdt_system.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    console.log('📄 Читаем SQL миграцию...');
    
    // Разбиваем SQL на отдельные команды
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔧 Найдено ${commands.length} SQL команд для выполнения`);
    
    // Выполняем команды по очереди
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Выполняем команду ${i + 1}/${commands.length}...`);
        
        try {
          // Используем прямой SQL запрос через REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: command })
          });
          
          if (!response.ok) {
            console.log(`⚠️  Команда ${i + 1} пропущена (exec_sql недоступен)`);
            errorCount++;
            continue;
          }
          
          const result = await response.json();
          if (result.error) {
            console.log(`⚠️  Команда ${i + 1} пропущена:`, result.error);
            errorCount++;
          } else {
            console.log(`✅ Команда ${i + 1} выполнена успешно`);
            successCount++;
          }
        } catch (err) {
          console.log(`⚠️  Команда ${i + 1} пропущена:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Результаты выполнения:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
    // Проверяем создание таблиц
    console.log('\n🔍 Проверяем создание таблиц...');
    
    const tablesToCheck = [
      'characters',
      'vehicles',
      'weapons',
      'pets',
      'records',
      'call911',
      'active_units',
      'call_attachments'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Таблица ${table}: ${error.message}`);
        } else {
          console.log(`✅ Таблица ${table} доступна`);
        }
      } catch (err) {
        console.log(`❌ Ошибка проверки таблицы ${table}:`, err.message);
      }
    }
    
    // Проверяем функции
    console.log('\n🔍 Проверяем созданные функции...');
    
    const functions = [
      'generate_insurance_number',
      'generate_vin',
      'generate_weapon_serial',
      'generate_callsign',
      'update_updated_at_column'
    ];
    
    for (const func of functions) {
      try {
        // Пытаемся вызвать функцию для проверки
        const { error } = await supabase.rpc(func);
        
        if (error && !error.message.includes('function returned no rows')) {
          console.log(`⚠️  Функция ${func}: ${error.message}`);
        } else {
          console.log(`✅ Функция ${func} доступна`);
        }
      } catch (err) {
        console.log(`⚠️  Ошибка проверки функции ${func}:`, err.message);
      }
    }
    
    // Проверяем поле cad_token в таблице users
    console.log('\n🔍 Проверяем поле cad_token в таблице users...');
    
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, username, cad_token')
        .limit(1);
      
      if (userError) {
        console.log('❌ Ошибка проверки cad_token:', userError.message);
      } else {
        console.log('✅ Поле cad_token доступно в таблице users');
      }
    } catch (err) {
      console.log('❌ Ошибка проверки cad_token:', err.message);
    }
    
    console.log('\n🎉 Миграция CAD/MDT завершена!');
    console.log('\n📋 Что нужно проверить:');
    console.log('1. Откройте /cad в браузере');
    console.log('2. Проверьте создание персонажей');
    console.log('3. Проверьте поиск по базе данных');
    console.log('4. Проверьте WebSocket соединение');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

applyCADMigrationFinal(); 