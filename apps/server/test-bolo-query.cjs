const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testBoloQuery() {
  try {
    console.log('Тестируем SQL запрос для BOLO...');
    
    // Тестируем запрос из MDTService
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
      LEFT JOIN users u ON mb.issued_by::integer = u.id
      WHERE mb.status != 'deleted'
      ORDER BY mb.created_at DESC
    `);

    console.log('Результат запроса:');
    console.log('Количество записей:', result.rows.length);
    result.rows.forEach((row, index) => {
      console.log(`\nЗапись ${index + 1}:`);
      console.log(JSON.stringify(row, null, 2));
    });

    // Проверяем данные в таблицах отдельно
    console.log('\n' + '='.repeat(50));
    console.log('Данные в mdt.bolos:');
    const bolosData = await pool.query('SELECT * FROM mdt.bolos');
    console.log('Количество BOLO:', bolosData.rows.length);
    bolosData.rows.forEach(row => {
      console.log(`ID: ${row.id}, issued_by: ${row.issued_by} (тип: ${typeof row.issued_by})`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('Данные в users:');
    const usersData = await pool.query('SELECT id, username FROM users');
    console.log('Количество пользователей:', usersData.rows.length);
    usersData.rows.forEach(row => {
      console.log(`ID: ${row.id} (тип: ${typeof row.id}), username: ${row.username}`);
    });

  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
  } finally {
    await pool.end();
  }
}

testBoloQuery(); 