import jwt from 'jsonwebtoken';

// Секретный ключ для подписи токена (в продакшене должен быть в переменных окружения)
const JWT_SECRET = 'your-super-secret-jwt-key-for-testing';

// Тестовые данные пользователя
const testUser = {
  id: 1,
  username: 'test_dispatcher',
  email: 'dispatcher@test.com',
  role: 'Dispatch',
  status: 'active',
  departmentId: 5, // Dispatch Department
  rank: 'Dispatcher',
  authId: 'test-auth-id-123'
};

// Создаем JWT токен
const token = jwt.sign(
  {
    user: testUser,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 часа
    iat: Math.floor(Date.now() / 1000)
  },
  JWT_SECRET
);

console.log('🔑 Тестовый JWT токен создан:');
console.log('=====================================');
console.log(token);
console.log('=====================================');
console.log('\n📋 Информация о пользователе:');
console.log('Email:', testUser.email);
console.log('Роль:', testUser.role);
console.log('Департамент ID:', testUser.departmentId);
console.log('Ранг:', testUser.rank);
console.log('\n💡 Для использования:');
console.log('1. Откройте DevTools в браузере');
console.log('2. Перейдите в Application/Storage -> Local Storage');
console.log('3. Добавьте ключ "auth_token" со значением токена выше');
console.log('4. Обновите страницу'); 