#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⚡ Быстрая сборка MDT для NUI...');

const mdtClientPath = path.join(__dirname, '../apps/mdtclient');
const fivemUIPath = path.join(__dirname, '../apps/resources_fivem/mdt-system/ui');
const distPath = path.join(mdtClientPath, 'dist');

try {
  // 1. Очищаем старую сборку
  console.log('🧹 Очищаем старую сборку...');
  if (fs.existsSync(distPath)) {
    fs.removeSync(distPath);
  }
  if (fs.existsSync(fivemUIPath)) {
    fs.removeSync(fivemUIPath);
  }

  // 2. Собираем NUI версию
  console.log('📦 Собираем MDT для NUI...');
  execSync('npm run build', { 
    cwd: mdtClientPath, 
    stdio: 'inherit',
    env: { ...process.env, NUI: 'true' }
  });

  // 3. Создаём папку UI
  fs.ensureDirSync(fivemUIPath);

  // 4. Копируем файлы в FiveM ресурс
  console.log('📋 Копируем файлы в FiveM ресурс...');
  fs.copySync(distPath, fivemUIPath);

  // 5. Копируем fivem-nui.js
  const fivemNuiPath = path.join(fivemUIPath, 'fivem-nui.js');
  if (!fs.existsSync(fivemNuiPath)) {
    const sourceFivemNui = path.join(__dirname, '../apps/resources_fivem/mdt-system/ui/fivem-nui.js');
    if (fs.existsSync(sourceFivemNui)) {
      fs.copySync(sourceFivemNui, fivemNuiPath);
    }
  }

  // 6. Обновляем index.html для FiveM
  console.log('🔧 Обновляем index.html для FiveM...');
  const indexPath = path.join(fivemUIPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Убираем Vite dev server скрипты
    html = html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
    
    // Заменяем абсолютные пути на относительные для FiveM
    html = html.replace(/src="\/index\.js"/g, 'src="./index.js"');
    html = html.replace(/href="\/index\.css"/g, 'href="./index.css"');
    
    // Добавляем FiveM NUI интеграцию
    if (!html.includes('fivem-nui.js')) {
      html = html.replace('</body>', '  <script src="./fivem-nui.js"></script>\n</body>');
    }
    
    fs.writeFileSync(indexPath, html);
  }

  console.log('✅ NUI сборка завершена!');
  console.log(`📁 Файлы скопированы в: ${fivemUIPath}`);
  
} catch (error) {
  console.error('❌ Ошибка при сборке NUI:', error.message);
  process.exit(1);
} 