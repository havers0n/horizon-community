const { Pool } = require('pg');
require('dotenv').config();

async function testMDTConnection() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Тестируем подключение к базе данных...');
    
    // Тестируем простое подключение
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Подключение успешно:', result.rows[0]);
    
    // Тестируем запрос к таблице mdt.bolos
    console.log('\nТестируем запрос к mdt.bolos...');
    const bolosResult = await pool.query('SELECT COUNT(*) as count FROM mdt.bolos');
    console.log('Количество BOLO в базе:', bolosResult.rows[0].count);
    
    // Тестируем запрос к таблице users
    console.log('\nТестируем запрос к users...');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Количество пользователей в базе:', usersResult.rows[0].count);
    
    // Тестируем полный запрос BOLO
    console.log('\nТестируем полный запрос BOLO...');
    const fullBoloResult = await pool.query(`
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
      LEFT JOIN users u ON mb.issued_by::integer = u.id
      WHERE mb.status != 'deleted'
      ORDER BY mb.created_at DESC
    `);
    
    console.log('Результат полного запроса:');
    console.log('Количество записей:', fullBoloResult.rows.length);
    fullBoloResult.rows.forEach((row, index) => {
      console.log(`\nЗапись ${index + 1}:`);
      console.log(JSON.stringify(row, null, 2));
    });
    
  } catch (error) {
    console.error('Ошибка при тестировании:', error);
  } finally {
    await pool.end();
  }
}

testMDTConnection(); 