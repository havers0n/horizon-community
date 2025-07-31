const fs = require('fs');
const path = require('path');

const envContent = `VITE_SUPABASE_URL=https://axgtvvcimqoyxbfvdrok.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU
`;

const envPath = path.join(__dirname, '.env');

console.log('🔧 Создание правильного .env файла...');
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ .env файл создан успешно!');

// Проверяем содержимое
const content = fs.readFileSync(envPath, 'utf8');
console.log('📄 Содержимое .env файла:');
console.log(content); 