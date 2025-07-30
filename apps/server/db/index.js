// Временный файл для совместимости с MDTService и AuthService
// TODO: Переписать MDTService и AuthService для использования SupabaseStorage

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

// Временные заглушки для совместимости
const forumCategories = {};
const forumTopics = {};
const forumPosts = {};
const forumReactions = {};
const forumSubscriptions = {};
const forumViews = {};
const forumStats = {};
const users = {};
const departments = {};

export { 
  pool, 
  db,
  forumCategories,
  forumTopics,
  forumPosts,
  forumReactions,
  forumSubscriptions,
  forumViews,
  forumStats,
  users,
  departments
}; 