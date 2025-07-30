/**
 * Скрипт для применения исправлений JWT аутентификации
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 ПРИМЕНЕНИЕ ИСПРАВЛЕНИЙ JWT АУТЕНТИФИКАЦИИ\n');

// 1. Проверяем наличие файлов
console.log('1️⃣ ПРОВЕРКА ФАЙЛОВ:');

const filesToCheck = [
  'middleware/auth-fixed.middleware.ts',
  'services/AuthService.ts',
  'JWT_AUTH_FIX_REPORT.md'
];

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - найден`);
  } else {
    console.log(`❌ ${file} - не найден`);
  }
});

// 2. Рекомендации по применению исправлений
console.log('\n2️⃣ РЕКОМЕНДАЦИИ ПО ПРИМЕНЕНИЮ:');

console.log('\n📋 ШАГ 1: Заменить middleware аутентификации');
console.log('• Скопировать содержимое middleware/auth-fixed.middleware.ts');
console.log('• Заменить содержимое middleware/auth.middleware.ts');
console.log('• Или переименовать auth-fixed.middleware.ts в auth.middleware.ts');

console.log('\n📋 ШАГ 2: Проверить переменные окружения');
console.log('• Убедиться, что SUPABASE_URL установлен');
console.log('• Проверить SUPABASE_SERVICE_ROLE_KEY');
console.log('• JWT_SECRET можно оставить для совместимости');

console.log('\n📋 ШАГ 3: Обновить импорты в routes');
console.log('• Проверить все файлы, которые импортируют middleware');
console.log('• Убедиться, что используются правильные функции');

console.log('\n📋 ШАГ 4: Протестировать аутентификацию');
console.log('• Запустить сервер');
console.log('• Попробовать войти в систему');
console.log('• Проверить API запросы');

// 3. Проверка переменных окружения
console.log('\n3️⃣ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:');

const envVars = [
  'SUPABASE_URL',
  'VITE_SUPABASE_URL', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName} - установлен`);
  } else {
    console.log(`❌ ${varName} - не установлен`);
  }
});

// 4. Создание backup
console.log('\n4️⃣ СОЗДАНИЕ BACKUP:');

const backupDir = path.join(process.cwd(), 'backup', 'jwt-fix');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('✅ Создана папка backup/jwt-fix');
}

const filesToBackup = [
  'middleware/auth.middleware.ts',
  'services/AuthService.ts'
];

filesToBackup.forEach(file => {
  const sourcePath = path.join(process.cwd(), file);
  const backupPath = path.join(backupDir, path.basename(file));
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, backupPath);
    console.log(`✅ Создан backup: ${file}`);
  } else {
    console.log(`⚠️ Файл не найден для backup: ${file}`);
  }
});

// 5. Инструкции по тестированию
console.log('\n5️⃣ ИНСТРУКЦИИ ПО ТЕСТИРОВАНИЮ:');

console.log('\n🧪 ТЕСТ 1: Проверка middleware');
console.log('• Запустить сервер: npm run dev');
console.log('• Отправить запрос без токена:');
console.log('  curl http://localhost:3000/api/auth/me');
console.log('• Ожидается: 401 Unauthorized');

console.log('\n🧪 ТЕСТ 2: Проверка с валидным токеном');
console.log('• Войти в систему через клиент');
console.log('• Получить токен из localStorage или cookies');
console.log('• Отправить запрос с токеном:');
console.log('  curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/me');
console.log('• Ожидается: 200 OK с данными пользователя');

console.log('\n🧪 ТЕСТ 3: Проверка с невалидным токеном');
console.log('• Отправить запрос с невалидным токеном:');
console.log('  curl -H "Authorization: Bearer invalid" http://localhost:3000/api/auth/me');
console.log('• Ожидается: 401 Unauthorized');

// 6. Возможные проблемы и решения
console.log('\n6️⃣ ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ:');

console.log('\n❌ ПРОБЛЕМА: Ошибка "Cannot find module"');
console.log('✅ РЕШЕНИЕ: Проверить пути импорта в middleware');

console.log('\n❌ ПРОБЛЕМА: Ошибка "SUPABASE_URL is required"');
console.log('✅ РЕШЕНИЕ: Установить переменную SUPABASE_URL в .env');

console.log('\n❌ ПРОБЛЕМА: Ошибка "Invalid token"');
console.log('✅ РЕШЕНИЕ: Проверить, что токен получен от Supabase Auth');

console.log('\n❌ ПРОБЛЕМА: Ошибка "User not found"');
console.log('✅ РЕШЕНИЕ: Проверить синхронизацию пользователей с локальной БД');

// 7. Заключение
console.log('\n7️⃣ ЗАКЛЮЧЕНИЕ:');

console.log('\n🎯 ОСНОВНЫЕ ИЗМЕНЕНИЯ:');
console.log('• Убрана локальная JWT валидация');
console.log('• Используется только Supabase Auth');
console.log('• Исправлены переменные окружения');
console.log('• Улучшена обработка ошибок');

console.log('\n🚀 СЛЕДУЮЩИЕ ШАГИ:');
console.log('1. Применить исправления в коде');
console.log('2. Протестировать аутентификацию');
console.log('3. Проверить все API endpoints');
console.log('4. Обновить документацию');

console.log('\n📚 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:');
console.log('• Подробный отчет: JWT_AUTH_FIX_REPORT.md');
console.log('• Исправленный middleware: middleware/auth-fixed.middleware.ts');
console.log('• Диагностические скрипты: debug-jwt-auth.js, test-jwt-simple.js');

console.log('\n✅ ИСПРАВЛЕНИЯ ГОТОВЫ К ПРИМЕНЕНИЮ'); 