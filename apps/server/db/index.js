// Временный файл для совместимости с MDTService и AuthService
// TODO: Переписать MDTService и AuthService для использования SupabaseStorage

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { 
  users, 
  departments,
  forumCategories,
  forumTopics,
  forumPosts,
  forumReactions,
  forumSubscriptions,
  forumViews,
  forumStats
} from '@roleplay-identity/shared-schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

export { 
  pool, 
  db, 
  users, 
  departments,
  forumCategories,
  forumTopics,
  forumPosts,
  forumReactions,
  forumSubscriptions,
  forumViews,
  forumStats
}; 