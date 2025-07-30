import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Читаем .env файл
const envPath = resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Кодируем пароль
const password = 'mybropass!1!';
const encodedPassword = encodeURIComponent(password);

console.log('🔍 Оригинальный пароль:', password);
console.log('🔐 Закодированный пароль:', encodedPassword);

// Создаем новый DATABASE_URL
const newDatabaseUrl = `DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:${encodedPassword}@aws-0-eu-north-1.pooler.supabase.com:5432/postgres`;

// Заменяем старый DATABASE_URL
const updatedContent = envContent.replace(/DATABASE_URL=.*/g, newDatabaseUrl);

// Записываем обратно
fs.writeFileSync(envPath, updatedContent);

console.log('✅ DATABASE_URL исправлен с правильно закодированным паролем');
console.log('🔗 Новый URL:', newDatabaseUrl.replace(/:(.*)@/, ':***@')); 