const { config } = require('dotenv');
const path = require('path');

console.log('🚀 Тестируем загрузку .env файла...');

// Загружаем .env из текущей директории с явным указанием пути
const result = config({ path: path.resolve(__dirname, '.env') });

console.log('📋 Результат загрузки:', result);
console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Найден' : 'НЕ найден');
console.log('🔑 DB_PASSWORD:', process.env.DB_PASSWORD ? 'Найден' : 'НЕ найден');

if (process.env.DATABASE_URL) {
  console.log('🔗 DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

if (process.env.DB_PASSWORD) {
  console.log('🔑 DB_PASSWORD preview:', process.env.DB_PASSWORD.substring(0, 3) + '***');
} 