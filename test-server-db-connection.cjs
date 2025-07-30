const { Pool } = require('pg');
require('dotenv').config();

// Use the same configuration as the server
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testServerDBConnection() {
  try {
    console.log('Тестируем подключение к базе данных...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Установлен' : 'Не установлен');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Подключение успешно:', result.rows[0]);
    
    // Test if mdt.bolos table exists
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'mdt' AND table_name = 'bolos'
      ) as table_exists
    `);
    console.log('Таблица mdt.bolos существует:', tableResult.rows[0].table_exists);
    
    // Test if public.users table exists
    const usersTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      ) as table_exists
    `);
    console.log('Таблица public.users существует:', usersTableResult.rows[0].table_exists);
    
    // Test the exact query that's failing
    console.log('\nТестируем проблемный запрос...');
    const boloResult = await pool.query(`
      SELECT 
        mb.id,
        mb.type,
        mb.description,
        mb.vehicle,
        mb.plate,
        mb.reason,
        mb.priority,
        mb.location,
        mb.additional_info,
        mb.status,
        mb.created_at,
        mb.timestamp,
        mb.issued_by,
        u.username as issued_by_name
      FROM mdt.bolos mb
      LEFT JOIN public.users u ON mb.issued_by::integer = u.id
      WHERE mb.status != 'deleted'
      ORDER BY mb.created_at DESC
      LIMIT 1
    `);
    
    console.log('✅ Запрос выполнен успешно!');
    console.log('Количество записей:', boloResult.rows.length);
    
    if (boloResult.rows.length > 0) {
      console.log('Первая запись:');
      console.log(JSON.stringify(boloResult.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('Детали ошибки:', error);
  } finally {
    await pool.end();
  }
}

testServerDBConnection(); 