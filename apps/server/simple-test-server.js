import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

console.log("🚀 Запуск простого тестового сервера...");

// БЕЗОПАСНАЯ ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
const databaseUrl = process.env.DATABASE_URL;
const port = process.env.PORT || 3001;

if (!databaseUrl) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: DATABASE_URL не установлен!");
  console.error("Установите переменную окружения DATABASE_URL");
  process.exit(1);
}

const app = express();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Тестовый эндпоинт
app.get('/api/test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    res.json({
      success: true,
      message: 'Сервер работает корректно',
      timestamp: result.rows[0].current_time,
      database: 'connected'
    });
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка подключения к базе данных',
      error: error.message
    });
  }
});

// Эндпоинт для проверки департаментов
app.get('/api/departments', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM departments LIMIT 10');
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Ошибка при получении департаментов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении департаментов',
      error: error.message
    });
  }
});

// Эндпоинт для проверки пользователей
app.get('/api/users', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, username, email, role FROM users LIMIT 10');
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении пользователей',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Сервер запущен на порту ${port}`);
  console.log(`🌐 Тестовые эндпоинты:`);
  console.log(`   - GET /api/test`);
  console.log(`   - GET /api/departments`);
  console.log(`   - GET /api/users`);
}); 