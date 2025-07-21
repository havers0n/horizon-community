name: Deploy to VPS

on:
  push:
    branches:
      - main
  workflow_dispatch: # Позволяет запускать вручную

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build:production

      - name: Install production dependencies
        run: npm ci --production

      - name: Create deployment package
        run: |
          # Создаем архив только с необходимыми файлами (без env.example)
          tar -czf deployment.tar.gz \
            dist/ \
            package.json \
            package-lock.json \
            scripts/ \
            public/ \
            supabase/ \
            migrations/ \
            docs/ \
            README.md \
            node_modules/

      - name: Deploy to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          source: "deployment.tar.gz"
          target: "/var/www/app"
          strip_components: 0

      - name: Setup and restart application
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            # Переходим в директорию приложения
            cd /var/www/app
            
            # Распаковываем архив
            tar -xzf deployment.tar.gz
            
            # Проверяем наличие .env файла
            echo "🔍 Проверяем .env файл..."
            if [ -f .env ]; then
              echo "✅ .env файл найден"
              echo "📋 Содержимое .env (первые 3 строки):"
              head -3 .env
            else
              echo "❌ .env файл не найден"
              exit 1
            fi
            
            # Безопасный рестарт приложения
            if pm2 list | grep -q "roleplayidentity"; then
              echo "🔄 Перезапускаем приложение..."
              pm2 reload roleplayidentity
            else
              echo "🚀 Запускаем приложение впервые..."
              NODE_ENV=production pm2 start dist/server.js --name roleplayidentity
            fi
            
            # Сохраняем конфигурацию PM2
            pm2 save
            
            # Проверяем статус
            echo "📊 Статус приложения:"
            pm2 status
            
            # Очищаем архив
            rm -f deployment.tar.gz
            
            echo "✅ Деплой завершен успешно!"

      - name: Health check
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            # Ждем немного для запуска приложения
            sleep 5
            
            # Проверяем статус PM2
            pm2 status
            
            # Проверяем доступность приложения
            if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
              echo "✅ Приложение доступно на localhost:5000"
            else
              echo "❌ Приложение недоступно на localhost:5000"
              echo "📋 Логи приложения:"
              pm2 logs roleplayidentity --lines 10 --nostream
              exit 1
            fi 