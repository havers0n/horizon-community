const http = require('http');

const ports = [
  { port: 3000, name: 'Основной интерфейс' },
  { port: 3001, name: 'MDT System' },
  { port: 3002, name: 'CAD System' },
  { port: 5000, name: 'API Server' }
];

async function checkPort(port, name) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'HEAD',
      timeout: 3000
    }, (res) => {
      console.log(`✅ ${name} (порт ${port}) - доступен (${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} (порт ${port}) - недоступен`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name} (порт ${port}) - таймаут`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkAllPorts() {
  console.log('🔍 Проверка доступности интерфейсов...\n');
  
  const results = await Promise.all(
    ports.map(port => checkPort(port.port, port.name))
  );
  
  console.log('\n📊 Результаты проверки:');
  const available = results.filter(Boolean).length;
  const total = ports.length;
  
  console.log(`Доступно: ${available}/${total} интерфейсов`);
  
  if (available === 0) {
    console.log('\n💡 Рекомендации:');
    console.log('1. Запустите все сервисы: npm run dev:all');
    console.log('2. Убедитесь, что порты не заняты другими приложениями');
    console.log('3. Проверьте, что все зависимости установлены');
  } else if (available < total) {
    console.log('\n⚠️  Некоторые интерфейсы недоступны');
    console.log('Запустите недостающие сервисы вручную');
  } else {
    console.log('\n🎉 Все интерфейсы доступны!');
  }
}

checkAllPorts().catch(console.error); 