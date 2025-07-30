import 'dotenv/config';
import express from 'express';

const app = express();

app.use(express.json());

// Простой health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Тестовый endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const port = process.env.PORT || 5000;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

app.listen(port, host, () => {
  console.log(`🚀 Simple test server running on ${host}:${port}`);
  console.log(`📊 Health check: http://${host}:${port}/api/health`);
  console.log(`🧪 Test endpoint: http://${host}:${port}/api/test`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
}); 