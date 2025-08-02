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

// Проверка актуальности билда (наличие index.html и свежих файлов)
function isActualBuild(buildPath) {
  if (!pathExists(buildPath)) return false;
  
  const indexHtmlPath = path.join(buildPath, 'index.html');
  if (!pathExists(indexHtmlPath)) return false;
  
  // Проверяем, что index.html не старше 1 часа
  try {
    const stats = fs.statSync(indexHtmlPath);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return stats.mtime.getTime() > oneHourAgo;
  } catch (error) {
    return false;
  }
}

// Определение актуальных путей билд-артефактов
function findActualBuildPaths() {
  const possiblePaths = [
    // NX стиль (dist/apps/*)
    { name: 'Client Build (NX)', path: 'dist/apps/client', type: 'client' },
    { name: 'MDT Client Build (NX)', path: 'dist/apps/mdtclient', type: 'mdtclient' },
    { name: 'Server Build (NX)', path: 'dist/apps/server', type: 'server' },
    
    // Классический стиль (apps/*/dist)
    { name: 'Client Build (Classic)', path: 'apps/client/dist', type: 'client' },
    { name: 'MDT Client Build (Classic)', path: 'apps/mdtclient/dist', type: 'mdtclient' },
    { name: 'Server Build (Classic)', path: 'apps/server/dist', type: 'server' }
  ];
  
  const actualPaths = [];
  const foundTypes = new Set();
  
  for (const buildPath of possiblePaths) {
    if (isActualBuild(buildPath.path)) {
      // Если уже нашли билд этого типа, пропускаем (приоритет первому найденному)
      if (foundTypes.has(buildPath.type)) {
        logWarning(`Пропущен ${buildPath.name}: уже найден актуальный билд для ${buildPath.type}`);
        continue;
      }
      
      const size = getSize(buildPath.path);
      logSuccess(`${buildPath.name}: ${buildPath.path} (${formatSize(size)})`);
      actualPaths.push(buildPath);
      foundTypes.add(buildPath.type);
    } else if (pathExists(buildPath.path)) {
      logWarning(`${buildPath.name}: ${buildPath.path} - существует, но не актуален`);
    }
  }
  
  return actualPaths;
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
    
    // Шаг 2: Поиск актуальных билд-артефактов
    logStep('ПОИСК АКТУАЛЬНЫХ БИЛД-АРТЕФАКТОВ');
    logInfo('Анализируем структуру билдов...');
    
    const actualBuildPaths = findActualBuildPaths();
    
    if (actualBuildPaths.length === 0) {
      logError('Не найдено ни одного актуального билд-артефакта для архивирования');
      process.exit(1);
    }
    
    // Шаг 3: Создание архива
    logStep('СОЗДАНИЕ АРХИВА');
    
    const archiveName = 'deployment.tar.gz';
    
    // Удаление старого архива если существует
    if (pathExists(archiveName)) {
      fs.unlinkSync(archiveName);
      logInfo('Удален старый архив deployment.tar.gz');
    }
    
    // Полный набор файлов для деплоя
    const deploymentPaths = [
      // Актуальные билд-артефакты
      ...actualBuildPaths.map(bp => bp.path),
      // Конфигурационные файлы
      'package.json',
      'package-lock.json',
      // Дополнительные файлы для деплоя
      'scripts/',
      'supabase/',
      'migrations/',
      'docs/',
      'README.md',
      'node_modules/'
    ];
    
    // Фильтрация только существующих путей
    const existingDeploymentPaths = [];
    for (const path of deploymentPaths) {
      if (pathExists(path)) {
        existingDeploymentPaths.push(path);
        logInfo(`Добавлен в архив: ${path}`);
      } else {
        logWarning(`Пропущен (не существует): ${path}`);
      }
    }
    
    if (existingDeploymentPaths.length === 0) {
      logError('Не найдено ни одного файла для архивирования');
      process.exit(1);
    }
    
    const tarPaths = existingDeploymentPaths.join(' ');
    
    try {
      const tarCommand = `tar -czf ${archiveName} ${tarPaths}`;
      logInfo(`Выполняется команда: ${tarCommand}`);
      execSync(tarCommand, { stdio: 'inherit' });
      logSuccess(`Архив ${archiveName} создан успешно`);
    } catch (error) {
      logError(`Ошибка при создании архива: ${error.message}`);
      process.exit(1);
    }
    
    // Шаг 4: Проверка созданного архива
    logStep('ПРОВЕРКА АРХИВА');
    
    if (pathExists(archiveName)) {
      const archiveSize = getSize(archiveName);
      logSuccess(`Архив ${archiveName} создан (${formatSize(archiveSize)})`);
      
      // Вывод содержимого архива
      logInfo('Содержимое архива:');
      try {
        execSync(`tar -tzf ${archiveName}`, { stdio: 'inherit' });
      } catch (error) {
        logWarning('Не удалось вывести содержимое архива');
      }
    } else {
      logError(`Архив ${archiveName} не был создан`);
      process.exit(1);
    }
    
    // Шаг 5: Финальный отчет
    logStep('ФИНАЛЬНЫЙ ОТЧЕТ');
    logSuccess(`Архивирование завершено успешно!`);
    logInfo(`Архив: ${archiveName}`);
    logInfo(`Размер: ${formatSize(getSize(archiveName))}`);
    logInfo(`Включенные билды:`);
    actualBuildPaths.forEach(bp => {
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

module.exports = { main, pathExists, getSize, formatSize, findActualBuildPaths }; 