import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Простой тест переменных окружения...');
console.log('📁 Текущая директория:', __dirname);

// Загружаем .env из корневой папки проекта
const result = config({ path: resolve(__dirname, '../../.env') });

console.log('📋 Результат загрузки .env:', result);
console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Найден' : 'НЕ найден');
console.log('🔑 DB_PASSWORD:', process.env.DB_PASSWORD ? 'Найден' : 'НЕ найден');

if (process.env.DATABASE_URL) {
  console.log('🔗 DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

if (process.env.DB_PASSWORD) {
  console.log('🔑 DB_PASSWORD preview:', process.env.DB_PASSWORD.substring(0, 3) + '***');
} 