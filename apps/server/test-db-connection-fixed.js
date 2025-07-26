import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корневой папки проекта
const result = config({ path: resolve(__dirname, '../../.env') });
console.log('📁 .env file loaded:', result.parsed ? 'Yes' : 'No');

import { Pool } from 'pg';

console.log('🔍 Тестируем исправленное подключение к базе данных...');
console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Настроен' : 'НЕ настроен');

if (process.env.DATABASE_URL) {
  console.log('🔗 DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

// Используем ту же конфигурацию, что и в исправленном db/index.ts
const isSupabaseConnection = process.env.DATABASE_URL?.includes('supabase.com') || 
                            process.env.DATABASE_URL?.includes('aws-0-eu-north-1.pooler.supabase.com');

console.log('🌐 Supabase connection:', isSupabaseConnection ? 'Да' : 'Нет');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден! Проверьте файл .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabaseConnection ? { rejectUnauthorized: false } : false,
  // Базовые настройки для стабильности
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('🔌 Подключаемся к базе данных...');
    const client = await pool.connect();
    console.log('✅ Подключение успешно!');
    
    // Проверяем версию PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Версия PostgreSQL:', versionResult.rows[0].version);
    
    // Проверяем таблицы в схеме public
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Таблицы в схеме public:');
    if (tablesResult.rows.length === 0) {
      console.log('   Нет таблиц');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
    // Проверяем таблицу users
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      console.log('\n👥 Проверяем таблицу users...');
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Количество пользователей: ${usersResult.rows[0].count}`);
    }
    
    // Проверяем таблицу departments
    if (tablesResult.rows.some(row => row.table_name === 'departments')) {
      console.log('\n🏢 Проверяем таблицу departments...');
      const deptResult = await client.query('SELECT COUNT(*) as count FROM departments');
      console.log(`📊 Количество департаментов: ${deptResult.rows[0].count}`);
    }
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Тест подключения к базе данных завершен успешно!');
    console.log('✅ Проблема с SASL аутентификацией решена!');
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    
    if (error.message.includes('SASL')) {
      console.error('🚨 Обнаружена ошибка SASL - проблема НЕ решена!');
    } else {
      console.log('ℹ️ Ошибка не связана с SASL аутентификацией');
    }
    
    await pool.end();
  }
}

testConnection(); 