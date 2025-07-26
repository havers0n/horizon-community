import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from '@roleplay-identity/shared-schema';

const { Pool } = pkg;

// 1. Получаем ШАБЛОН строки подключения
let connectionStringTemplate = process.env.DATABASE_URL;

// 2. Получаем пароль из отдельной переменной
const dbPassword = process.env.DB_PASSWORD;

// 3. Проверяем, что все переменные на месте
if (!connectionStringTemplate || !dbPassword) {
  throw new Error("DATABASE_URL и DB_PASSWORD должны быть установлены в .env файле!");
}

// 4. Подставляем пароль в шаблон
// Важно! кодируем пароль, чтобы спецсимволы не ломали URL
const connectionString = connectionStringTemplate.replace(
  '[YOUR-PASSWORD]', 
  encodeURIComponent(dbPassword) // encodeURIComponent правильно обработает '!' и другие спецсимволы
);

console.log("DATABASE_URL (masked):", connectionString.replace(/:(.*)@/, ':***@'));

// Для прямого подключения к Supabase SSL все еще нужен
const sslConfig = {
  rejectUnauthorized: false,
};

console.log("Creating PG Pool using 'pg' for direct connection");

export const pool = new Pool({
  connectionString: connectionString, // Используем уже готовую строку с паролем
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

export const db = drizzle(pool, { schema });
