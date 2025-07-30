const fs = require('fs');
const path = require('path');

// Функция для рекурсивного поиска всех .tsx файлов
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Функция для исправления импортов в файле
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Заменяем относительные пути на алиас @/contexts/
  const patterns = [
    {
      regex: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/contexts\/([^'"]+)['"]/g,
      replacement: "from '@/contexts/$1'"
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts\/([^'"]+)['"]/g,
      replacement: "from '@/contexts/$1'"
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/\.\.\/contexts\/([^'"]+)['"]/g,
      replacement: "from '@/contexts/$1'"
    },
    {
      regex: /from\s+['"]\.\.\/\.\.\/contexts\/([^'"]+)['"]/g,
      replacement: "from '@/contexts/$1'"
    },
    {
      regex: /from\s+['"]\.\.\/contexts\/([^'"]+)['"]/g,
      replacement: "from '@/contexts/$1'"
    }
  ];
  
  for (const pattern of patterns) {
    const newContent = content.replace(pattern.regex, pattern.replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Исправлен: ${filePath}`);
    return true;
  }
  
  return false;
}

// Основная функция
function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsxFiles = findTsxFiles(srcDir);
  
  console.log(`🔍 Найдено ${tsxFiles.length} .tsx файлов`);
  
  let fixedCount = 0;
  
  for (const file of tsxFiles) {
    if (fixImportsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Исправлено ${fixedCount} файлов`);
}

main();