const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Проверка структуры базы данных...\n');

    // Проверяем существование схем
    console.log('📋 Проверка схем:');
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('common', 'mdt', 'public')
      ORDER BY schema_name
    `);
    
    schemas.rows.forEach(row => {
      console.log(`✅ Схема ${row.schema_name} существует`);
    });

    // Проверяем таблицу characters
    console.log('\n👥 Проверка таблицы characters:');
    const charactersTable = await pool.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_name = 'characters'
    `);
    
    if (charactersTable.rows.length === 0) {
      console.log('❌ Таблица characters не найдена ни в одной схеме');
    } else {
      charactersTable.rows.forEach(row => {
        console.log(`✅ Таблица characters найдена в схеме ${row.table_schema}`);
      });
    }

    // Проверяем колонки в common.characters
    console.log('\n📊 Колонки в таблице common.characters:');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'characters' AND table_schema = 'common'
      ORDER BY ordinal_position
    `);
    
    if (columns.rows.length === 0) {
      console.log('❌ Таблица common.characters не существует');
    } else {
      columns.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    }

    // Проверяем таблицу mdt_units
    console.log('\n🚔 Проверка таблицы mdt.mdt_units:');
    const mdtUnitsTable = await pool.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_name = 'mdt_units' AND table_schema = 'mdt'
    `);
    
    if (mdtUnitsTable.rows.length === 0) {
      console.log('❌ Таблица mdt.mdt_units не найдена');
    } else {
      console.log('✅ Таблица mdt.mdt_units найдена');
    }

    // Проверяем колонки в mdt.mdt_units
    console.log('\n📊 Колонки в таблице mdt.mdt_units:');
    const mdtColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'mdt_units' AND table_schema = 'mdt'
      ORDER BY ordinal_position
    `);
    
    if (mdtColumns.rows.length === 0) {
      console.log('❌ Таблица mdt.mdt_units не существует');
    } else {
      mdtColumns.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    }

    // Проверяем наличие данных
    console.log('\n📈 Проверка данных:');
    
    try {
      const charactersCount = await pool.query('SELECT COUNT(*) FROM common.characters');
      console.log(`👥 Количество персонажей: ${charactersCount.rows[0].count}`);
    } catch (err) {
      console.log('❌ Ошибка при подсчете персонажей:', err.message);
    }

    try {
      const unitsCount = await pool.query('SELECT COUNT(*) FROM mdt.mdt_units');
      console.log(`🚔 Количество юнитов: ${unitsCount.rows[0].count}`);
    } catch (err) {
      console.log('❌ Ошибка при подсчете юнитов:', err.message);
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке структуры базы данных:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure(); 