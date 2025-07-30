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
        
        // Копируем fivem-nui.js если он существует
        const sourceFivemNui = path.resolve('../../apps/resources_fivem/mdt-system/ui/fivem-nui.js');
        const targetFivemNui = path.join(fivemUIPath, 'fivem-nui.js');
        
        if (fs.existsSync(sourceFivemNui)) {
          fs.copySync(sourceFivemNui, targetFivemNui);
          console.log('📋 fivem-nui.js скопирован');
        } else {
          console.log('⚠️ fivem-nui.js не найден, создаем базовый файл');
          const basicNuiContent = `// FiveM NUI Bridge
window.nui = {
  send: (action, data) => console.log('NUI Send:', action, data),
  receive: (callback) => console.log('NUI Receive registered'),
  close: () => console.log('NUI Close'),
  notify: (message, type) => console.log('NUI Notify:', message, type)
};
console.log('FiveM NUI Bridge initialized');`;
          fs.writeFileSync(targetFivemNui, basicNuiContent);
        }
        
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