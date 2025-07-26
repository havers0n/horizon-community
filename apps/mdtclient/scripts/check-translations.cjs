#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const localesPath = path.join(__dirname, '../locales');
const enPath = path.join(localesPath, 'en.json');
const ruPath = path.join(localesPath, 'ru.json');

// Функция для рекурсивного получения всех ключей из объекта
function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Функция для получения значения по ключу
function getValueByKey(obj, key) {
  const keys = key.split('.');
  let value = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
}

// Основная функция проверки
function checkTranslations() {
  console.log('🔍 Проверка полноты переводов...\n');
  
  try {
    // Загружаем файлы переводов
    const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const ruTranslations = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
    
    // Получаем все ключи
    const enKeys = getAllKeys(enTranslations);
    const ruKeys = getAllKeys(ruTranslations);
    
    console.log(`📊 Статистика:`);
    console.log(`   Английский: ${enKeys.length} ключей`);
    console.log(`   Русский: ${ruKeys.length} ключей\n`);
    
    // Находим отсутствующие ключи
    const missingInRu = enKeys.filter(key => !ruKeys.includes(key));
    const missingInEn = ruKeys.filter(key => !enKeys.includes(key));
    
    // Проверяем пустые значения
    const emptyInEn = enKeys.filter(key => {
      const value = getValueByKey(enTranslations, key);
      return value === '' || value === null || value === undefined;
    });
    
    const emptyInRu = ruKeys.filter(key => {
      const value = getValueByKey(ruTranslations, key);
      return value === '' || value === null || value === undefined;
    });
    
    // Выводим результаты
    if (missingInRu.length > 0) {
      console.log('❌ Отсутствующие ключи в русском переводе:');
      missingInRu.forEach(key => console.log(`   - ${key}`));
      console.log('');
    }
    
    if (missingInEn.length > 0) {
      console.log('❌ Отсутствующие ключи в английском переводе:');
      missingInEn.forEach(key => console.log(`   - ${key}`));
      console.log('');
    }
    
    if (emptyInEn.length > 0) {
      console.log('⚠️  Пустые значения в английском переводе:');
      emptyInEn.forEach(key => console.log(`   - ${key}`));
      console.log('');
    }
    
    if (emptyInRu.length > 0) {
      console.log('⚠️  Пустые значения в русском переводе:');
      emptyInRu.forEach(key => console.log(`   - ${key}`));
      console.log('');
    }
    
    // Общая статистика
    const totalIssues = missingInRu.length + missingInEn.length + emptyInEn.length + emptyInRu.length;
    
    if (totalIssues === 0) {
      console.log('✅ Все переводы корректны!');
    } else {
      console.log(`📈 Всего проблем: ${totalIssues}`);
      
      // Рекомендации
      console.log('\n💡 Рекомендации:');
      if (missingInRu.length > 0) {
        console.log(`   - Добавьте ${missingInRu.length} отсутствующих переводов в ru.json`);
      }
      if (missingInEn.length > 0) {
        console.log(`   - Добавьте ${missingInEn.length} отсутствующих переводов в en.json`);
      }
      if (emptyInEn.length > 0 || emptyInRu.length > 0) {
        console.log('   - Заполните пустые значения переводов');
      }
    }
    
    return totalIssues === 0;
    
  } catch (error) {
    console.error('❌ Ошибка при проверке переводов:', error.message);
    return false;
  }
}

// Запуск проверки
if (require.main === module) {
  const success = checkTranslations();
  process.exit(success ? 0 : 1);
}

module.exports = { checkTranslations }; 