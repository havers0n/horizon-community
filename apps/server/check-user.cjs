const { config } = require('dotenv');
const { resolve } = require('path');
const { Pool } = require('pg');

// Загружаем .env из корневой папки проекта
config({ path: resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
});

async function checkUser() {
  try {
    console.log('🔍 Проверяем пользователя в базе данных...');
    
    const client = await pool.connect();
    
    // Проверяем пользователя по email
    const email = 'danypetrov2000@gmail.com';
    const result = await client.query('SELECT id, username, email, auth_id FROM users WHERE email = $1', [email]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Пользователь найден:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Auth ID: ${user.auth_id}`);
    } else {
      console.log('❌ Пользователь не найден');
      
      // Показываем всех пользователей
      const allUsers = await client.query('SELECT id, username, email, auth_id FROM users LIMIT 5');
      console.log('📋 Первые 5 пользователей в базе:');
      allUsers.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Auth ID: ${user.auth_id}`);
      });
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await pool.end();
  }
}

checkUser(); 