import fs from 'fs-extra';
import path from 'path';

export function fivemPlugin() {
  return {
    name: 'fivem-plugin',
    closeBundle() {
      // Проверяем что это сборка для FiveM
      if (process.env.BUILD_TARGET !== 'fivem') {
        return;
      }

      const distNuiPath = path.resolve('dist-nui');
      const fivemUIPath = path.resolve('../../apps/resources_fivem/mdt-system/ui');

      // Копируем файлы в FiveM ресурс
      if (fs.existsSync(distNuiPath)) {
        console.log('📋 Автоматическое копирование в FiveM...');
        
        // Очищаем старую папку
        if (fs.existsSync(fivemUIPath)) {
          fs.removeSync(fivemUIPath);
        }
        
        // Копируем файлы
        fs.copySync(distNuiPath, fivemUIPath);
        
        // Добавляем FiveM интеграцию
        const indexPath = path.join(fivemUIPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf8');
          
          if (!html.includes('fivem-nui.js')) {
            html = html.replace('</body>', '  <script src="./fivem-nui.js"></script>\n</body>');
            fs.writeFileSync(indexPath, html);
          }
        }
        
        console.log('✅ Файлы скопированы в FiveM ресурс');
      }
    }
  };
} 