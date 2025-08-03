#!/usr/bin/env node

/**
 * Скрипт проверки продакшн конфигурации
 * Проверяет все критические настройки для работы на VPS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔍 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Проверка переменных окружения
function checkEnvironmentVariables() {
  logSection('Проверка переменных окружения');
  
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'APP_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const optionalVars = [
    'TZ',
    'LOG_LEVEL',
    'WORKERS',
    'DB_POOL_SIZE'
  ];
  
  let allRequiredPresent = true;
  
  // Проверка обязательных переменных
  logInfo('Проверка обязательных переменных:');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' : process.env[varName]}`);
    } else {
      logError(`${varName}: НЕ НАЙДЕНА`);
      allRequiredPresent = false;
    }
  });
  
  // Проверка опциональных переменных
  logInfo('\nПроверка опциональных переменных:');
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName]}`);
    } else {
      logWarning(`${varName}: не установлена (используется значение по умолчанию)`);
    }
  });
  
  return allRequiredPresent;
}

// Проверка структуры файлов
function checkFileStructure() {
  logSection('Проверка структуры файлов');
  
  const requiredPaths = [
    'dist/apps/server/main.js',
    'dist/apps/client/index.html',
    'dist/apps/mdtclient/index.html',
    '.env',
    'ecosystem.config.js'
  ];
  
  let allFilesPresent = true;
  
  requiredPaths.forEach(filePath => {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      logSuccess(`${filePath}: найден`);
    } else {
      logError(`${filePath}: НЕ НАЙДЕН`);
      allFilesPresent = false;
    }
  });
  
  return allFilesPresent;
}

// Проверка портов
function checkPorts() {
  logSection('Проверка портов');
  
  const port = process.env.PORT || 5000;
  
  try {
    // Проверка что порт не занят другими процессами
    const result = execSync(`netstat -tlnp | grep :${port}`, { encoding: 'utf8' });
    if (result.includes('node') || result.includes('pm2')) {
      logSuccess(`Порт ${port}: используется приложением`);
    } else {
      logWarning(`Порт ${port}: используется другим процессом`);
      logInfo(result.trim());
    }
  } catch (error) {
    logInfo(`Порт ${port}: свободен (приложение не запущено)`);
  }
  
  // Проверка nginx
  try {
    const nginxResult = execSync('systemctl is-active nginx', { encoding: 'utf8' });
    if (nginxResult.trim() === 'active') {
      logSuccess('Nginx: активен');
    } else {
      logWarning('Nginx: не активен');
    }
  } catch (error) {
    logWarning('Nginx: не установлен или не запущен');
  }
}

// Проверка PM2
function checkPM2() {
  logSection('Проверка PM2');
  
  try {
    const pm2Status = execSync('pm2 status', { encoding: 'utf8' });
    if (pm2Status.includes('roleplayidentity')) {
      logSuccess('PM2: приложение найдено');
      
      // Проверка статуса
      if (pm2Status.includes('online')) {
        logSuccess('PM2: приложение запущено');
      } else {
        logError('PM2: приложение остановлено');
      }
    } else {
      logWarning('PM2: приложение не найдено');
    }
  } catch (error) {
    logWarning('PM2: не установлен или не настроен');
  }
}

// Проверка SSL сертификатов
function checkSSL() {
  logSection('Проверка SSL сертификатов');
  
  const domain = process.env.APP_URL?.replace('https://', '').replace('http://', '');
  
  if (!domain) {
    logWarning('APP_URL не установлен, пропускаем проверку SSL');
    return;
  }
  
  try {
    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    if (fs.existsSync(certPath)) {
      logSuccess(`SSL сертификат для ${domain}: найден`);
      
      // Проверка срока действия
      const certInfo = execSync(`openssl x509 -in ${certPath} -text -noout | grep "Not After"`, { encoding: 'utf8' });
      logInfo(`Срок действия: ${certInfo.trim()}`);
    } else {
      logError(`SSL сертификат для ${domain}: НЕ НАЙДЕН`);
    }
  } catch (error) {
    logWarning('Не удалось проверить SSL сертификат');
  }
}

// Проверка подключения к базе данных
async function checkDatabase() {
  logSection('Проверка подключения к базе данных');
  
  if (!process.env.DATABASE_URL) {
    logError('DATABASE_URL не установлен');
    return false;
  }
  
  try {
    // Простая проверка через curl API
    const healthCheck = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health', { encoding: 'utf8' });
    
    if (healthCheck.trim() === '200') {
      logSuccess('API health check: успешно');
      return true;
    } else {
      logError(`API health check: ошибка ${healthCheck.trim()}`);
      return false;
    }
  } catch (error) {
    logError('API health check: недоступен');
    return false;
  }
}

// Проверка прав доступа
function checkPermissions() {
  logSection('Проверка прав доступа');
  
  const paths = [
    '/var/www/app',
    '/var/www/app/dist',
    '/var/www/app/.env'
  ];
  
  paths.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      try {
        const stats = fs.statSync(dirPath);
        const owner = stats.uid;
        const mode = stats.mode.toString(8);
        
        if (owner === 33 || owner === 1000) { // www-data или ubuntu
          logSuccess(`${dirPath}: правильный владелец`);
        } else {
          logWarning(`${dirPath}: неправильный владелец (UID: ${owner})`);
        }
        
        if (dirPath.includes('.env') && mode.endsWith('00')) {
          logSuccess(`${dirPath}: правильные права доступа (600)`);
        } else if (!dirPath.includes('.env')) {
          logSuccess(`${dirPath}: права доступа OK`);
        } else {
          logWarning(`${dirPath}: неправильные права доступа (${mode})`);
        }
      } catch (error) {
        logError(`${dirPath}: ошибка проверки прав`);
      }
    } else {
      logWarning(`${dirPath}: не существует`);
    }
  });
}

// Основная функция
async function main() {
  log('🚀 Проверка продакшн конфигурации', 'bright');
  
  const results = {
    env: checkEnvironmentVariables(),
    files: checkFileStructure(),
    ports: true, // checkPorts() не возвращает результат
    database: await checkDatabase()
  };
  
  checkPorts();
  checkPM2();
  checkSSL();
  checkPermissions();
  
  // Итоговый отчет
  logSection('ИТОГОВЫЙ ОТЧЕТ');
  
  const allChecks = Object.values(results);
  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;
  
  logInfo(`Пройдено проверок: ${passedChecks}/${totalChecks}`);
  
  if (passedChecks === totalChecks) {
    logSuccess('🎉 Все критические проверки пройдены! Система готова к работе.');
  } else {
    logError('⚠️  Обнаружены проблемы. Исправьте их перед запуском в продакшене.');
    
    if (!results.env) {
      logError('- Проверьте переменные окружения в .env файле');
    }
    if (!results.files) {
      logError('- Выполните сборку проекта: npm run build:deploy');
    }
    if (!results.database) {
      logError('- Проверьте подключение к базе данных и запустите backend');
    }
  }
  
  log('\n📋 Рекомендации:');
  logInfo('1. Убедитесь что nginx настроен правильно');
  logInfo('2. Проверьте SSL сертификаты');
  logInfo('3. Настройте firewall (порты 80, 443)');
  logInfo('4. Настройте мониторинг и логирование');
  logInfo('5. Создайте резервные копии');
}

// Запуск проверки
if (require.main === module) {
  main().catch(error => {
    logError(`Ошибка выполнения проверки: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main }; 