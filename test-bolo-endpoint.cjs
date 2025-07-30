const https = require('https');
const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Im14NW9saExhMTBWa2tJQ2siLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2F4Z3R2dmNpbXFveXhiZnZkcm9rLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjNjViZmRmMC04MjBiLTQ0OWEtYjc5OC1mODUzMDkwZGEyYzQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzOTExMTU2LCJpYXQiOjE3NTM5MDc1NTYsImVtYWlsIjoiZGFueXBldHJvdjIwMDBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM5MDc1NTZ9XSwic2Vzc2lvbl9pZCI6ImQ4YThjZmI0LWI2MDgtNDQ3YS1iYjYxLWY2NTE0MGYzMTFiMiIsImlzX2Fub255bW91cyI6ZmFsc2V9.hkyFHUBOH3z5ZbjFzTSHcv-JFG_NVAETFwxYqiZqSYw';

function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Тестирование MDT endpoints...\n');

  try {
    // Тест 1: Units endpoint
    console.log('1️⃣ Тестирование /api/mdt/units...');
    const unitsResult = await testEndpoint('http://localhost:5000/api/mdt/units');
    console.log(`   Статус: ${unitsResult.statusCode}`);
    console.log(`   Ответ: ${JSON.stringify(unitsResult.body, null, 2)}`);
    console.log('');

    // Тест 2: BOLO endpoint
    console.log('2️⃣ Тестирование /api/mdt/bolos...');
    const bolosResult = await testEndpoint('http://localhost:5000/api/mdt/bolos');
    console.log(`   Статус: ${bolosResult.statusCode}`);
    console.log(`   Ответ: ${JSON.stringify(bolosResult.body, null, 2)}`);
    console.log('');

    // Тест 3: Создание BOLO
    console.log('3️⃣ Тестирование создания BOLO...');
    const createBoloData = {
      type: 'vehicle',
      description: 'Test BOLO for stolen vehicle',
      vehicle: 'Red Honda Civic',
      plate: 'ABC123',
      reason: 'Stolen vehicle',
      priority: 'high',
      location: 'Downtown area'
    };
    const createBoloResult = await testEndpoint('http://localhost:5000/api/mdt/bolos', 'POST', createBoloData);
    console.log(`   Статус: ${createBoloResult.statusCode}`);
    console.log(`   Ответ: ${JSON.stringify(createBoloResult.body, null, 2)}`);
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

runTests(); 