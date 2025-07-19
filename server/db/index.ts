import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// Default to local Supabase instance for development
const defaultLocalUrl = 'postgresql://postgres:postgres@localhost:54322/postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || defaultLocalUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Additional configuration for Supabase
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Connection timeout
});

export const db = drizzle(pool, { schema });
