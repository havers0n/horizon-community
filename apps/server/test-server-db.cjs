require('dotenv').config();

async function testServerDB() {
  try {
    console.log('Тестируем подключение к базе данных в контексте сервера...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Установлен' : 'Не установлен');
    
    // Импортируем pool из db/index
    const { pool } = await import('./db/index.js');
    
    console.log('Pool импортирован успешно');
    
    // Тестируем подключение
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Подключение успешно:', result.rows[0]);
    
    // Тестируем запрос BOLO
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
      LEFT JOIN users u ON mb.issued_by::integer = u.id
      WHERE mb.status != 'deleted'
      ORDER BY mb.created_at DESC
    `);
    
    console.log('Результат запроса BOLO:');
    console.log('Количество записей:', boloResult.rows.length);
    boloResult.rows.forEach((row, index) => {
      console.log(`\nЗапись ${index + 1}:`);
      console.log(JSON.stringify(row, null, 2));
    });
    
  } catch (error) {
    console.error('Ошибка при тестировании:', error);
  }
}

testServerDB(); 