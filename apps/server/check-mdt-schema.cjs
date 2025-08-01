require('dotenv').config();
const { Pool } = require('pg');

// Конфигурация подключения к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/roleplay_identity',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkAndCreateMDTSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Проверка схемы MDT...');

    // 1. Проверяем, существует ли схема MDT
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'mdt'
    `);

    if (schemaResult.rows.length === 0) {
      console.log('📁 Схема MDT не найдена, создаем...');
      await client.query('CREATE SCHEMA IF NOT EXISTS mdt');
      console.log('✅ Схема MDT создана');
    } else {
      console.log('✅ Схема MDT уже существует');
    }

    // 2. Проверяем таблицы в схеме MDT
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'mdt'
      ORDER BY table_name
    `);

    console.log('📋 Найденные таблицы в схеме MDT:');
    if (tablesResult.rows.length === 0) {
      console.log('   - Таблиц не найдено');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // 3. Создаем основные таблицы MDT, если их нет
    console.log('\n🔨 Создание таблиц MDT...');

    // Таблица BOLO
    await client.query(`
      CREATE TABLE IF NOT EXISTS mdt.bolos (
        id BIGSERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        vehicle TEXT,
        plate TEXT,
        reason TEXT,
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
        location TEXT,
        issued_by TEXT,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        additional_info TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица mdt.bolos создана/проверена');

    // Таблица MDT Units
    await client.query(`
      CREATE TABLE IF NOT EXISTS mdt.mdt_units (
        id SERIAL PRIMARY KEY,
        character_id INTEGER,
        unit_number VARCHAR NOT NULL,
        department_id INTEGER,
        status VARCHAR DEFAULT 'available',
        location JSONB,
        current_call_id INTEGER,
        partner_id INTEGER,
        vehicle_id INTEGER,
        is_panic BOOLEAN DEFAULT FALSE,
        last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица mdt.mdt_units создана/проверена');

    // Таблица MDT Calls 911
    await client.query(`
      CREATE TABLE IF NOT EXISTS mdt.mdt_calls_911 (
        id SERIAL PRIMARY KEY,
        caller_name VARCHAR,
        caller_phone VARCHAR,
        location VARCHAR NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR NOT NULL,
        priority INTEGER DEFAULT 1,
        status VARCHAR DEFAULT 'pending',
        assigned_units INTEGER[],
        patient_info JSONB,
        fire_info JSONB,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица mdt.mdt_calls_911 создана/проверена');

    // Таблица MDT Signals
    await client.query(`
      CREATE TABLE IF NOT EXISTS mdt.mdt_signals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        author_id INTEGER,
        priority VARCHAR(20) DEFAULT 'medium',
        location VARCHAR(255),
        coordinates JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица mdt.mdt_signals создана/проверена');

    // 4. Проверяем таблицы после создания
    const finalTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'mdt'
      ORDER BY table_name
    `);

    console.log('\n📋 Таблицы в схеме MDT после создания:');
    finalTablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Схема MDT готова к использованию!');

  } catch (error) {
    console.error('❌ Ошибка при работе со схемой MDT:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем скрипт
if (require.main === module) {
  checkAndCreateMDTSchema()
    .then(() => {
      console.log('✅ Скрипт завершен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

module.exports = { checkAndCreateMDTSchema }; 