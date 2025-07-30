const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkBoloSchema() {
  try {
    console.log('Проверяем структуру таблицы mdt.bolos...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bolos' AND table_schema = 'mdt' 
      ORDER BY ordinal_position
    `);
    
    console.log('Структура mdt.bolos:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\nПроверяем структуру таблицы users...');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public' 
      ORDER BY ordinal_position
    `);
    
    console.log('Структура public.users:');
    usersResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Ошибка при проверке схемы:', error);
  } finally {
    await pool.end();
  }
}

checkBoloSchema(); 