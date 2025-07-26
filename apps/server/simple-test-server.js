import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const pool = new Pool({
  connectionString: 'postgresql://postgres.axgtvvcimqoyxbfvdrok:TtaW3kLHu9xojVOt@aws-0-eu-north-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Simple test server is running!'
  });
});

// Test departments endpoint
app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments');
    res.json({
      success: true,
      count: result.rows.length,
      departments: result.rows
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, status FROM users LIMIT 10');
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test characters endpoint
app.get('/api/characters', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, first_name, last_name, type, owner_id FROM characters LIMIT 10');
    res.json({
      success: true,
      count: result.rows.length,
      characters: result.rows
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Simple test server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health check: http://127.0.0.1:${port}/api/health`);
  console.log(`🏢 Departments: http://127.0.0.1:${port}/api/departments`);
  console.log(`👥 Users: http://127.0.0.1:${port}/api/users`);
  console.log(`🎭 Characters: http://127.0.0.1:${port}/api/characters`);
}); 