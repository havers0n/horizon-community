import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// Default to local Supabase instance for development
const defaultLocalUrl = 'postgresql://postgres:postgres@localhost:54322/postgres';

// Check if we're connecting to Supabase (production or remote)
const isSupabaseConnection = process.env.DATABASE_URL?.includes('supabase.com') || 
                            process.env.DATABASE_URL?.includes('aws-0-eu-north-1.pooler.supabase.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || defaultLocalUrl,
  ssl: isSupabaseConnection ? { rejectUnauthorized: false } : false,
  // Additional configuration for Supabase
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Increased connection timeout
  // Supabase specific settings
  ...(isSupabaseConnection && {
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
});

export const db = drizzle(pool, { schema });
