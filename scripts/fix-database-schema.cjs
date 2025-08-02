const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Исправление структуры базы данных...\n');

    // 1. Создаем схемы если их нет
    console.log('📋 Создание схем...');
    await pool.query('CREATE SCHEMA IF NOT EXISTS common');
    await pool.query('CREATE SCHEMA IF NOT EXISTS mdt');
    console.log('✅ Схемы созданы');

    // 2. Создаем таблицу departments в схеме common
    console.log('\n🏢 Создание таблицы departments...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS common.departments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        logo_url TEXT,
        description TEXT,
        gallery TEXT[] DEFAULT '{}'
      )
    `);
    console.log('✅ Таблица common.departments создана');

    // 3. Создаем таблицу characters в схеме common
    console.log('\n👥 Создание таблицы characters...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS common.characters (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('civilian', 'leo', 'fire', 'ems')),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        dob DATE NOT NULL,
        address TEXT NOT NULL,
        insurance_number TEXT NOT NULL UNIQUE,
        licenses JSONB NOT NULL DEFAULT '{}',
        medical_info JSONB NOT NULL DEFAULT '{}',
        mugshot_url TEXT,
        is_unit BOOLEAN NOT NULL DEFAULT FALSE,
        unit_info JSONB,
        department_id INTEGER REFERENCES common.departments(id),
        rank_id INTEGER,
        division_id INTEGER,
        unit_id INTEGER,
        badge_number TEXT,
        employee_id TEXT,
        hire_date DATE,
        termination_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица common.characters создана');

    // 4. Добавляем колонку callsign если её нет
    console.log('\n📻 Добавление колонки callsign...');
    try {
      await pool.query('ALTER TABLE common.characters ADD COLUMN IF NOT EXISTS callsign TEXT');
      await pool.query('ALTER TABLE common.characters ADD COLUMN IF NOT EXISTS callsign2 TEXT');
      console.log('✅ Колонки callsign и callsign2 добавлены');
    } catch (err) {
      console.log('ℹ️ Колонки callsign уже существуют или ошибка:', err.message);
    }

    // 5. Создаем таблицу vehicles в схеме common
    console.log('\n🚗 Создание таблицы vehicles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS common.vehicles (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES common.characters(id),
        plate TEXT,
        vin TEXT,
        model TEXT,
        color TEXT,
        registration TEXT,
        insurance TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица common.vehicles создана');

    // 6. Создаем таблицу mdt_units в схеме mdt
    console.log('\n🚔 Создание таблицы mdt_units...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdt.mdt_units (
        id SERIAL PRIMARY KEY,
        character_id INTEGER REFERENCES common.characters(id),
        unit_number VARCHAR NOT NULL,
        department_id INTEGER REFERENCES common.departments(id),
        status VARCHAR DEFAULT 'available',
        location JSONB,
        current_call_id INTEGER,
        partner_id INTEGER REFERENCES mdt.mdt_units(id),
        vehicle_id INTEGER REFERENCES common.vehicles(id),
        is_panic BOOLEAN DEFAULT FALSE,
        last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица mdt.mdt_units создана');

    // 7. Создаем таблицу bolos в схеме mdt
    console.log('\n🚨 Создание таблицы bolos...');
    await pool.query(`
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
    console.log('✅ Таблица mdt.bolos создана');

    // 8. Создаем таблицу mdt_calls_911 в схеме mdt
    console.log('\n📞 Создание таблицы mdt_calls_911...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mdt.mdt_calls_911 (
        id SERIAL PRIMARY KEY,
        caller_name VARCHAR,
        caller_phone VARCHAR,
        location VARCHAR NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR NOT NULL,
        priority VARCHAR DEFAULT 'medium',
        status VARCHAR DEFAULT 'pending',
        assigned_units INTEGER[],
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица mdt.mdt_calls_911 создана');

    // 9. Создаем индексы для оптимизации
    console.log('\n📊 Создание индексов...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_characters_owner_id ON common.characters(owner_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_characters_type ON common.characters(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON common.vehicles(owner_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mdt_units_character_id ON mdt.mdt_units(character_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mdt_units_status ON mdt.mdt_units(status)');
    console.log('✅ Индексы созданы');

    // 10. Проверяем результат
    console.log('\n🔍 Проверка результата...');
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('common', 'mdt') 
      AND table_name IN ('characters', 'departments', 'vehicles', 'mdt_units', 'bolos', 'mdt_calls_911')
      ORDER BY table_schema, table_name
    `);
    
    console.log('📋 Созданные таблицы:');
    tables.rows.forEach(row => {
      console.log(`✅ ${row.table_schema}.${row.table_name}`);
    });

    console.log('\n🎉 Структура базы данных успешно исправлена!');

  } catch (error) {
    console.error('❌ Ошибка при исправлении структуры базы данных:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema(); 