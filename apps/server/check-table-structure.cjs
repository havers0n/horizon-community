const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkTableStructure() {
  try {
    console.log('Проверяем структуру таблицы mdt.bolos...');
    const bolosResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'mdt' AND table_name = 'bolos' 
      ORDER BY ordinal_position
    `);
    
    console.log('mdt.bolos columns:');
    bolosResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\nПроверяем структуру таблицы users...');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('public.users columns:');
    usersResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Проверяем несколько записей из обеих таблиц
    console.log('\nПроверяем данные в mdt.bolos...');
    const bolosData = await pool.query('SELECT id, issued_by FROM mdt.bolos LIMIT 3');
    console.log('mdt.bolos sample data:');
    bolosData.rows.forEach(row => {
      console.log(`  id: ${row.id} (type: ${typeof row.id}), issued_by: ${row.issued_by} (type: ${typeof row.issued_by})`);
    });

    console.log('\nПроверяем данные в public.users...');
    const usersData = await pool.query('SELECT id, username, email FROM public.users LIMIT 3');
    console.log('public.users sample data:');
    usersData.rows.forEach(row => {
      console.log(`  id: ${row.id} (type: ${typeof row.id}), username: ${row.username}, email: ${row.email}`);
    });

  } catch (error) {
    console.error('Ошибка при проверке структуры таблиц:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure(); 