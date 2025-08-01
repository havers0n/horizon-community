const { Pool } = require('pg');
require('dotenv').config();

// Конфигурация подключения к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/roleplay_identity',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Добавление тестовых данных в MDT систему...');

    // 1. Добавляем тестовые юниты
    console.log('📱 Добавление тестовых юнитов...');
    
    const unitsResult = await client.query(`
      INSERT INTO mdt.mdt_units (
        character_id, unit_number, department_id, status, location, 
        is_panic, last_update, created_at
      ) VALUES 
        (1, '1-ADAM-12', 1, 'available', '{"x": 100, "y": 200, "z": 0}', false, NOW(), NOW()),
        (2, '1-BOY-12', 1, 'busy', '{"x": 150, "y": 250, "z": 0}', false, NOW(), NOW()),
        (3, '2-ADAM-12', 2, 'available', '{"x": 200, "y": 300, "z": 0}', false, NOW(), NOW()),
        (4, '3-ADAM-12', 3, 'en_route', '{"x": 250, "y": 350, "z": 0}', false, NOW(), NOW())
      RETURNING id
    `);
    
    console.log(`✅ Добавлено ${unitsResult.rows.length} юнитов`);

    // 2. Добавляем тестовые вызовы 911
    console.log('📞 Добавление тестовых вызовов 911...');
    
    const callsResult = await client.query(`
      INSERT INTO mdt.mdt_calls_911 (
        caller_name, caller_phone, location, description, type, 
        priority, status, assigned_units, created_at, updated_at
      ) VALUES 
        ('John Doe', '555-0101', '123 Main St', 'Domestic disturbance', 'police', 3, 'pending', ARRAY[1], NOW(), NOW()),
        ('Jane Smith', '555-0102', '456 Oak Ave', 'Medical emergency', 'ems', 5, 'assigned', ARRAY[2], NOW(), NOW()),
        ('Bob Johnson', '555-0103', '789 Pine Rd', 'Fire alarm', 'fire', 4, 'en_route', ARRAY[3], NOW(), NOW()),
        ('Alice Brown', '555-0104', '321 Elm St', 'Traffic accident', 'police', 2, 'on_scene', ARRAY[1, 2], NOW(), NOW())
      RETURNING id
    `);
    
    console.log(`✅ Добавлено ${callsResult.rows.length} вызовов 911`);

    // 3. Добавляем тестовые BOLO
    console.log('🚨 Добавление тестовых BOLO...');
    
    const bolosResult = await client.query(`
      INSERT INTO mdt.bolos (
        type, description, vehicle, plate, reason, priority, 
        status, location, issued_by, timestamp, additional_info, created_at
      ) VALUES 
        ('vehicle', 'Stolen vehicle', 'Toyota Camry', 'ABC123', 'Vehicle theft', 'high', 'active', 'Downtown', '1', NOW(), 'Last seen heading north on Main St', NOW()),
        ('person', 'Wanted suspect', NULL, NULL, 'Armed and dangerous', 'critical', 'active', 'Westside', '1', NOW(), 'Considered armed and dangerous', NOW()),
        ('vehicle', 'Hit and run', 'Honda Civic', 'XYZ789', 'Hit and run accident', 'medium', 'active', 'Eastside', '2', NOW(), 'Vehicle has front end damage', NOW()),
        ('general', 'Missing person', NULL, NULL, 'Missing elderly person', 'high', 'active', 'Northside', '3', NOW(), 'Last seen wearing blue jacket', NOW())
      RETURNING id
    `);
    
    console.log(`✅ Добавлено ${bolosResult.rows.length} BOLO`);

    // 4. Добавляем тестовые сигналы
    console.log('🚦 Добавление тестовых сигналов...');
    
    const signalsResult = await client.query(`
      INSERT INTO mdt.mdt_signals (
        title, description, type, priority, location, coordinates, 
        is_active, created_at
      ) VALUES 
        ('Signal 100', 'All units respond', 'LEO', 'critical', 'City Center', '{"x": 0, "y": 0, "z": 0}', true, NOW()),
        ('Medical Emergency', 'Multiple casualties', 'EMS_FD', 'high', 'Hospital District', '{"x": 100, "y": 100, "z": 0}', true, NOW()),
        ('Traffic Control', 'Major accident', 'LEO', 'medium', 'Highway 101', '{"x": 200, "y": 200, "z": 0}', true, NOW())
      RETURNING id
    `);
    
    console.log(`✅ Добавлено ${signalsResult.rows.length} сигналов`);

    console.log('🎉 Тестовые данные успешно добавлены!');
    console.log('\n📊 Статистика:');
    console.log(`- Юнитов: ${unitsResult.rows.length}`);
    console.log(`- Вызовов 911: ${callsResult.rows.length}`);
    console.log(`- BOLO: ${bolosResult.rows.length}`);
    console.log(`- Сигналов: ${signalsResult.rows.length}`);

  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем скрипт
if (require.main === module) {
  addTestData()
    .then(() => {
      console.log('✅ Скрипт завершен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

module.exports = { addTestData }; 