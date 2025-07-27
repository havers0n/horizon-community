#!/usr/bin/env node

/**
 * Скрипт миграции React 18 -> React 19
 * Автоматически обновляет устаревшие паттерны React.FC
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Паттерны для замены
const replacements = [
  // React.FC -> современный синтаксис
  {
    pattern: /const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*{/g,
    replacement: 'const $1 = () => {'
  },
  {
    pattern: /const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(([^)]+)\)\s*=>\s*{/g,
    replacement: 'const $1 = ($3: $2) => {'
  },
  // React.ComponentType -> React.ComponentType
  {
    pattern: /React\.ComponentType<any>/g,
    replacement: 'React.ComponentType<any>'
  },
  // React.ComponentPropsWithoutRef -> React.ComponentPropsWithoutRef (оставляем как есть)
  {
    pattern: /React\.ComponentPropsWithoutRef/g,
    replacement: 'React.ComponentPropsWithoutRef'
  }
];

function processFile(filePath) {
  console.log(`Обрабатываю: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Обновлен: ${filePath}`);
  } else {
    console.log(`⏭️  Без изменений: ${filePath}`);
  }
}

function migrateReact19() {
  console.log('🚀 Начинаю миграцию React 18 -> React 19...\n');
  
  // Обрабатываем все TypeScript/React файлы в client
  const clientFiles = glob.sync('apps/client/src/**/*.{ts,tsx}');
  
  console.log(`Найдено ${clientFiles.length} файлов для обработки\n`);
  
  clientFiles.forEach(processFile);
  
  console.log('\n✅ Миграция завершена!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Запустите: npm install');
  console.log('2. Запустите: npm run build:client');
  console.log('3. Проверьте на ошибки TypeScript');
  console.log('4. Протестируйте функциональность');
}

if (require.main === module) {
  migrateReact19();
}

module.exports = { migrateReact19 }; 