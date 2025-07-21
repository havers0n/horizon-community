import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Fixing cad_token column...');
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

async function fixCadToken() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database');
    
    // Check if cad_token column exists
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'cad_token'
    `);
    
    if (columns.length === 0) {
      console.log('⚠️  cad_token column not found, adding it...');
      await client.query('ALTER TABLE users ADD COLUMN cad_token TEXT UNIQUE');
      console.log('✅ Added cad_token column');
    } else {
      console.log('✅ cad_token column already exists');
    }
    
    // Test the connection
    const { rows: users } = await client.query('SELECT id, username, cad_token FROM users LIMIT 1');
    console.log('✅ Database query successful');
    console.log('Sample user data:', users[0] || 'No users found');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixCadToken()
  .then(() => {
    console.log('🎉 cad_token fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 cad_token fix failed:', error);
    process.exit(1);
  }); 