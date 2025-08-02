import { config } from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Загружаем переменные окружения
config();

// Отключаем проверку TLS сертификатов
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;

console.log('Creating user in database...');
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

async function createUser() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const authId = 'c65bfdf0-820b-449a-b798-f853090da2c4';
    const email = 'danypetrov2000@gmail.com';
    
    // Проверяем, существует ли пользователь
    console.log('Checking if user exists...');
    const checkResult = await client.query(
      'SELECT * FROM public.users WHERE auth_id = $1 OR email = $2',
      [authId, email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ User already exists:', checkResult.rows[0]);
    } else {
      console.log('Creating new user...');
      const insertResult = await client.query(`
        INSERT INTO public.users (
          username, email, password_hash, role, status, auth_id, 
          game_warnings, admin_warnings, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        'daniel', // username
        email, // email
        null, // password_hash (not needed for Supabase auth)
        'admin', // role
        'active', // status
        authId, // auth_id
        0, // game_warnings
        0 // admin_warnings
      ]);
      
      console.log('✅ User created successfully:', insertResult.rows[0]);
    }
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  }
}

createUser(); 