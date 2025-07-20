#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCADMigration() {
  console.log('🚀 Применение миграции CAD/MDT системы...');
  
  try {
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_cad_mdt_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Файл миграции не найден:', migrationPath);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Чтение файла миграции...');
    
    // Применяем миграцию
    console.log('🔧 Применение миграции к базе данных...');
    
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Ошибка при применении миграции:', error);
      process.exit(1);
    }
    
    console.log('✅ Миграция CAD/MDT успешно применена!');
    
    // Проверяем созданные таблицы
    console.log('🔍 Проверка созданных таблиц...');
    
    const tables = [
      'characters',
      'vehicles', 
      'weapons',
      'pets',
      'records',
      'call911',
      'active_units',
      'call_attachments'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️  Таблица ${table}: ${error.message}`);
        } else {
          console.log(`✅ Таблица ${table} доступна`);
        }
      } catch (err) {
        console.warn(`⚠️  Ошибка проверки таблицы ${table}:`, err.message);
      }
    }
    
    // Проверяем функции
    console.log('🔍 Проверка созданных функций...');
    
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
          console.warn(`⚠️  Функция ${func}: ${error.message}`);
        } else {
          console.log(`✅ Функция ${func} доступна`);
        }
      } catch (err) {
        console.warn(`⚠️  Ошибка проверки функции ${func}:`, err.message);
      }
    }
    
    // Создаем тестовые данные (опционально)
    if (process.argv.includes('--seed')) {
      console.log('🌱 Создание тестовых данных...');
      await createTestData();
    }
    
    console.log('🎉 Миграция CAD/MDT завершена успешно!');
    console.log('');
    console.log('📋 Что было создано:');
    console.log('  • Таблицы: characters, vehicles, weapons, pets, records, call911, active_units, call_attachments');
    console.log('  • Функции: генерация номеров, VIN, серийных номеров, позывных');
    console.log('  • Индексы для оптимизации запросов');
    console.log('  • Триггеры для автоматического обновления');
    console.log('');
    console.log('🚀 Система готова к использованию!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

async function createTestData() {
  try {
    // Создаем тестовый департамент
    const { data: dept, error: deptError } = await supabase
      .from('departments')
      .insert({
        name: 'LSPD',
        fullName: 'Horizon Police Department',
        description: 'Тестовый департамент полиции',
        logoUrl: 'https://example.com/lspd-logo.png'
      })
      .select()
      .single();
    
    if (deptError) {
      console.warn('⚠️  Ошибка создания тестового департамента:', deptError.message);
      return;
    }
    
    console.log('✅ Тестовый департамент LSPD создан');
    
    // Создаем тестового пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username: 'test_officer',
        email: 'officer@test.com',
        passwordHash: 'test_hash',
        role: 'member',
        departmentId: dept.id,
        rank: 'Officer'
      })
      .select()
      .single();
    
    if (userError) {
      console.warn('⚠️  Ошибка создания тестового пользователя:', userError.message);
      return;
    }
    
    console.log('✅ Тестовый пользователь создан');
    
    // Создаем тестового персонажа
    const { data: character, error: charError } = await supabase
      .from('characters')
      .insert({
        ownerId: user.id,
        type: 'leo',
        firstName: 'Джон',
        lastName: 'Доу',
        dob: '1990-01-01',
        address: '123 Main St, Horizon City',
        insuranceNumber: 'INS-2024-00001',
        isUnit: true,
        unitInfo: {
          badgeNumber: '12345',
          rank: 'Officer',
          division: 'Patrol'
        }
      })
      .select()
      .single();
    
    if (charError) {
      console.warn('⚠️  Ошибка создания тестового персонажа:', charError.message);
      return;
    }
    
    console.log('✅ Тестовый персонаж создан');
    
    // Создаем тестовое ТС
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        ownerId: character.id,
        plate: 'TEST123',
        vin: 'ABCDEFGHIJKLMNOPQ',
        model: 'Police Cruiser',
        color: 'Black and White',
        registration: 'valid',
        insurance: 'valid'
      })
      .select()
      .single();
    
    if (vehicleError) {
      console.warn('⚠️  Ошибка создания тестового ТС:', vehicleError.message);
      return;
    }
    
    console.log('✅ Тестовое ТС создано');
    
    // Создаем тестовый вызов 911
    const { data: call, error: callError } = await supabase
      .from('call911')
      .insert({
        location: '123 Test Street, Horizon City',
        description: 'Тестовый вызов 911',
        type: 'police',
        priority: 2,
        callerInfo: {
          name: 'Test Caller',
          phone: '555-0123'
        }
      })
      .select()
      .single();
    
    if (callError) {
      console.warn('⚠️  Ошибка создания тестового вызова:', callError.message);
      return;
    }
    
    console.log('✅ Тестовый вызов 911 создан');
    
    console.log('🌱 Тестовые данные успешно созданы!');
    
  } catch (error) {
    console.warn('⚠️  Ошибка создания тестовых данных:', error.message);
  }
}

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
  applyCADMigration();
} 