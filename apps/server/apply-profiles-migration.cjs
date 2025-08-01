require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

// Конфигурация подключения к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/roleplay_identity',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function applyProfilesMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Применение миграции для создания таблицы public.profiles...');

    // Читаем SQL файл
    const sqlContent = fs.readFileSync('./fix-users-table.sql', 'utf8');
    
    // Выполняем SQL
    await client.query(sqlContent);
    
    console.log('✅ Миграция применена успешно!');
    
    // Проверяем, что таблица создана
    const checkResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Таблица public.profiles создана');
      
      // Проверяем количество записей
      const countResult = await client.query('SELECT COUNT(*) FROM public.profiles');
      console.log(`📊 Количество записей в profiles: ${countResult.rows[0].count}`);
    } else {
      console.log('❌ Таблица public.profiles не найдена');
    }

  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем миграцию
if (require.main === module) {
  applyProfilesMigration()
    .then(() => {
      console.log('✅ Миграция завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка миграции:', error);
      process.exit(1);
    });
}

module.exports = { applyProfilesMigration }; 