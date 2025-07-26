import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Test server is running!'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    data: {
      users: 0,
      departments: 0
    }
  });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Test server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health check: http://127.0.0.1:${port}/api/health`);
  console.log(`🧪 Test endpoint: http://127.0.0.1:${port}/api/test`);
}); 