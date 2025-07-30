const http = require('http');

const port = 5000;

// Тестовые пользователи
const testUsers = [
  {
    id: 1,
    username: 'test_dispatcher',
    email: 'dispatcher@test.com',
    password: 'Test1234!',
    role: 'Dispatch',
    status: 'active',
    departmentId: 5,
    secondaryDepartmentId: null,
    rank: 'Dispatcher',
    authId: 'test-auth-id-123'
  }
];

// Тестовые департаменты
const departments = [
  {
    id: 5,
    name: 'Dispatch',
    full_name: 'Диспетчерская служба',
    description: 'Центр управления экстренными службами'
  },
  {
    id: 7,
    name: 'PD',
    full_name: 'Police Department',
    description: 'Полицейский департамент'
  }
];

// Тестовые BOLO
const testBolos = [
  {
    id: 1,
    type: 'vehicle',
    description: 'Красный спортивный автомобиль',
    vehicle: 'Sultan RS',
    plate: 'ABC123',
    reason: 'Нарушение ПДД',
    priority: 'high',
    status: 'active',
    location: 'Центр города',
    issuedBy: 'Диспетчер Джон',
    timestamp: new Date().toISOString(),
    additionalInfo: 'Скорость превышена в 2 раза'
  }
];

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CAD-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${port}`);
  const path = url.pathname;

  console.log(`${req.method} ${path}`);

  if (path === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'development',
      message: 'Auth Server is running!'
    }));
  }
  else if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        console.log('Login attempt:', { email, password });
        
        const user = testUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          const token = `test_token_${user.id}_${Date.now()}`;
          const { password: _, ...userWithoutPassword } = user;
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              user: userWithoutPassword,
              session: {
                access_token: token,
                refresh_token: `refresh_${token}`,
                expires_in: 3600
              }
            }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Неверный email или пароль'
          }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false,
          error: 'Invalid JSON' 
        }));
      }
    });
  }
  else if (path === '/api/auth/me' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token && token.length > 10) {
        const characters = [
          {
            id: 1,
            ownerId: 1,
            firstName: 'John',
            lastName: 'Doe',
            departmentId: 5,
            rank: 'Dispatcher',
            status: 'active',
            insuranceNumber: 'INS123456',
            address: '123 Main St',
            createdAt: new Date().toISOString()
          }
        ];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            user: testUsers[0],
            characters: characters
          }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid token'
        }));
      }
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'No authorization header'
      }));
    }
  }
  else if (path === '/api/departments' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(departments));
  }
  else if (path === '/api/mdt/bolos' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: testBolos
    }));
  }
  else if (path === '/api/mdt/units' && req.method === 'GET') {
    const units = [
      {
        id: 'unit-1',
        characterId: 1,
        unitNumber: '1-ADAM-12',
        departmentId: 5,
        status: 'active',
        isPanic: false,
        lastUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        characterName: 'John Doe',
        badgeNumber: '12345',
        callsign: '1-ADAM-12'
      }
    ];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: units
    }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Auth Server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health: http://127.0.0.1:${port}/api/health`);
  console.log(`🔐 Login: http://127.0.0.1:${port}/api/auth/login`);
  console.log(`🏢 Departments: http://127.0.0.1:${port}/api/departments`);
  console.log(`🚨 BOLO: http://127.0.0.1:${port}/api/mdt/bolos`);
  console.log(`👮 Units: http://127.0.0.1:${port}/api/mdt/units`);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  server.close(() => process.exit(0));
}); 