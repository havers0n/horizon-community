#!/usr/bin/env node

/**
 * Скрипт для автоматической настройки VPS
 * 
 * Использование:
 * node scripts/setup-vps.js
 * 
 * Требования:
 * - Node.js 18+ установлен
 * - Доступ к VPS серверу
 * - Настроенные переменные окружения
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function executeCommand(command, options = {}) {
  try {
    log(`Выполняется: ${command}`);
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    log(`Ошибка выполнения команды: ${error.message}`);
    throw error;
  }
}

function checkEnvironment() {
  log('Проверка переменных окружения...');
  
  const requiredVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];
  
  const missing = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    log(`❌ Отсутствуют переменные окружения: ${missing.join(', ')}`);
    log('Создайте файл .env на основе env.example');
    process.exit(1);
  }
  
  log('✅ Все переменные окружения настроены');
}

function checkNodeVersion() {
  log('Проверка версии Node.js...');
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`❌ Требуется Node.js 18+, текущая версия: ${version}`);
    process.exit(1);
  }
  
  log(`✅ Node.js версия: ${version}`);
}

function installDependencies() {
  log('Установка зависимостей...');
  executeCommand('npm ci --production');
  log('✅ Зависимости установлены');
}

function buildApplication() {
  log('Сборка приложения...');
  executeCommand('npm run build:production');
  log('✅ Приложение собрано');
}

function createSystemdService() {
  log('Создание systemd сервиса...');
  
  const serviceContent = `[Unit]
Description=RolePlayIdentity Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${process.cwd()}
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
`;

  const servicePath = '/etc/systemd/system/roleplayidentity.service';
  
  try {
    fs.writeFileSync(servicePath, serviceContent);
    log('✅ Systemd сервис создан');
    
    // Перезагрузить systemd и включить сервис
    executeCommand('systemctl daemon-reload');
    executeCommand('systemctl enable roleplayidentity.service');
    log('✅ Сервис включен в автозапуск');
    
  } catch (error) {
    log(`❌ Ошибка создания сервиса: ${error.message}`);
    log('Создайте сервис вручную или запустите приложение через PM2');
  }
}

function setupNginx() {
  log('Настройка Nginx...');
  
  const nginxConfig = `server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  const configPath = '/etc/nginx/sites-available/roleplayidentity';
  
  try {
    fs.writeFileSync(configPath, nginxConfig);
    log('✅ Конфигурация Nginx создана');
    
    // Создать символическую ссылку
    executeCommand('ln -sf /etc/nginx/sites-available/roleplayidentity /etc/nginx/sites-enabled/');
    executeCommand('nginx -t');
    executeCommand('systemctl reload nginx');
    log('✅ Nginx настроен');
    
  } catch (error) {
    log(`❌ Ошибка настройки Nginx: ${error.message}`);
    log('Настройте Nginx вручную или используйте другой веб-сервер');
  }
}

function setupFirewall() {
  log('Настройка файрвола...');
  
  try {
    // Открыть порты 80 и 443
    executeCommand('ufw allow 80/tcp');
    executeCommand('ufw allow 443/tcp');
    executeCommand('ufw allow 22/tcp');
    log('✅ Файрвол настроен');
  } catch (error) {
    log(`⚠️ Ошибка настройки файрвола: ${error.message}`);
    log('Настройте файрвол вручную');
  }
}

async function setupVPS() {
  try {
    log('🚀 Начинаем настройку VPS...');
    
    checkNodeVersion();
    checkEnvironment();
    installDependencies();
    buildApplication();
    createSystemdService();
    setupNginx();
    setupFirewall();
    
    log('\n🎉 Настройка VPS завершена!');
    log('\nСледующие шаги:');
    log('1. Запустите сервис: systemctl start roleplayidentity');
    log('2. Проверьте статус: systemctl status roleplayidentity');
    log('3. Настройте SSL сертификат (Let\'s Encrypt)');
    log('4. Настройте домен в DNS');
    log('5. Проверьте логи: journalctl -u roleplayidentity -f');
    
  } catch (error) {
    log(`❌ Ошибка настройки: ${error.message}`);
    process.exit(1);
  }
}

// Запуск настройки
setupVPS(); 