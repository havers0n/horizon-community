import { config } from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Загружаем переменные окружения
config();

// Отключаем проверку TLS сертификатов
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;

console.log('Checking user in database...');
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

async function checkUser() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const authId = 'c65bfdf0-820b-449a-b798-f853090da2c4';
    const email = 'danypetrov2000@gmail.com';
    
    // Проверяем пользователя по auth_id
    console.log('Checking user by auth_id...');
    const authResult = await client.query(
      'SELECT * FROM public.users WHERE auth_id = $1',
      [authId]
    );
    
    if (authResult.rows.length > 0) {
      console.log('✅ User found by auth_id:', authResult.rows[0]);
    } else {
      console.log('❌ User not found by auth_id');
    }
    
    // Проверяем пользователя по email
    console.log('Checking user by email...');
    const emailResult = await client.query(
      'SELECT * FROM public.users WHERE email = $1',
      [email]
    );
    
    if (emailResult.rows.length > 0) {
      console.log('✅ User found by email:', emailResult.rows[0]);
    } else {
      console.log('❌ User not found by email');
    }
    
    // Показываем всех пользователей
    console.log('All users in database:');
    const allUsers = await client.query('SELECT id, username, email, auth_id FROM public.users LIMIT 10');
    allUsers.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Auth ID: ${user.auth_id}`);
    });
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  }
}

checkUser(); 