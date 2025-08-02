# Исправление проблемы с API прокси в Vite

## Проблема
Ошибка "Failed to fetch" на клиенте не исчезала после исправления CORS на сервере, потому что Vite Dev Server не проксировал API-запросы к бэкенду.

## Решение

### 1. Обновлена конфигурация Vite в `apps/mdtclient/vite.config.ts`

```typescript
server: {
  port: 3001,
  host: '0.0.0.0',
  fs: {
    allow: ['..', '../../']
  },
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
      secure: false,
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('🔴 Proxy error:', err);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
        });
      },
    },
  },
},
```

### 2. Обновлена конфигурация Vite в `apps/client/vite.config.ts`

Аналогичные изменения применены для второго клиентского приложения.

### 3. Создан тестовый скрипт

Файл `test-api-connection.js` для проверки подключения к API:

```bash
npm run test:api
```

## Конфигурация портов

- **Сервер API**: `127.0.0.1:5000` (development)
- **MDT Client**: `127.0.0.1:3001` 
- **Main Client**: `127.0.0.1:3000`

## Проверка работы

1. Запустите сервер: `npm run dev`
2. Запустите клиент: `npm run dev` (в папке клиента)
3. Проверьте API: `npm run test:api`
4. Откройте DevTools в браузере и проверьте логи прокси

## Логирование

Теперь в консоли Vite будут отображаться:
- 🔴 Ошибки прокси
- 🔄 Запросы, которые проксируются
- ✅ Ответы от API

## Возможные проблемы

1. **Сервер не запущен**: Убедитесь, что `npm run dev` выполнен в папке сервера
2. **Неправильный порт**: Проверьте, что сервер запущен на порту 5000
3. **Firewall**: Убедитесь, что порт 5000 не заблокирован
4. **CORS**: Проверьте, что CORS настроен правильно на сервере

## Команды для диагностики

```bash
# Проверка API
npm run test:api

# Запуск сервера
npm run dev

# Запуск клиента (в папке клиента)
npm run dev
``` 