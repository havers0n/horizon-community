const fs = require('fs');

const envContent = `NODE_ENV=development
DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR-PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
DB_PASSWORD=TtaW3kLHu9xojVOt
`;

fs.writeFileSync('.env', envContent);
console.log('✅ Файл .env создан успешно!'); 