/**
 * Диагностический скрипт для проверки JWT аутентификации
 * Выявляет проблемы с конфигурацией Supabase и JWT
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

dotenv.config();

console.log('🔍 ДИАГНОСТИКА JWT АУТЕНТИФИКАЦИИ\n');

// 1. Проверка переменных окружения
console.log('1️⃣ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅' : '❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');

// Определяем правильный URL
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА: Отсутствуют обязательные переменные окружения');
  process.exit(1);
}

console.log('\n2️⃣ ИНИЦИАЛИЗАЦИЯ SUPABASE КЛИЕНТА:');
console.log('URL:', supabaseUrl);

// 2. Создание Supabase клиента
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 3. Проверка подключения к Supabase
console.log('\n3️⃣ ПРОВЕРКА ПОДКЛЮЧЕНИЯ К SUPABASE:');
try {
  const { data, error } = await supabase.from('users').select('count').limit(1);
  if (error) {
    console.error('❌ Ошибка подключения:', error.message);
  } else {
    console.log('✅ Подключение к Supabase успешно');
  }
} catch (error) {
  console.error('❌ Ошибка подключения:', error.message);
}

// 4. Проверка JWT секрета
console.log('\n4️⃣ ПРОВЕРКА JWT СЕКРЕТА:');
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET установлен');
  console.log('Длина секрета:', process.env.JWT_SECRET.length, 'символов');
  
  // Попробуем создать тестовый токен
  try {
    const testPayload = { 
      sub: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET);
    console.log('✅ Тестовый JWT токен создан успешно');
    
    // Проверим токен
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ JWT токен валидируется успешно');
    console.log('Декодированный payload:', decoded);
  } catch (error) {
    console.error('❌ Ошибка работы с JWT:', error.message);
  }
} else {
  console.error('❌ JWT_SECRET не установлен');
}

// 5. Проверка Supabase Auth
console.log('\n5️⃣ ПРОВЕРКА SUPABASE AUTH:');
try {
  // Попробуем получить информацию о пользователе с невалидным токеном
  const { data: { user }, error } = await supabase.auth.getUser('invalid-token');
  
  if (error) {
    console.log('✅ Supabase Auth работает (ожидаемая ошибка для невалидного токена)');
    console.log('Тип ошибки:', error.message);
  } else {
    console.log('⚠️ Неожиданный результат для невалидного токена');
  }
} catch (error) {
  console.error('❌ Ошибка Supabase Auth:', error.message);
}

// 6. Проверка конфигурации JWT в Supabase
console.log('\n6️⃣ ПРОВЕРКА КОНФИГУРАЦИИ JWT В SUPABASE:');
try {
  // Попробуем получить JWT секрет из Supabase (если доступно)
  const { data, error } = await supabase.rpc('get_jwt_secret');
  if (error) {
    console.log('ℹ️ Не удалось получить JWT секрет из Supabase (это нормально)');
  } else {
    console.log('✅ JWT секрет получен из Supabase');
  }
} catch (error) {
  console.log('ℹ️ Функция get_jwt_secret недоступна (это нормально)');
}

// 7. Создание тестового пользователя и токена
console.log('\n7️⃣ СОЗДАНИЕ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ:');
try {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  const { data: { user }, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  
  if (error) {
    console.error('❌ Ошибка создания тестового пользователя:', error.message);
  } else {
    console.log('✅ Тестовый пользователь создан:', user.email);
    
    // Попробуем войти
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Ошибка входа:', signInError.message);
    } else {
      console.log('✅ Вход выполнен успешно');
      console.log('Access token получен:', session.access_token ? '✅' : '❌');
      
      // Проверим токен через Supabase
      const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser(session.access_token);
      
      if (verifyError) {
        console.error('❌ Ошибка проверки токена через Supabase:', verifyError.message);
      } else {
        console.log('✅ Токен проверен через Supabase:', verifiedUser.email);
      }
      
      // Попробуем проверить токен локально с JWT_SECRET
      if (process.env.JWT_SECRET) {
        try {
          const decodedToken = jwt.verify(session.access_token, process.env.JWT_SECRET);
          console.log('✅ Токен проверен локально с JWT_SECRET');
          console.log('Декодированный токен:', {
            sub: decodedToken.sub,
            email: decodedToken.email,
            role: decodedToken.role,
            exp: new Date(decodedToken.exp * 1000).toISOString()
          });
        } catch (jwtError) {
          console.error('❌ Ошибка локальной проверки JWT:', jwtError.message);
          console.log('⚠️ Это указывает на несоответствие JWT_SECRET с секретом Supabase');
        }
      }
    }
  }
} catch (error) {
  console.error('❌ Ошибка тестирования аутентификации:', error.message);
}

// 8. Рекомендации
console.log('\n8️⃣ РЕКОМЕНДАЦИИ:');
console.log('• Убедитесь, что JWT_SECRET в .env совпадает с JWT Secret в настройках Supabase');
console.log('• Проверьте, что используется правильный SUPABASE_URL (не VITE_SUPABASE_URL для сервера)');
console.log('• Убедитесь, что SUPABASE_SERVICE_ROLE_KEY корректный');
console.log('• Проверьте настройки JWT в Supabase Dashboard > Settings > API');

console.log('\n🔍 ДИАГНОСТИКА ЗАВЕРШЕНА'); 