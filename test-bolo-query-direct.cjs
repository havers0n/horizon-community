const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testBoloQueryDirect() {
  try {
    console.log('Тестируем SQL запрос BOLO напрямую...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Установлен' : 'Не установлен');
    
    // Test the exact query from MDTService.getBolos()
    const result = await pool.query(`
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
    `);

    console.log('✅ Запрос выполнен успешно!');
    console.log('Количество записей:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('\nПервая запись:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('\nЗаписей не найдено');
    }
    
    // Test if there are any users in the database
    const usersResult = await pool.query('SELECT id, username FROM public.users LIMIT 3');
    console.log('\nПользователи в базе:', usersResult.rows.length);
    usersResult.rows.forEach(user => {
      console.log(`  ID: ${user.id}, username: ${user.username}`);
    });
    
    // Test if there are any BOLOs in the database
    const bolosResult = await pool.query('SELECT id, issued_by, type FROM mdt.bolos LIMIT 3');
    console.log('\nBOLO в базе:', bolosResult.rows.length);
    bolosResult.rows.forEach(bolo => {
      console.log(`  ID: ${bolo.id}, issued_by: ${bolo.issued_by} (тип: ${typeof bolo.issued_by}), type: ${bolo.type}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении запроса:', error.message);
    console.error('Детали ошибки:', error);
  } finally {
    await pool.end();
  }
}

testBoloQueryDirect(); 