import { config } from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Загружаем переменные окружения
config();

// Отключаем проверку TLS сертификатов
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log('Connection string (masked):', connectionString.replace(/:(.*)@/, ':***@'));

const pool = new Pool({
  connectionString: connectionString + '?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    console.log('Testing query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0]);
    
    console.log('Testing user query...');
    const userResult = await client.query('SELECT COUNT(*) as user_count FROM public.users');
    console.log('✅ User query successful:', userResult.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection(); 