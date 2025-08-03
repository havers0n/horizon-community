#!/usr/bin/env node

/**
 * Скрипт для диагностики и исправления проблем с модулями в продакшене
 * Решает проблемы с импортами ES модулей, особенно zod
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

// Проверка зависимостей в package.json
function checkDependencies() {
  logSection('Проверка зависимостей');
  
  const packageFiles = [
    'package.json',
    'apps/client/package.json',
    'apps/mdtclient/package.json',
    'libs/shared/schema/package.json'
  ];
  
  packageFiles.forEach(pkgPath => {
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.zod) {
          logSuccess(`${pkgPath}: zod ${deps.zod} найден`);
        } else {
          logWarning(`${pkgPath}: zod отсутствует`);
        }
        
        if (deps['@hookform/resolvers']) {
          logSuccess(`${pkgPath}: @hookform/resolvers ${deps['@hookform/resolvers']} найден`);
        } else {
          logWarning(`${pkgPath}: @hookform/resolvers отсутствует`);
        }
      } catch (error) {
        logError(`${pkgPath}: ошибка чтения - ${error.message}`);
      }
    } else {
      logWarning(`${pkgPath}: файл не найден`);
    }
  });
}

// Проверка конфигурации Vite
function checkViteConfigs() {
  logSection('Проверка конфигурации Vite');
  
  const viteConfigs = [
    'apps/client/vite.config.ts',
    'apps/mdtclient/vite.config.ts'
  ];
  
  viteConfigs.forEach(configPath => {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        
        if (content.includes('external: [\'zod\']')) {
          logError(`${configPath}: содержит external: ['zod'] - это может вызывать проблемы`);
        } else {
          logSuccess(`${configPath}: не содержит проблемных external настроек`);
        }
        
        if (content.includes('manualChunks')) {
          logSuccess(`${configPath}: содержит manualChunks оптимизацию`);
        }
        
      } catch (error) {
        logError(`${configPath}: ошибка чтения - ${error.message}`);
      }
    } else {
      logWarning(`${configPath}: файл не найден`);
    }
  });
}

// Проверка импортов в коде
function checkImports() {
  logSection('Проверка импортов в коде');
  
  const searchPatterns = [
    'import.*zod',
    'import.*@hookform/resolvers',
    'from.*zod',
    'from.*@hookform/resolvers'
  ];
  
  const directories = [
    'apps/client/src',
    'apps/mdtclient/src',
    'libs/shared/schema/src'
  ];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      logInfo(`Проверка директории: ${dir}`);
      
      try {
        const result = execSync(`grep -r "import.*zod\|from.*zod" ${dir}`, { encoding: 'utf8' });
        const lines = result.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          logSuccess(`${dir}: найдено ${lines.length} импортов zod`);
          lines.slice(0, 3).forEach(line => {
            logInfo(`  ${line.trim()}`);
          });
          if (lines.length > 3) {
            logInfo(`  ... и еще ${lines.length - 3} импортов`);
          }
        } else {
          logWarning(`${dir}: импорты zod не найдены`);
        }
      } catch (error) {
        // grep возвращает 1 если ничего не найдено
        if (error.status === 1) {
          logWarning(`${dir}: импорты zod не найдены`);
        } else {
          logError(`${dir}: ошибка поиска - ${error.message}`);
        }
      }
    } else {
      logWarning(`${dir}: директория не найдена`);
    }
  });
}

// Проверка собранных файлов
function checkBuiltFiles() {
  logSection('Проверка собранных файлов');
  
  const builtDirs = [
    'dist/apps/client',
    'dist/apps/mdtclient'
  ];
  
  builtDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      logSuccess(`${dir}: директория существует`);
      
      // Проверка index.html
      const indexPath = path.join(dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        try {
          const content = fs.readFileSync(indexPath, 'utf8');
          
          if (content.includes('zod')) {
            logWarning(`${indexPath}: содержит ссылки на zod`);
          } else {
            logSuccess(`${indexPath}: не содержит проблемных ссылок на zod`);
          }
          
          // Проверка на ES модули
          if (content.includes('type="module"')) {
            logSuccess(`${indexPath}: использует ES модули`);
          } else {
            logWarning(`${indexPath}: не использует ES модули`);
          }
          
        } catch (error) {
          logError(`${indexPath}: ошибка чтения - ${error.message}`);
        }
      } else {
        logWarning(`${indexPath}: файл не найден`);
      }
      
      // Проверка JS файлов
      try {
        const jsFiles = execSync(`find ${dir} -name "*.js" | head -5`, { encoding: 'utf8' });
        const files = jsFiles.split('\n').filter(f => f.trim());
        
        logInfo(`${dir}: найдено ${files.length} JS файлов`);
        files.forEach(file => {
          if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            logInfo(`  ${path.basename(file)}: ${(stats.size / 1024).toFixed(1)}KB`);
          }
        });
      } catch (error) {
        logWarning(`${dir}: не удалось найти JS файлы`);
      }
      
    } else {
      logWarning(`${dir}: директория не найдена`);
    }
  });
}

// Рекомендации по исправлению
function provideRecommendations() {
  logSection('Рекомендации по исправлению');
  
  logInfo('1. Убедитесь что zod установлен во всех необходимых пакетах:');
  logInfo('   npm install zod@^3.24.2');
  
  logInfo('2. Удалите external: ["zod"] из vite.config.ts если он есть');
  
  logInfo('3. Пересоберите проект:');
  logInfo('   npm run build:production');
  
  logInfo('4. Проверьте что все импорты используют правильный синтаксис:');
  logInfo('   import { z } from "zod";');
  
  logInfo('5. Убедитесь что в браузере нет ошибок CORS или CSP');
  
  logInfo('6. Проверьте консоль браузера на наличие других ошибок модулей');
}

// Основная функция
async function main() {
  log('🔧 Диагностика проблем с модулями', 'bright');
  
  checkDependencies();
  checkViteConfigs();
  checkImports();
  checkBuiltFiles();
  provideRecommendations();
  
  logSection('ИТОГОВЫЕ РЕКОМЕНДАЦИИ');
  
  logInfo('Для исправления ошибки "Failed to resolve module specifier zod":');
  logInfo('');
  logInfo('1. Установите зависимости:');
  logInfo('   npm install');
  logInfo('');
  logInfo('2. Пересоберите проект:');
  logInfo('   npm run build:production');
  logInfo('');
  logInfo('3. Проверьте что в vite.config.ts нет external: ["zod"]');
  logInfo('');
  logInfo('4. Убедитесь что все пакеты имеют zod в dependencies');
  logInfo('');
  logInfo('5. Проверьте консоль браузера после исправлений');
}

// Запуск диагностики
if (require.main === module) {
  main().catch(error => {
    logError(`Ошибка выполнения диагностики: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main }; 