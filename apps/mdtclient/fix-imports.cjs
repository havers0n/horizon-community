const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Паттерны для поиска файлов
const tsFiles = glob.sync('src/**/*.{ts,tsx}', { cwd: __dirname });

// Паттерны замены
const replacements = [
  // Замены model/types
  {
    pattern: /from ['"]\.\.?\/model\/types['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/model\/types['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/model\/types['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]\.\/model\/types['"]/g,
    replacement: "from '@/shared/types'"
  },
  
  // Замены entities (только для типов)
  {
    pattern: /from ['"]@\/entities\/citizen['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/vehicle['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/weapon['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/dispatch['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/ems['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/fire-incident['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/patient['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/entities\/company['"]/g,
    replacement: "from '@/shared/types'"
  },
  
  // Замены features (только для типов)
  {
    pattern: /from ['"]@\/features\/law-enforcement['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/reports-management['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/personnel-management['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/emergency-calls['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/admin-management['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/company-management['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/citizen-registration['"]/g,
    replacement: "from '@/shared/types'"
  },
  {
    pattern: /from ['"]@\/features\/cargo-management['"]/g,
    replacement: "from '@/shared/types'"
  }
];

let totalFiles = 0;
let modifiedFiles = 0;

console.log('🔧 Начинаю автоматическую замену импортов...');

tsFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Применяем все замены
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // Если контент изменился, записываем файл
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      modifiedFiles++;
      console.log(`✅ Обновлен: ${filePath}`);
    }
    
    totalFiles++;
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Результат:`);
console.log(`   Всего файлов обработано: ${totalFiles}`);
console.log(`   Файлов изменено: ${modifiedFiles}`);
console.log(`\n🎉 Замена импортов завершена!`);