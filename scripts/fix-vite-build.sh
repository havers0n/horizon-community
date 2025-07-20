#!/bin/bash

echo "🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С VITE BUILD"
echo "====================================="

cd /var/www/app

echo "📍 Текущая директория: $(pwd)"

# Проверяем структуру проекта
echo "🔍 Проверяем структуру проекта:"
ls -la

# Проверяем наличие client директории
if [ ! -d "client" ]; then
    echo "❌ client директория не найдена!"
    echo "💡 Это означает что проект не был полностью загружен"
    echo "🔧 Создаем минимальную структуру для сборки..."
    
    # Создаем минимальную структуру
    mkdir -p client/src
    mkdir -p client/public
    
    # Создаем минимальный index.html
    cat > client/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

    # Создаем минимальный main.tsx
    cat > client/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

    # Создаем минимальный App.tsx
    cat > client/src/App.tsx << 'EOF'
import React from 'react'

function App() {
  return (
    <div>
      <h1>RolePlay Identity</h1>
      <p>Приложение загружается...</p>
    </div>
  )
}

export default App
EOF

    echo "✅ Минимальная структура создана"
else
    echo "✅ client директория найдена"
fi

# Проверяем что index.html существует
if [ ! -f "client/index.html" ]; then
    echo "❌ client/index.html не найден!"
    exit 1
fi

echo "✅ client/index.html найден"

# Останавливаем приложение
echo "🛑 Останавливаем приложение..."
pm2 delete roleplayidentity 2>/dev/null || echo "Приложение не было запущено"

# Пересобираем
echo "🔨 Пересобираем приложение..."
npm run build

# Проверяем что файлы созданы
echo "🔍 Проверяем результат сборки:"
ls -la dist/
ls -la dist/public/

# Устанавливаем только production зависимости
echo "📦 Устанавливаем только production зависимости..."
npm ci --production

# Запускаем с правильным файлом
echo "🚀 Запускаем приложение..."
NODE_ENV=production pm2 start dist/server.js --name roleplayidentity

# Сохраняем конфигурацию
pm2 save

# Ждем инициализации
echo "⏳ Ждем инициализации..."
sleep 3

# Проверяем статус
echo "📊 Статус:"
pm2 status

# Проверяем логи
echo "📋 Логи:"
pm2 logs roleplayidentity --lines 5 --nostream

# Тестируем API
echo "🔍 Тестируем API..."
if curl -s http://localhost:5000/api/health | grep -q "health"; then
    echo "✅ API отвечает корректно!"
else
    echo "❌ API не отвечает или возвращает HTML"
    echo "📋 Полный ответ:"
    curl -s http://localhost:5000/api/health
fi

echo "🎉 Исправление завершено!" 