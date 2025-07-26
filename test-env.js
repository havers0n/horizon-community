import { config } from 'dotenv';
import { resolve } from 'path';

console.log('🔍 Тестируем загрузку .env файла...');

// Пробуем разные пути
const paths = [
  '.env',
  './.env',
  resolve('.env'),
  resolve('./.env')
];

for (const path of paths) {
  console.log(`Пробуем путь: ${path}`);
  const result = config({ path });
  console.log(`Результат: ${result.parsed ? 'Успешно' : 'Неудачно'}`);
  if (result.parsed) {
    console.log('Переменные:', Object.keys(result.parsed));
    console.log('DATABASE_URL:', result.parsed.DATABASE_URL ? 'Найден' : 'Не найден');
  }
}

console.log('\n🔍 Проверяем process.env:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Найден' : 'Не найден'); 