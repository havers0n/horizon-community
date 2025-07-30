/**
 * Упрощенный тест JWT для выявления проблемы с валидацией
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

dotenv.config();

console.log('🔍 УПРОЩЕННЫЙ ТЕСТ JWT\n');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют обязательные переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testJWTSimple() {
  try {
    // 1. Проверяем переменные окружения
    console.log('1️⃣ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
    console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅' : '❌');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');
    
    // 2. Создаем тестовый токен с JWT_SECRET
    console.log('\n2️⃣ СОЗДАНИЕ ТЕСТОВОГО ТОКЕНА:');
    
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET не установлен');
      return;
    }
    
    const testPayload = {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      aud: 'authenticated',
      iss: supabaseUrl
    };
    
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET);
    console.log('✅ Тестовый токен создан');
    console.log('Длина токена:', testToken.length, 'символов');
    
    // 3. Проверяем тестовый токен локально
    console.log('\n3️⃣ ПРОВЕРКА ТЕСТОВОГО ТОКЕНА ЛОКАЛЬНО:');
    
    try {
      const decodedTest = jwt.verify(testToken, process.env.JWT_SECRET);
      console.log('✅ Тестовый токен валидируется локально');
      console.log('Payload:', {
        sub: decodedTest.sub,
        email: decodedTest.email,
        role: decodedTest.role,
        exp: new Date(decodedTest.exp * 1000).toISOString()
      });
    } catch (error) {
      console.error('❌ Ошибка валидации тестового токена:', error.message);
    }
    
    // 4. Проверяем тестовый токен через Supabase
    console.log('\n4️⃣ ПРОВЕРКА ТЕСТОВОГО ТОКЕНА ЧЕРЕЗ SUPABASE:');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(testToken);
      
      if (error) {
        console.log('ℹ️ Supabase не принимает тестовый токен (ожидаемо):', error.message);
      } else {
        console.log('⚠️ Неожиданно: Supabase принял тестовый токен');
      }
    } catch (error) {
      console.error('❌ Ошибка проверки через Supabase:', error.message);
    }
    
    // 5. Анализируем структуру токенов
    console.log('\n5️⃣ АНАЛИЗ СТРУКТУРЫ ТОКЕНОВ:');
    
    // Декодируем тестовый токен
    const testDecoded = jwt.decode(testToken, { complete: true });
    console.log('Тестовый токен - Алгоритм:', testDecoded.header.alg);
    console.log('Тестовый токен - Тип:', testDecoded.header.typ);
    
    // 6. Проверяем, что происходит в AuthService
    console.log('\n6️⃣ СИМУЛЯЦИЯ AUTHSERVICE:');
    
    // Симулируем вызов supabase.auth.getUser с невалидным токеном
    try {
      const { data: { user }, error } = await supabase.auth.getUser('invalid-token');
      
      if (error) {
        console.log('✅ Supabase корректно отклоняет невалидный токен');
        console.log('Тип ошибки:', error.message);
      }
    } catch (error) {
      console.error('❌ Неожиданная ошибка:', error.message);
    }
    
    // 7. Проверяем конфигурацию Supabase
    console.log('\n7️⃣ ПРОВЕРКА КОНФИГУРАЦИИ SUPABASE:');
    
    try {
      // Попробуем получить информацию о проекте
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        console.log('ℹ️ Ошибка доступа к таблице users:', error.message);
      } else {
        console.log('✅ Доступ к базе данных работает');
      }
    } catch (error) {
      console.error('❌ Ошибка подключения к базе:', error.message);
    }
    
    // 8. Анализ проблемы
    console.log('\n8️⃣ АНАЛИЗ ПРОБЛЕМЫ:');
    console.log('🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ ОШИБКИ "Invalid token":');
    console.log('');
    console.log('1. НЕСООТВЕТСТВИЕ JWT_SECRET:');
    console.log('   • JWT_SECRET в .env не совпадает с секретом в Supabase');
    console.log('   • Проверьте настройки в Supabase Dashboard > Settings > API');
    console.log('');
    console.log('2. ПРОБЛЕМА С АЛГОРИТМОМ ПОДПИСИ:');
    console.log('   • Supabase может использовать RS256 вместо HS256');
    console.log('   • Проверьте алгоритм в заголовке JWT токена');
    console.log('');
    console.log('3. ПРОБЛЕМА С URL:');
    console.log('   • Сервер использует VITE_SUPABASE_URL вместо SUPABASE_URL');
    console.log('   • Проверьте переменные окружения');
    console.log('');
    console.log('4. ПРОБЛЕМА С КЛЮЧАМИ:');
    console.log('   • SUPABASE_SERVICE_ROLE_KEY может быть неверным');
    console.log('   • Проверьте ключи в Supabase Dashboard');
    console.log('');
    console.log('5. ПРОБЛЕМА С ВРЕМЕННЫМИ МЕТКАМИ:');
    console.log('   • Разница во времени между сервером и Supabase');
    console.log('   • Проверьте системное время');
    
    // 9. Рекомендации по исправлению
    console.log('\n9️⃣ РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ:');
    console.log('');
    console.log('1. Проверьте JWT Secret в Supabase Dashboard:');
    console.log('   • Settings > API > JWT Settings > JWT Secret');
    console.log('   • Скопируйте секрет в .env как JWT_SECRET');
    console.log('');
    console.log('2. Исправьте переменные окружения:');
    console.log('   • Используйте SUPABASE_URL вместо VITE_SUPABASE_URL для сервера');
    console.log('   • Убедитесь, что SUPABASE_SERVICE_ROLE_KEY корректный');
    console.log('');
    console.log('3. Проверьте алгоритм подписи:');
    console.log('   • Supabase по умолчанию использует HS256');
    console.log('   • Убедитесь, что JWT_SECRET достаточно длинный (минимум 32 символа)');
    console.log('');
    console.log('4. Альтернативное решение:');
    console.log('   • Используйте только Supabase Auth без локальной JWT валидации');
    console.log('   • Положитесь на supabase.auth.getUser() для проверки токенов');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

testJWTSimple(); 