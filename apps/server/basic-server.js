import http from 'http';

const port = 5003;

// Простая функция для проверки JWT токена
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // Для тестирования просто проверяем, что токен существует
  if (token && token.length > 10) {
    return {
      user: {
        id: 1,
        username: 'test_dispatcher',
        email: 'dispatcher@test.com',
        role: 'Dispatch',
        departmentId: 5
      }
    };
  }
  
  return null;
}

// Тестовые пользователи для авторизации
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
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@test.com',
    password: 'Test1234!',
    role: 'Police',
    status: 'active',
    departmentId: 1,
    secondaryDepartmentId: null,
    rank: 'Officer',
    authId: 'test-auth-id-456'
  }
];

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://localhost:${port}`);
  const path = url.pathname;

  try {
    // Проверяем авторизацию для защищенных эндпоинтов
    if (path.startsWith('/api/mdt/') || path.startsWith('/api/auth/me')) {
      const authHeader = req.headers.authorization;
      const user = verifyToken(authHeader);
      
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Требуется авторизация'
        }));
        return;
      }
    }

    if (path === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Basic server is running!'
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
          
          // Ищем пользователя
          const user = testUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
            // Создаем тестовый токен
            const token = `test_token_${user.id}_${Date.now()}`;
            
            // Убираем пароль из ответа
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
      return;
    }
    else if (path === '/api/auth/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const { username, email, password } = JSON.parse(body);
          
          // Проверяем, не существует ли уже пользователь
          const existingUser = testUsers.find(u => u.email === email || u.username === username);
          
          if (existingUser) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: 'Пользователь с таким email или username уже существует'
            }));
            return;
          }
          
          // Создаем нового пользователя
          const newUser = {
            id: testUsers.length + 1,
            username,
            email,
            password,
            role: 'member',
            status: 'active',
            departmentId: null,
            secondaryDepartmentId: null,
            rank: null,
            authId: `test-auth-id-${Date.now()}`
          };
          
          testUsers.push(newUser);
          
          // Убираем пароль из ответа
          const { password: _, ...userWithoutPassword } = newUser;
          
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              user: userWithoutPassword
            }
          }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false,
            error: 'Invalid JSON' 
          }));
        }
      });
      return;
    }
    else if (path === '/api/auth/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const user = verifyToken(authHeader);
      
      if (user) {
        // Тестовые персонажи
        const characters = [
          {
            id: 1,
            ownerId: user.user.id,
            firstName: 'John',
            lastName: 'Doe',
            departmentId: user.user.departmentId || 1,
            rank: user.user.rank,
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
            user: user.user,
            characters: characters
          }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }));
      }
    }
    else if (path === '/api/auth/logout' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Успешный выход'
      }));
    }
    else if (path === '/api/departments' && req.method === 'GET') {
      // Тестовые данные департаментов
      const departments = [
        { id: 1, name: 'Police', fullName: 'Полиция Лос-Сантоса' },
        { id: 2, name: 'EMS', fullName: 'Скорая помощь' },
        { id: 3, name: 'Fire', fullName: 'Пожарная служба' },
        { id: 4, name: 'Mechanic', fullName: 'Автосервис' },
        { id: 5, name: 'Dispatch', fullName: 'Диспетчерская служба' }
      ];
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: departments.length,
        departments: departments
      }));
    }
    else if (path === '/api/users' && req.method === 'GET') {
      // Тестовые данные пользователей
      const users = [
        { id: 1, username: 'john_doe', email: 'john@test.com', role: 'Police', status: 'active' },
        { id: 2, username: 'jane_smith', email: 'jane@test.com', role: 'EMS', status: 'active' }
      ];
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: users.length,
        users: users
      }));
    }
    else if (path === '/api/characters' && req.method === 'GET') {
      // Тестовые данные персонажей
      const characters = [
        { id: 1, first_name: 'John', last_name: 'Doe', type: 'Police', owner_id: 1 },
        { id: 2, first_name: 'Jane', last_name: 'Smith', type: 'EMS', owner_id: 2 }
      ];
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: characters.length,
        characters: characters
      }));
    }
    else if (path === '/api/mdt/bolos' && req.method === 'GET') {
      // Тестовые данные BOLO
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
        },
        {
          id: 2,
          type: 'person',
          description: 'Мужчина в черной куртке',
          reason: 'Подозрение в краже',
          priority: 'medium',
          status: 'active',
          location: 'Торговый центр',
          issuedBy: 'Диспетчер Джейн',
          timestamp: new Date().toISOString(),
          additionalInfo: 'Последний раз видели у входа'
        },
        {
          id: 3,
          type: 'general',
          description: 'Подозрительная активность',
          reason: 'Неизвестные лица',
          priority: 'low',
          status: 'active',
          location: 'Парк',
          issuedBy: 'Диспетчер Майк',
          timestamp: new Date().toISOString(),
          additionalInfo: 'Группа из 3-4 человек'
        }
      ];
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: testBolos
      }));
    }
    else if (path === '/api/mdt/bolos' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const boloData = JSON.parse(body);
          const newBolo = {
            id: Date.now(),
            ...boloData,
            status: 'active',
            issuedBy: 'Тестовый диспетчер',
            timestamp: new Date().toISOString()
          };
          
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: newBolo
          }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
    else if (path === '/api/mdt/units' && req.method === 'GET') {
      // Тестовые данные для юнитов
      const testUnits = [
        {
          id: 1,
          characterId: 1,
          unitNumber: '1-ADAM-12',
          departmentId: 1,
          status: 'available',
          location: { x: 100, y: 200, z: 0 },
          isPanic: false,
          isActive: true,
          lastUpdate: new Date().toISOString(),
          characterName: 'Офицер Джонсон',
          badgeNumber: '12345'
        },
        {
          id: 2,
          characterId: 2,
          unitNumber: '1-ADAM-14',
          departmentId: 1,
          status: 'busy',
          location: { x: 150, y: 250, z: 0 },
          isPanic: false,
          isActive: true,
          lastUpdate: new Date().toISOString(),
          characterName: 'Офицер Смит',
          badgeNumber: '12346'
        }
      ];
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: testUnits
      }));
    }
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Basic server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health check: http://127.0.0.1:${port}/api/health`);
  console.log(`🔐 Auth login: http://127.0.0.1:${port}/api/auth/login`);
  console.log(`🔐 Auth register: http://127.0.0.1:${port}/api/auth/register`);
  console.log(`🔐 Auth me: http://127.0.0.1:${port}/api/auth/me`);
  console.log(`🏢 Departments: http://127.0.0.1:${port}/api/departments`);
  console.log(`👥 Users: http://127.0.0.1:${port}/api/users`);
  console.log(`🎭 Characters: http://127.0.0.1:${port}/api/characters`);
  console.log(`🚨 BOLO: http://127.0.0.1:${port}/api/mdt/bolos`);
  console.log(`👮 Units: http://127.0.0.1:${port}/api/mdt/units`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
}); 