import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing database connection...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Check if we're connecting to Supabase
const isSupabaseConnection = process.env.DATABASE_URL?.includes('supabase.com') || 
                            process.env.DATABASE_URL?.includes('aws-0-eu-north-1.pooler.supabase.com');

console.log('Supabase connection:', isSupabaseConnection ? 'Yes' : 'No');

console.trace("Creating PG Pool here");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabaseConnection ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ...(isSupabaseConnection && {
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
});

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executed successfully:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection(); 