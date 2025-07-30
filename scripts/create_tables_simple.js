import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTablesSimple() {
  try {
    console.log('🔧 Создаем таблицы через API...');
    
    // Создаем диспетчерский департамент
    console.log('\n📋 Создаем диспетчерский департамент...');
    try {
      const { data: dept, error } = await supabaseAdmin
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
      
      if (error) {
        console.log('ℹ️ Диспетчерский департамент уже существует или таблица не существует');
      } else {
        console.log('✅ Диспетчерский департамент создан:', dept);
      }
    } catch (err) {
      console.log('ℹ️ Диспетчерский департамент уже существует или таблица не существует');
    }
    
    // Создаем тестовый персонаж
    console.log('\n📋 Создаем тестовый персонаж...');
    try {
      const { data: char, error } = await supabaseAdmin
        .from('characters')
        .insert({
          owner_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          department_id: 1,
          rank: 'Dispatcher',
          status: 'active',
          insurance_number: 'INS123456',
          address: '123 Main St'
        })
        .select()
        .single();
      
      if (error) {
        console.log('ℹ️ Тестовый персонаж уже существует или таблица не существует');
      } else {
        console.log('✅ Тестовый персонаж создан:', char);
      }
    } catch (err) {
      console.log('ℹ️ Тестовый персонаж уже существует или таблица не существует');
    }
    
    // Создаем тестовый BOLO
    console.log('\n📋 Создаем тестовый BOLO...');
    try {
      const { data: bolo, error } = await supabaseAdmin
        .from('bolos')
        .insert({
          type: 'vehicle',
          description: 'Красный спортивный автомобиль',
          vehicle: 'Sultan RS',
          plate: 'ABC123',
          reason: 'Нарушение ПДД',
          priority: 'high',
          status: 'active',
          location: 'Центр города',
          issued_by: 'Диспетчер Джон',
          additional_info: 'Скорость превышена в 2 раза'
        })
        .select()
        .single();
      
      if (error) {
        console.log('ℹ️ Тестовый BOLO уже существует или таблица не существует');
      } else {
        console.log('✅ Тестовый BOLO создан:', bolo);
      }
    } catch (err) {
      console.log('ℹ️ Тестовый BOLO уже существует или таблица не существует');
    }
    
    // Создаем тестовый юнит
    console.log('\n📋 Создаем тестовый юнит...');
    try {
      const { data: unit, error } = await supabaseAdmin
        .from('units')
        .insert({
          character_id: 1,
          unit_number: '1-ADAM-12',
          department_id: 1,
          status: 'active',
          is_panic: false
        })
        .select()
        .single();
      
      if (error) {
        console.log('ℹ️ Тестовый юнит уже существует или таблица не существует');
      } else {
        console.log('✅ Тестовый юнит создан:', unit);
      }
    } catch (err) {
      console.log('ℹ️ Тестовый юнит уже существует или таблица не существует');
    }
    
    console.log('\n🎉 Создание таблиц завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createTablesSimple(); 