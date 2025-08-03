#!/usr/bin/env node

/**
 * Скрипт для принудительной пересборки проекта
 * Очищает все кэши и пересобирает проект с нуля
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔧 ${title}`, 'cyan');
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

// Очистка всех кэшей и собранных файлов
function cleanAll() {
  logSection('Очистка всех кэшей и собранных файлов');
  
  const dirsToClean = [
    'dist',
    'node_modules/.cache',
    '.nx/cache',
    'apps/client/node_modules/.vite',
    'apps/mdtclient/node_modules/.vite'
  ];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
        logSuccess(`Очищен: ${dir}`);
      } catch (error) {
        logWarning(`Не удалось очистить ${dir}: ${error.message}`);
      }
    } else {
      logInfo(`${dir}: не существует, пропускаем`);
    }
  });
}

// Установка зависимостей
function installDependencies() {
  logSection('Установка зависимостей');
  
  try {
    logInfo('Установка зависимостей в корне проекта...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Зависимости установлены');
    
    // Установка в shared библиотеке
    if (fs.existsSync('libs/shared/schema')) {
      logInfo('Установка зависимостей в shared/schema...');
      execSync('cd libs/shared/schema && npm install', { stdio: 'inherit' });
      logSuccess('Зависимости shared/schema установлены');
    }
    
  } catch (error) {
    logError(`Ошибка установки зависимостей: ${error.message}`);
    throw error;
  }
}

// Сборка проекта
function buildProject() {
  logSection('Сборка проекта');
  
  try {
    logInfo('Сборка для продакшена...');
    execSync('npm run build:production', { stdio: 'inherit' });
    logSuccess('Проект собран успешно');
  } catch (error) {
    logError(`Ошибка сборки: ${error.message}`);
    throw error;
  }
}

// Проверка собранных файлов
function checkBuiltFiles() {
  logSection('Проверка собранных файлов');
  
  const requiredFiles = [
    'dist/apps/client/index.html',
    'dist/apps/client/js',
    'dist/apps/mdtclient/index.html',
    'dist/apps/mdtclient/js'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory()) {
        const files = fs.readdirSync(file);
        logSuccess(`${file}: найдено ${files.length} файлов`);
      } else {
        logSuccess(`${file}: найден`);
      }
    } else {
      logError(`${file}: НЕ НАЙДЕН`);
    }
  });
}

// Проверка на наличие zod в собранных файлах
function checkZodInBuiltFiles() {
  logSection('Проверка наличия zod в собранных файлах');
  
  const jsDirs = [
    'dist/apps/client/js',
    'dist/apps/mdtclient/js'
  ];
  
  jsDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        logInfo(`Проверка ${dir}: ${jsFiles.length} JS файлов`);
        
        jsFiles.forEach(file => {
          const filePath = path.join(dir, file);
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('zod') || content.includes('Zod')) {
              logSuccess(`${file}: содержит zod`);
            } else {
              logInfo(`${file}: не содержит zod`);
            }
          } catch (error) {
            logWarning(`${file}: ошибка чтения`);
          }
        });
      } catch (error) {
        logError(`${dir}: ошибка чтения директории`);
      }
    } else {
      logWarning(`${dir}: директория не найдена`);
    }
  });
}

// Проверка index.html
function checkIndexHtml() {
  logSection('Проверка index.html файлов');
  
  const htmlFiles = [
    'dist/apps/client/index.html',
    'dist/apps/mdtclient/index.html'
  ];
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Проверка на ES модули
        if (content.includes('type="module"')) {
          logSuccess(`${file}: использует ES модули`);
        } else {
          logWarning(`${file}: не использует ES модули`);
        }
        
        // Проверка на ссылки на JS файлы
        const jsMatches = content.match(/src="[^"]*\.js"/g);
        if (jsMatches) {
          logSuccess(`${file}: содержит ${jsMatches.length} JS файлов`);
          jsMatches.slice(0, 3).forEach(match => {
            logInfo(`  ${match}`);
          });
        } else {
          logWarning(`${file}: не содержит JS файлов`);
        }
        
      } catch (error) {
        logError(`${file}: ошибка чтения`);
      }
    } else {
      logError(`${file}: файл не найден`);
    }
  });
}

// Основная функция
async function main() {
  log('🚀 Принудительная пересборка проекта', 'bright');
  
  try {
    cleanAll();
    installDependencies();
    buildProject();
    checkBuiltFiles();
    checkZodInBuiltFiles();
    checkIndexHtml();
    
    logSection('ИТОГОВЫЙ ОТЧЕТ');
    logSuccess('🎉 Пересборка завершена успешно!');
    
    logInfo('Следующие шаги:');
    logInfo('1. Загрузите новые файлы на VPS');
    logInfo('2. Перезапустите приложение: pm2 restart roleplayidentity');
    logInfo('3. Проверьте консоль браузера');
    logInfo('4. Запустите диагностику: npm run check-modules');
    
  } catch (error) {
    logError(`❌ Ошибка пересборки: ${error.message}`);
    process.exit(1);
  }
}

// Запуск пересборки
if (require.main === module) {
  main().catch(error => {
    logError(`Критическая ошибка: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main }; 