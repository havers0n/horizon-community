import request from 'supertest';
import { app } from '../../server/index';

describe('Performance Testing - Load Tests', () => {
  const BASE_URL = 'http://localhost:5000';
  const CONCURRENT_USERS = 50;
  const TEST_DURATION = 30000; // 30 секунд

  describe('API Endpoint Performance', () => {
    it('should handle concurrent user registrations', async () => {
      const startTime = Date.now();
      const promises = [];

      // Создаем множество одновременных запросов на регистрацию
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        const userData = {
          username: `loadtest_${Date.now()}_${i}`,
          email: `loadtest_${Date.now()}_${i}@example.com`,
          password: 'Test1234!'
        };

        promises.push(
          request(app)
            .post('/api/auth/register')
            .send(userData)
            .timeout(10000) // 10 секунд таймаут
        );
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Анализируем результаты
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 201)).length;

      console.log(`Load Test Results - Registration:`);
      console.log(`Total requests: ${CONCURRENT_USERS}`);
      console.log(`Successful: ${successful}`);
      console.log(`Failed: ${failed}`);
      console.log(`Total time: ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / CONCURRENT_USERS}ms`);
      console.log(`Requests per second: ${(CONCURRENT_USERS / totalTime) * 1000}`);

      // Проверяем, что большинство запросов прошли успешно
      expect(successful).toBeGreaterThan(CONCURRENT_USERS * 0.8); // 80% успешных
      expect(totalTime).toBeLessThan(30000); // менее 30 секунд
    }, 60000);

    it('should handle concurrent login requests', async () => {
      // Сначала создаем тестовых пользователей
      const testUsers = [];
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        const userData = {
          username: `logintest_${Date.now()}_${i}`,
          email: `logintest_${Date.now()}_${i}@example.com`,
          password: 'Test1234!'
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData);

        testUsers.push(userData);
      }

      const startTime = Date.now();
      const promises = [];

      // Тестируем одновременные входы
      for (const user of testUsers) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: user.password })
            .timeout(10000)
        );
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 200).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 200)).length;

      console.log(`Load Test Results - Login:`);
      console.log(`Total requests: ${CONCURRENT_USERS}`);
      console.log(`Successful: ${successful}`);
      console.log(`Failed: ${failed}`);
      console.log(`Total time: ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / CONCURRENT_USERS}ms`);

      expect(successful).toBeGreaterThan(CONCURRENT_USERS * 0.9); // 90% успешных
      expect(totalTime).toBeLessThan(20000); // менее 20 секунд
    }, 60000);

    it('should handle concurrent application submissions', async () => {
      // Создаем пользователей и получаем токены
      const authTokens = [];
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        const userData = {
          username: `apptest_${Date.now()}_${i}`,
          email: `apptest_${Date.now()}_${i}@example.com`,
          password: 'Test1234!'
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData);

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });

        authTokens.push(loginRes.body.session.access_token);
      }

      const startTime = Date.now();
      const promises = [];

      // Тестируем одновременное создание заявок
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        const applicationData = {
          type: 'entry',
          department: 'pd',
          position: 'officer',
          experience: `${i} years`,
          motivation: `Load test application ${i}`
        };

        promises.push(
          request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authTokens[i]}`)
            .send(applicationData)
            .timeout(10000)
        );
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 201)).length;

      console.log(`Load Test Results - Applications:`);
      console.log(`Total requests: ${CONCURRENT_USERS}`);
      console.log(`Successful: ${successful}`);
      console.log(`Failed: ${failed}`);
      console.log(`Total time: ${totalTime}ms`);

      expect(successful).toBeGreaterThan(CONCURRENT_USERS * 0.8);
      expect(totalTime).toBeLessThan(25000);
    }, 60000);
  });

  describe('Database Performance', () => {
    it('should handle large dataset queries', async () => {
      // Создаем большое количество тестовых данных
      const testDataCount = 1000;
      
      // Создаем пользователей для тестирования
      const testUsers = [];
      for (let i = 0; i < 10; i++) {
        const userData = {
          username: `dbuser_${Date.now()}_${i}`,
          email: `dbuser_${Date.now()}_${i}@example.com`,
          password: 'Test1234!'
        };

        const registerRes = await request(app)
          .post('/api/auth/register')
          .send(userData);

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });

        testUsers.push({
          token: loginRes.body.session.access_token,
          userId: registerRes.body.user.id
        });
      }

      // Создаем множество заявок
      for (let i = 0; i < testDataCount; i++) {
        const userIndex = i % testUsers.length;
        const applicationData = {
          type: i % 3 === 0 ? 'entry' : i % 3 === 1 ? 'transfer' : 'leave',
          department: 'pd',
          position: 'officer',
          experience: `${i} years`,
          motivation: `Test application ${i}`
        };

        await request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${testUsers[userIndex].token}`)
          .send(applicationData);
      }

      // Тестируем производительность запросов
      const startTime = Date.now();
      
      // Запрос всех заявок с пагинацией
      const res = await request(app)
        .get('/api/applications?page=1&limit=100')
        .set('Authorization', `Bearer ${testUsers[0].token}`);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      console.log(`Database Query Performance:`);
      console.log(`Query time: ${queryTime}ms`);
      console.log(`Results count: ${res.body.applications?.length || 0}`);

      expect(res.statusCode).toBe(200);
      expect(queryTime).toBeLessThan(5000); // менее 5 секунд
    }, 120000);

    it('should handle complex search queries', async () => {
      // Создаем тестового пользователя
      const userData = {
        username: `searchtest_${Date.now()}`,
        email: `searchtest_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      const authToken = loginRes.body.session.access_token;

      // Создаем заявки с разными типами для поиска
      const applicationTypes = ['entry', 'transfer', 'leave'];
      for (let i = 0; i < 100; i++) {
        const applicationData = {
          type: applicationTypes[i % 3],
          department: 'pd',
          position: i % 2 === 0 ? 'officer' : 'detective',
          experience: `${i} years`,
          motivation: `Search test application ${i}`
        };

        await request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${authToken}`)
          .send(applicationData);
      }

      // Тестируем сложные поисковые запросы
      const searchQueries = [
        '?type=entry&department=pd',
        '?type=transfer&position=detective',
        '?search=Search test',
        '?type=leave&department=pd&position=officer'
      ];

      for (const query of searchQueries) {
        const startTime = Date.now();
        
        const res = await request(app)
          .get(`/api/applications${query}`)
          .set('Authorization', `Bearer ${authToken}`);

        const endTime = Date.now();
        const queryTime = endTime - startTime;

        console.log(`Search Query: ${query}`);
        console.log(`Query time: ${queryTime}ms`);
        console.log(`Results: ${res.body.applications?.length || 0}`);

        expect(res.statusCode).toBe(200);
        expect(queryTime).toBeLessThan(3000); // менее 3 секунд
      }
    }, 120000);
  });

  describe('Memory Usage Tests', () => {
    it('should not have memory leaks during extended usage', async () => {
      const initialMemory = process.memoryUsage();
      console.log('Initial memory usage:', initialMemory);

      // Выполняем множество операций
      for (let cycle = 0; cycle < 10; cycle++) {
        console.log(`Memory test cycle ${cycle + 1}/10`);
        
        // Создаем пользователя
        const userData = {
          username: `memtest_${Date.now()}_${cycle}`,
          email: `memtest_${Date.now()}_${cycle}@example.com`,
          password: 'Test1234!'
        };

        const registerRes = await request(app)
          .post('/api/auth/register')
          .send(userData);

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });

        const authToken = loginRes.body.session.access_token;

        // Создаем заявки
        for (let i = 0; i < 10; i++) {
          const applicationData = {
            type: 'entry',
            department: 'pd',
            position: 'officer',
            experience: `${i} years`,
            motivation: `Memory test application ${cycle}_${i}`
          };

          await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authToken}`)
            .send(applicationData);
        }

        // Читаем заявки
        await request(app)
          .get('/api/applications')
          .set('Authorization', `Bearer ${authToken}`);

        // Принудительно вызываем сборщик мусора (если доступен)
        if (global.gc) {
          global.gc();
        }

        // Проверяем использование памяти
        const currentMemory = process.memoryUsage();
        console.log(`Cycle ${cycle + 1} memory usage:`, currentMemory);
      }

      const finalMemory = process.memoryUsage();
      console.log('Final memory usage:', finalMemory);

      // Проверяем, что использование памяти не выросло критически
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);

      // Увеличение памяти не должно превышать 100MB
      expect(memoryIncreaseMB).toBeLessThan(100);
    }, 300000);

    it('should handle large file uploads efficiently', async () => {
      // Создаем тестового пользователя
      const userData = {
        username: `filetest_${Date.now()}`,
        email: `filetest_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      const authToken = loginRes.body.session.access_token;

      // Создаем большой файл (1MB)
      const largeFileContent = Buffer.alloc(1024 * 1024, 'A');

      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // Загружаем файл
      const uploadRes = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFileContent, 'test-large-file.txt');

      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      const uploadTime = endTime - startTime;
      const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

      console.log(`Large file upload test:`);
      console.log(`File size: 1MB`);
      console.log(`Upload time: ${uploadTime}ms`);
      console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);

      expect(uploadRes.statusCode).toBe(200);
      expect(uploadTime).toBeLessThan(10000); // менее 10 секунд
      expect(memoryUsed / 1024 / 1024).toBeLessThan(50); // менее 50MB
    }, 60000);
  });

  describe('Response Time Tests', () => {
    it('should maintain acceptable response times under load', async () => {
      const responseTimes = [];
      const testCount = 100;

      // Создаем тестового пользователя
      const userData = {
        username: `responsetest_${Date.now()}`,
        email: `responsetest_${Date.now()}@example.com`,
        password: 'Test1234!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      const authToken = loginRes.body.session.access_token;

      // Тестируем время ответа для разных эндпоинтов
      const endpoints = [
        { method: 'GET', path: '/api/applications', auth: true },
        { method: 'GET', path: '/api/user/profile', auth: true },
        { method: 'GET', path: '/api/departments', auth: false },
        { method: 'POST', path: '/api/applications', auth: true, data: {
          type: 'entry',
          department: 'pd',
          position: 'officer',
          experience: '2 years'
        }}
      ];

      for (const endpoint of endpoints) {
        console.log(`Testing endpoint: ${endpoint.method} ${endpoint.path}`);
        
        for (let i = 0; i < testCount; i++) {
          const startTime = Date.now();
          
          let req = request(app)[endpoint.method.toLowerCase()](endpoint.path);
          
          if (endpoint.auth) {
            req = req.set('Authorization', `Bearer ${authToken}`);
          }
          
          if (endpoint.data) {
            req = req.send(endpoint.data);
          }
          
          const res = await req;
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          responseTimes.push(responseTime);
          
          expect(res.statusCode).not.toBe(500); // Не должно быть серверных ошибок
        }

        // Анализируем результаты
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        const minResponseTime = Math.min(...responseTimes);
        const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

        console.log(`Response time statistics for ${endpoint.method} ${endpoint.path}:`);
        console.log(`Average: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`Min: ${minResponseTime}ms`);
        console.log(`Max: ${maxResponseTime}ms`);
        console.log(`95th percentile: ${p95ResponseTime}ms`);

        // Проверяем, что время ответа приемлемое
        expect(avgResponseTime).toBeLessThan(1000); // менее 1 секунды в среднем
        expect(p95ResponseTime).toBeLessThan(2000); // 95% запросов менее 2 секунд
        expect(maxResponseTime).toBeLessThan(5000); // максимум 5 секунд

        responseTimes.length = 0; // Очищаем массив для следующего эндпоинта
      }
    }, 300000);
  });

  describe('Concurrent Database Operations', () => {
    it('should handle concurrent database writes', async () => {
      const concurrentWrites = 50;
      const promises = [];

      // Создаем пользователей для тестирования
      const testUsers = [];
      for (let i = 0; i < concurrentWrites; i++) {
        const userData = {
          username: `dbwritetest_${Date.now()}_${i}`,
          email: `dbwritetest_${Date.now()}_${i}@example.com`,
          password: 'Test1234!'
        };

        const registerRes = await request(app)
          .post('/api/auth/register')
          .send(userData);

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: userData.email, password: userData.password });

        testUsers.push({
          token: loginRes.body.session.access_token,
          userId: registerRes.body.user.id
        });
      }

      const startTime = Date.now();

      // Выполняем одновременные операции записи
      for (let i = 0; i < concurrentWrites; i++) {
        const applicationData = {
          type: 'entry',
          department: 'pd',
          position: 'officer',
          experience: `${i} years`,
          motivation: `Concurrent write test ${i}`
        };

        promises.push(
          request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${testUsers[i].token}`)
            .send(applicationData)
        );
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 201)).length;

      console.log(`Concurrent Database Writes Test:`);
      console.log(`Total operations: ${concurrentWrites}`);
      console.log(`Successful: ${successful}`);
      console.log(`Failed: ${failed}`);
      console.log(`Total time: ${totalTime}ms`);
      console.log(`Operations per second: ${(concurrentWrites / totalTime) * 1000}`);

      expect(successful).toBeGreaterThan(concurrentWrites * 0.9); // 90% успешных
      expect(totalTime).toBeLessThan(30000); // менее 30 секунд
    }, 120000);
  });
}); 