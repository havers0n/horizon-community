const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testBoloDirect() {
  try {
    console.log('Тестируем BOLO endpoint напрямую...');
    
    // Test the exact SQL query from MDTService
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

    // Test creating a BOLO with proper type casting
    console.log('\n' + '='.repeat(50));
    console.log('Тестируем создание BOLO...');
    
    const usersResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (usersResult.rows.length === 0) {
      console.log('Нет пользователей в базе данных');
      return;
    }
    
    const userId = usersResult.rows[0].id;
    console.log(`Используем пользователя с ID: ${userId}`);
    
    const createResult = await pool.query(`
      INSERT INTO mdt.bolos (
        type, description, vehicle, plate, reason, priority, 
        location, additional_info, issued_by, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      'test_type',
      'Test BOLO description',
      'Test Vehicle',
      'TEST123',
      'Test reason',
      'medium',
      'Test location',
      'Test additional info',
      String(userId), // Convert to string
      new Date()
    ]);

    console.log('BOLO создан успешно:');
    console.log(JSON.stringify(createResult.rows[0], null, 2));

  } catch (error) {
    console.error('Ошибка при тестировании:', error);
  } finally {
    await pool.end();
  }
}

testBoloDirect(); 