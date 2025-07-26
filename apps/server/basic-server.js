import http from 'http';
import { Pool } from 'pg';

const port = 5002;

// Подключение к базе данных
const pool = new Pool({
  connectionString: 'postgresql://postgres.axgtvvcimqoyxbfvdrok:TtaW3kLHu9xojVOt@aws-0-eu-north-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://localhost:${port}`);
  const path = url.pathname;

  try {
    if (path === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Basic server is running!'
      }));
    }
    else if (path === '/api/departments' && req.method === 'GET') {
      const result = await pool.query('SELECT * FROM departments');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: result.rows.length,
        departments: result.rows
      }));
    }
    else if (path === '/api/users' && req.method === 'GET') {
      const result = await pool.query('SELECT id, username, email, role, status FROM users LIMIT 10');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: result.rows.length,
        users: result.rows
      }));
    }
    else if (path === '/api/characters' && req.method === 'GET') {
      const result = await pool.query('SELECT id, first_name, last_name, type, owner_id FROM characters LIMIT 10');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: result.rows.length,
        characters: result.rows
      }));
    }
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Basic server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health check: http://127.0.0.1:${port}/api/health`);
  console.log(`🏢 Departments: http://127.0.0.1:${port}/api/departments`);
  console.log(`👥 Users: http://127.0.0.1:${port}/api/users`);
  console.log(`🎭 Characters: http://127.0.0.1:${port}/api/characters`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
}); 