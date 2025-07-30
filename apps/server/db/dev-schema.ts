import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из папки apps/server/
config({ path: resolve(__dirname, '../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@roleplay-identity/shared-schema';
import { pool } from './index.js'; // Используем основной пул

// Создаем Drizzle экземпляр для dev_schema используя основной пул
export const devDb = drizzle(pool, { schema });

// Функция для установки схемы поиска
const setSearchPath = async (client: any) => {
  await client.query('SET search_path TO dev_schema, public');
};

// Функция для выполнения операций в dev_schema
export const executeInDevSchema = async (operation: () => Promise<any>) => {
  const client = await pool.connect();
  try {
    await setSearchPath(client);
    return await operation();
  } finally {
    client.release();
  }
};

// Функция для создания схемы dev_schema если она не существует
export const createDevSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS dev_schema');
    console.log('✅ Schema dev_schema created or already exists');
  } catch (error) {
    console.error('❌ Error creating dev_schema:', error);
    throw error;
  } finally {
    client.release();
  }
}; 