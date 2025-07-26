import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из папки apps/server/
config({ path: resolve(__dirname, '../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@roleplay-identity/shared-schema';

// 1. Получаем ШАБЛОН строки подключения
let connectionStringTemplate = process.env.DATABASE_URL;

// 2. Получаем пароль из отдельной переменной
const dbPassword = process.env.DB_PASSWORD;

// 3. Проверяем, что все переменные на месте
if (!connectionStringTemplate || !dbPassword) {
  throw new Error("DATABASE_URL и DB_PASSWORD должны быть установлены в .env файле!");
}

// 4. Подставляем пароль в шаблон
const connectionString = connectionStringTemplate.replace(
  '[YOUR-PASSWORD]', 
  encodeURIComponent(dbPassword)
);

// Создаем пул подключений для dev_schema
const devPool = new Pool({
  connectionString: connectionString,
  ssl: connectionString?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
});

// Функция для установки схемы поиска
const setSearchPath = async (client: any) => {
  await client.query('SET search_path TO dev_schema, public');
};

// Создаем Drizzle экземпляр для dev_schema
export const devDb = drizzle(devPool, { schema });

// Функция для выполнения операций в dev_schema
export const executeInDevSchema = async (operation: () => Promise<any>) => {
  const client = await devPool.connect();
  try {
    await setSearchPath(client);
    return await operation();
  } finally {
    client.release();
  }
};

// Функция для создания схемы dev_schema если она не существует
export const createDevSchema = async () => {
  const client = await devPool.connect();
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