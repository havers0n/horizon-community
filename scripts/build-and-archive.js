#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function logStep(step) {
  log(`\n${colors.bright}${colors.blue}=== ${step} ===${colors.reset}`);
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
  log(`ℹ️  ${message}`, 'cyan');
}

// Проверка существования пути
function pathExists(pathToCheck) {
  try {
    return fs.existsSync(pathToCheck);
  } catch (error) {
    return false;
  }
}

// Получение размера файла/папки
function getSize(pathToCheck) {
  try {
    const stats = fs.statSync(pathToCheck);
    if (stats.isFile()) {
      return stats.size;
    } else if (stats.isDirectory()) {
      let totalSize = 0;
      const files = fs.readdirSync(pathToCheck);
      for (const file of files) {
        const filePath = path.join(pathToCheck, file);
        totalSize += getSize(filePath);
      }
      return totalSize;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

// Форматирование размера
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Вывод списка файлов в папке
function listFiles(dirPath, prefix = '') {
  try {
    const items = fs.readdirSync(dirPath);
    items.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      const isLast = index === items.length - 1;
      const currentPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';
      
      if (stats.isDirectory()) {
        log(`${prefix}${currentPrefix}${item}/`, 'magenta');
        listFiles(itemPath, prefix + nextPrefix);
      } else {
        const size = formatSize(stats.size);
        log(`${prefix}${currentPrefix}${item} (${size})`);
      }
    });
  } catch (error) {
    logError(`Ошибка при чтении папки ${dirPath}: ${error.message}`);
  }
}

// Основная функция
async function main() {
  try {
    logStep('НАЧАЛО СБОРКИ И АРХИВИРОВАНИЯ');
    
    // Шаг 1: Сборка проекта
    logStep('СБОРКА ПРОЕКТА');
    logInfo('Выполняется сборка всех приложений...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      logSuccess('Сборка проекта завершена успешно');
    } catch (error) {
      logError('Ошибка при сборке проекта');
      process.exit(1);
    }
    
    // Шаг 2: Проверка существования билд-артефактов
    logStep('ПРОВЕРКА БИЛД-АРТЕФАКТОВ');
    
    const buildPaths = [
      { name: 'Client Build', path: 'apps/client/dist', required: true },
      { name: 'MDT Client Build', path: 'apps/mdtclient/dist', required: true },
      { name: 'Server Build (apps/server/dist)', path: 'apps/server/dist', required: false },
      { name: 'Server Build (dist/apps/server)', path: 'dist/apps/server', required: false },
      { name: 'Server Build (dist)', path: 'dist', required: false }
    ];
    
    const existingPaths = [];
    
    for (const buildPath of buildPaths) {
      if (pathExists(buildPath.path)) {
        const size = getSize(buildPath.path);
        logSuccess(`${buildPath.name}: ${buildPath.path} (${formatSize(size)})`);
        existingPaths.push(buildPath);
      } else {
        if (buildPath.required) {
          logError(`${buildPath.name}: ${buildPath.path} - НЕ НАЙДЕН (обязательный)`);
        } else {
          logWarning(`${buildPath.name}: ${buildPath.path} - не найден (опциональный)`);
        }
      }
    }
    
    if (existingPaths.length === 0) {
      logError('Не найдено ни одного билд-артефакта для архивирования');
      process.exit(1);
    }
    
    // Шаг 3: Вывод структуры найденных билд-артефактов
    logStep('СТРУКТУРА БИЛД-АРТЕФАКТОВ');
    for (const buildPath of existingPaths) {
      logInfo(`${buildPath.name}:`);
      listFiles(buildPath.path);
    }
    
    // Шаг 4: Создание архива
    logStep('СОЗДАНИЕ АРХИВА');
    
    const archiveName = 'deployment.tar.gz';
    
    // Удаление старого архива если существует
    if (pathExists(archiveName)) {
      fs.unlinkSync(archiveName);
      logInfo('Удален старый архив deployment.tar.gz');
    }
    
    // Создание команды для архивирования
    const tarPaths = existingPaths.map(bp => bp.path).join(' ');
    
    try {
      // Для Windows используем PowerShell команду
      if (process.platform === 'win32') {
        const tarCommand = `tar -czf ${archiveName} ${tarPaths}`;
        logInfo(`Выполняется команда: ${tarCommand}`);
        execSync(tarCommand, { stdio: 'inherit' });
      } else {
        // Для Unix-систем
        const tarCommand = `tar -czf ${archiveName} ${tarPaths}`;
        logInfo(`Выполняется команда: ${tarCommand}`);
        execSync(tarCommand, { stdio: 'inherit' });
      }
      
      logSuccess(`Архив ${archiveName} создан успешно`);
    } catch (error) {
      logError(`Ошибка при создании архива: ${error.message}`);
      process.exit(1);
    }
    
    // Шаг 5: Проверка созданного архива
    logStep('ПРОВЕРКА АРХИВА');
    
    if (pathExists(archiveName)) {
      const archiveSize = getSize(archiveName);
      logSuccess(`Архив ${archiveName} создан (${formatSize(archiveSize)})`);
      
      // Вывод содержимого архива
      logInfo('Содержимое архива:');
      try {
        if (process.platform === 'win32') {
          execSync(`tar -tzf ${archiveName}`, { stdio: 'inherit' });
        } else {
          execSync(`tar -tzf ${archiveName}`, { stdio: 'inherit' });
        }
      } catch (error) {
        logWarning('Не удалось вывести содержимое архива');
      }
    } else {
      logError(`Архив ${archiveName} не был создан`);
      process.exit(1);
    }
    
    // Шаг 6: Финальный отчет
    logStep('ФИНАЛЬНЫЙ ОТЧЕТ');
    logSuccess(`Архивирование завершено успешно!`);
    logInfo(`Архив: ${archiveName}`);
    logInfo(`Размер: ${formatSize(getSize(archiveName))}`);
    logInfo(`Включенные билды:`);
    existingPaths.forEach(bp => {
      const size = formatSize(getSize(bp.path));
      logInfo(`  - ${bp.name}: ${bp.path} (${size})`);
    });
    
  } catch (error) {
    logError(`Критическая ошибка: ${error.message}`);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main().catch(error => {
    logError(`Неожиданная ошибка: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, pathExists, getSize, formatSize }; 