import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';

console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);
console.log("DRIZZLE DATABASE_URL:", process.env.DATABASE_URL);

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// Default to local Supabase instance for development
const defaultLocalUrl = 'postgresql://postgres:postgres@localhost:54322/postgres';

// Check if we're connecting to Supabase (production or remote)
const isSupabaseConnection = process.env.DATABASE_URL?.includes('supabase.com') || 
                            process.env.DATABASE_URL?.includes('aws-0-eu-north-1.pooler.supabase.com');

console.trace("Creating PG Pool here");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || defaultLocalUrl,
  ssl: isSupabaseConnection ? { rejectUnauthorized: false } : false,
  // Supabase optimized settings
  max: 10, // Reduced from 20 to avoid connection limits
  idleTimeoutMillis: 60000, // Increased to 60 seconds
  connectionTimeoutMillis: 10000, // Increased to 10 seconds
  // Supabase specific settings
  ...(isSupabaseConnection && {
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    keepAliveInitialDelayMillis: 30000, // Increased to 30 seconds
    // Connection retry settings
    maxUses: 7500, // Supabase recommended
    // Error handling
    allowExitOnIdle: false,
  })
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't exit the process, let it reconnect
});

pool.on('connect', () => {
  console.log('✅ New database connection established');
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed from pool');
});

export const db = drizzle(pool, { schema });
