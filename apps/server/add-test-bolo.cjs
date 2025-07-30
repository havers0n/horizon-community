const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addTestBolo() {
  try {
    console.log('Добавляем тестовый BOLO...');
    
    // Сначала проверим, есть ли пользователи
    const usersResult = await pool.query('SELECT id, username FROM users LIMIT 1');
    if (usersResult.rows.length === 0) {
      console.log('Нет пользователей в базе данных');
      return;
    }
    
    const userId = usersResult.rows[0].id;
    console.log(`Используем пользователя с ID: ${userId}`);
    
    // Добавляем тестовый BOLO
    const result = await pool.query(`
      INSERT INTO mdt.bolos (
        type, description, vehicle, plate, reason, priority, 
        location, additional_info, issued_by, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `, [
      'vehicle', // type
      'Тестовый BOLO для проверки', // description
      'BMW X5', // vehicle
      'ABC123', // plate
      'Подозрение в краже', // reason
      'high', // priority
      'Центр города', // location
      'Дополнительная информация', // additional_info
      userId.toString(), // issued_by (как text)
      'active' // status
    ]);

    console.log('Тестовый BOLO добавлен:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    // Проверяем, что BOLO добавлен
    const checkResult = await pool.query('SELECT * FROM mdt.bolos ORDER BY created_at DESC LIMIT 1');
    console.log('\nПоследний BOLO в базе:');
    console.log(JSON.stringify(checkResult.rows[0], null, 2));

  } catch (error) {
    console.error('Ошибка при добавлении тестового BOLO:', error);
  } finally {
    await pool.end();
  }
}

addTestBolo(); 