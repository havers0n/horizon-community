// C:/.../RolePlayIdentity/scripts/sync-db-types.mjs

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Путь к файлу с типами, вычисляется от корня проекта
const outputPath = path.join(process.cwd(), 'packages', 'db-types', 'src', 'index.ts');

console.log('🚀 Starting database type generation...');

// Команда, которую мы хотим выполнить
const command = 'supabase gen types typescript --linked';

exec(command, async (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error executing command: ${error.message}`);
    console.error(stderr);
    return;
  }
  if (stderr) {
    console.warn(`⚠️ Command produced warnings: ${stderr}`);
  }

  try {
    // Гарантированно записываем результат в UTF-8
    await fs.writeFile(outputPath, stdout, { encoding: 'utf-8' });
    console.log(`✅ Successfully generated and saved types to: ${outputPath}`);
  } catch (writeError) {
    console.error(`❌ Error writing to file: ${writeError.message}`);
  }
});