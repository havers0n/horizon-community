/**
 * Тест реального JWT токена для выявления проблемы с валидацией
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

dotenv.config();

console.log('🔍 ТЕСТ РЕАЛЬНОГО JWT ТОКЕНА\n');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют обязательные переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealJWT() {
  try {
    // 1. Создаем тестового пользователя с валидным email
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('1️⃣ Создание тестового пользователя...');
    console.log('Email:', testEmail);
    
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Ошибка создания пользователя:', signUpError.message);
      return;
    }
    
    console.log('✅ Пользователь создан:', user.email);
    
    // 2. Входим в систему
    console.log('\n2️⃣ Вход в систему...');
    
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Ошибка входа:', signInError.message);
      return;
    }
    
    console.log('✅ Вход выполнен успешно');
    console.log('Access token получен:', session.access_token ? '✅' : '❌');
    
    const accessToken = session.access_token;
    console.log('Длина токена:', accessToken.length, 'символов');
    
    // 3. Проверяем токен через Supabase
    console.log('\n3️⃣ Проверка токена через Supabase...');
    
    const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser(accessToken);
    
    if (verifyError) {
      console.error('❌ Ошибка проверки через Supabase:', verifyError.message);
      console.log('Код ошибки:', verifyError.status);
    } else {
      console.log('✅ Токен проверен через Supabase');
      console.log('Пользователь:', verifiedUser.email);
    }
    
    // 4. Декодируем токен без проверки подписи
    console.log('\n4️⃣ Декодирование токена без проверки подписи...');
    
    try {
      const decodedWithoutVerification = jwt.decode(accessToken);
      console.log('✅ Токен декодирован без проверки подписи');
      console.log('Payload:', {
        sub: decodedWithoutVerification.sub,
        email: decodedWithoutVerification.email,
        role: decodedWithoutVerification.role,
        exp: new Date(decodedWithoutVerification.exp * 1000).toISOString(),
        iat: new Date(decodedWithoutVerification.iat * 1000).toISOString(),
        aud: decodedWithoutVerification.aud,
        iss: decodedWithoutVerification.iss
      });
    } catch (error) {
      console.error('❌ Ошибка декодирования:', error.message);
    }
    
    // 5. Проверяем токен локально с JWT_SECRET
    console.log('\n5️⃣ Проверка токена локально с JWT_SECRET...');
    
    if (process.env.JWT_SECRET) {
      try {
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        console.log('✅ Токен проверен локально с JWT_SECRET');
        console.log('Декодированный токен:', {
          sub: decodedToken.sub,
          email: decodedToken.email,
          role: decodedToken.role,
          exp: new Date(decodedToken.exp * 1000).toISOString()
        });
      } catch (jwtError) {
        console.error('❌ Ошибка локальной проверки JWT:', jwtError.message);
        console.log('Тип ошибки:', jwtError.name);
        
        if (jwtError.name === 'JsonWebTokenError') {
          console.log('⚠️ Это указывает на несоответствие JWT_SECRET с секретом Supabase');
        } else if (jwtError.name === 'TokenExpiredError') {
          console.log('⚠️ Токен истек');
        } else if (jwtError.name === 'NotBeforeError') {
          console.log('⚠️ Токен еще не действителен');
        }
      }
    } else {
      console.error('❌ JWT_SECRET не установлен');
    }
    
    // 6. Проверяем алгоритм подписи
    console.log('\n6️⃣ Анализ алгоритма подписи...');
    
    try {
      const header = jwt.decode(accessToken, { complete: true });
      console.log('Алгоритм подписи:', header.header.alg);
      console.log('Тип токена:', header.header.typ);
      console.log('Kid (Key ID):', header.header.kid);
    } catch (error) {
      console.error('❌ Ошибка анализа заголовка:', error.message);
    }
    
    // 7. Сравнение с тестовым токеном
    console.log('\n7️⃣ Сравнение с тестовым токеном...');
    
    const testPayload = {
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET);
    console.log('Тестовый токен создан с JWT_SECRET');
    
    try {
      const decodedTest = jwt.verify(testToken, process.env.JWT_SECRET);
      console.log('✅ Тестовый токен валидируется локально');
    } catch (error) {
      console.error('❌ Тестовый токен не валидируется:', error.message);
    }
    
    // 8. Попробуем проверить Supabase токен с тестовым секретом
    console.log('\n8️⃣ Проверка Supabase токена с тестовым секретом...');
    
    try {
      const decodedWithTestSecret = jwt.verify(accessToken, process.env.JWT_SECRET);
      console.log('✅ Supabase токен валидируется с JWT_SECRET');
    } catch (error) {
      console.error('❌ Supabase токен НЕ валидируется с JWT_SECRET:', error.message);
      console.log('🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
      console.log('1. JWT_SECRET не совпадает с секретом в Supabase');
      console.log('2. Supabase использует другой алгоритм подписи');
      console.log('3. Токен содержит дополнительные поля');
      console.log('4. Проблема с кодировкой или форматированием');
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

testRealJWT(); 