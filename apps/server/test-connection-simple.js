// Отключаем проверку TLS сертификатов для тестирования
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  // Добавляем sslmode=require если его нет
  if (!connectionString.includes('sslmode=')) {
    connectionString += '?sslmode=require';
  }
  
  console.log('📡 Connection string (masked):', connectionString.replace(/:(.*)@/, ':***@'));
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: false, // Отключаем SSL конфигурацию, так как sslmode=require уже в строке подключения
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    console.log('🔗 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Тестируем простой запрос
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Current database time:', result.rows[0].current_time);
    
    // Тестируем запрос к таблице users
    try {
      const usersResult = await client.query('SELECT COUNT(*) as user_count FROM public.users');
      console.log('👥 Users in database:', usersResult.rows[0].user_count);
    } catch (error) {
      console.log('⚠️ Could not query users table:', error.message);
    }
    
    client.release();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error); 