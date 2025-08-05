#!/usr/bin/env node

/**
 * Скрипт для исправления workspace зависимостей
 * Заменяет workspace:* на конкретные версии в package.json файлах
 */

const fs = require('fs');
const path = require('path');

// Файлы package.json, которые нужно проверить
const packageFiles = [
  'apps/server/package.json',
  'libs/shared-utils/package.json',
  'libs/shared-types/package.json'
];

// Маппинг workspace зависимостей на версии
const workspaceDeps = {
  '@roleplay-identity/db-types': '^1.0.0',
  '@roleplay-identity/shared-types': '^1.0.0',
  '@roleplay-identity/shared-schema': '^1.0.0'
};

function fixWorkspaceDependencies() {
  console.log('🔧 Исправление workspace зависимостей...\n');

  let totalFixed = 0;

  packageFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`);
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let fixed = false;

      // Проверяем dependencies
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => {
          if (packageJson.dependencies[dep] === 'workspace:*' && workspaceDeps[dep]) {
            console.log(`✅ ${filePath}: ${dep} -> ${workspaceDeps[dep]}`);
            packageJson.dependencies[dep] = workspaceDeps[dep];
            fixed = true;
            totalFixed++;
          }
        });
      }

      // Проверяем devDependencies
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach(dep => {
          if (packageJson.devDependencies[dep] === 'workspace:*' && workspaceDeps[dep]) {
            console.log(`✅ ${filePath}: ${dep} -> ${workspaceDeps[dep]}`);
            packageJson.devDependencies[dep] = workspaceDeps[dep];
            fixed = true;
            totalFixed++;
          }
        });
      }

      if (fixed) {
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`📝 Обновлен: ${filePath}\n`);
      } else {
        console.log(`✅ ${filePath}: workspace зависимости не найдены\n`);
      }

    } catch (error) {
      console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
    }
  });

  console.log(`🎉 Исправлено ${totalFixed} workspace зависимостей`);

  if (totalFixed > 0) {
    console.log('\n📋 Следующие шаги:');
    console.log('1. npm install --legacy-peer-deps');
    console.log('2. npm run install:workspaces');
    console.log('3. npm run check (для проверки TypeScript)');
  }
}

function checkForWorkspaceDeps() {
  console.log('🔍 Проверка workspace зависимостей...\n');

  let found = false;

  packageFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const workspaceDepsFound = [];

      // Проверяем dependencies
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => {
          if (packageJson.dependencies[dep] === 'workspace:*') {
            workspaceDepsFound.push(dep);
          }
        });
      }

      // Проверяем devDependencies
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach(dep => {
          if (packageJson.devDependencies[dep] === 'workspace:*') {
            workspaceDepsFound.push(dep);
          }
        });
      }

      if (workspaceDepsFound.length > 0) {
        console.log(`❌ ${filePath}:`);
        workspaceDepsFound.forEach(dep => {
          console.log(`   - ${dep}: workspace:*`);
        });
        found = true;
      } else {
        console.log(`✅ ${filePath}: workspace зависимости не найдены`);
      }

    } catch (error) {
      console.error(`❌ Ошибка при проверке ${filePath}:`, error.message);
    }
  });

  if (!found) {
    console.log('\n🎉 Все workspace зависимости исправлены!');
  } else {
    console.log('\n💡 Запустите: node scripts/fix-workspace-deps.js --fix');
  }
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);

if (args.includes('--check') || args.includes('-c')) {
  checkForWorkspaceDeps();
} else if (args.includes('--fix') || args.includes('-f')) {
  fixWorkspaceDependencies();
} else {
  console.log('🔧 Скрипт исправления workspace зависимостей\n');
  console.log('Использование:');
  console.log('  node scripts/fix-workspace-deps.js --check  # Проверить workspace зависимости');
  console.log('  node scripts/fix-workspace-deps.js --fix    # Исправить workspace зависимости');
  console.log('\nПо умолчанию выполняется проверка.');
  checkForWorkspaceDeps();
}