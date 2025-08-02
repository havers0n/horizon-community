module.exports = {
  apps: [{
    name: 'roleplayidentity', // Имя процесса, которое вы используете
    script: './dist/apps/server/main.js', // <-- ПРАВИЛЬНЫЙ ПУТЬ
    
    // ЭТА СТРОКА - РЕШЕНИЕ ВСЕЙ ПРОБЛЕМЫ
    node_args: "-r dotenv/config",
    
    // Эта опция говорит PM2 автоматически загружать переменные из .env
    // при наличии установленной библиотеки dotenv
    // Убедитесь, что 'dotenv' есть в ваших dependencies в package.json
    // pm2 >= 5.0
    env_file: '.env',
    env_production: {
      NODE_ENV: 'production',
    }
  }]
}; 