// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Проверка переменных окружения...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Установлен' : '❌ Отсутствует');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Установлен' : '❌ Отсутствует');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Установлен' : '❌ Отсутствует');

if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL не найден в переменных окружения');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY не найден в переменных окружения');
  process.exit(1);
}

console.log('✅ Все необходимые переменные окружения загружены'); 