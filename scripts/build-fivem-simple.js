#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Упрощённая сборка MDT для FiveM...');

// Пути
const mdtClientPath = path.join(__dirname, '../apps/mdtclient');
const fivemUIPath = path.join(__dirname, '../apps/resources_fivem/mdt-system/ui');
const distNuiPath = path.join(mdtClientPath, 'dist-nui');

try {
  // 1. Собираем MDT для FiveM
  console.log('📦 Собираем MDT для FiveM...');
  execSync('npm run build:fivem', { 
    cwd: mdtClientPath, 
    stdio: 'inherit'
  });

  // 2. Проверяем что сборка прошла успешно
  if (!fs.existsSync(distNuiPath)) {
    throw new Error('Сборка не создала папку dist-nui');
  }

  // 3. Очищаем старую папку UI
  if (fs.existsSync(fivemUIPath)) {
    fs.removeSync(fivemUIPath);
  }

  // 4. Копируем файлы
  console.log('📋 Копируем файлы в FiveM ресурс...');
  fs.copySync(distNuiPath, fivemUIPath);

  // 5. Добавляем FiveM интеграцию если нужно
  const indexPath = path.join(fivemUIPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Добавляем FiveM NUI интеграцию если её нет
    if (!html.includes('fivem-nui.js')) {
      html = html.replace('</body>', '  <script src="./fivem-nui.js"></script>\n</body>');
      fs.writeFileSync(indexPath, html);
      console.log('🔧 Добавлена FiveM NUI интеграция');
    }
  }

  console.log('✅ Сборка завершена успешно!');
  console.log(`📁 Файлы в: ${fivemUIPath}`);
  
  // 6. Показываем размер файлов
  const files = fs.readdirSync(fivemUIPath);
  console.log('📊 Размер файлов:');
  files.forEach(file => {
    const filePath = path.join(fivemUIPath, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${file}: ${(stats.size / 1024).toFixed(1)} KB`);
  });
  
} catch (error) {
  console.error('❌ Ошибка при сборке:', error.message);
  process.exit(1);
} 