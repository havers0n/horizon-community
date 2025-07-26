import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkDevSchema() {
  console.log('🔍 Checking dev_schema tables...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // Проверяем, что схема dev_schema существует
    console.log('📋 Checking if dev_schema exists...');
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'dev_schema'
    `);
    
    if (schemaResult.rows.length === 0) {
      console.log('❌ Schema dev_schema does not exist');
      return;
    }
    
    console.log('✅ Schema dev_schema exists');
    
    // Получаем список таблиц в dev_schema
    console.log('📊 Getting tables in dev_schema...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'dev_schema' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${tablesResult.rows.length} tables in dev_schema:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    // Проверяем несколько ключевых таблиц
    const keyTables = ['users', 'characters', 'departments', 'tests', 'test_results'];
    console.log('\n🔍 Checking key tables...');
    
    for (const tableName of keyTables) {
      const tableResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM dev_schema.${tableName}
      `);
      console.log(`  ${tableName}: ${tableResult.rows[0].count} rows`);
    }
    
    console.log('\n🎉 Dev schema check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking dev_schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkDevSchema()
  .then(() => {
    console.log('✅ Dev schema check script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Dev schema check script failed:', error);
    process.exit(1);
  }); 