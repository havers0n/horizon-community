const https = require('https');
const http = require('http');

// Функция для выполнения HTTP запроса
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoints() {
  const baseUrl = 'http://localhost:3001';
  const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Im14NW9saExhMTBWa2tJQ2siLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2F4Z3R2dmNpbXFveXhiZnZkcm9rLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjNjViZmRmMC04MjBiLTQ0OWEtYjc5OC1mODUzMDkwZGEyYzQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzOTExMTU2LCJpYXQiOjE3NTM5MDc1NTYsImVtYWlsIjoiZGFueXBldHJvdjIwMDBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM5MDc1NTZ9XSwic2Vzc2lvbl9pZCI6ImQ4YThjZmI0LWI2MDgtNDQ3YS1iYjYxLWY2NTE0MGYzMTFiMiIsImlzX2Fub255bW91cyI6ZmFsc2V9.hkyFHUBOH3z5ZbjFzTSHcv-JFG_NVAETFwxYqiZqSYw';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('Тестируем /api/mdt/units...');
    const unitsResponse = await makeRequest(`${baseUrl}/api/mdt/units`, { headers });
    console.log('Status:', unitsResponse.statusCode);
    console.log('Response:', JSON.stringify(unitsResponse.data, null, 2));
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('Тестируем /api/mdt/bolos...');
    const bolosResponse = await makeRequest(`${baseUrl}/api/mdt/bolos`, { headers });
    console.log('Status:', bolosResponse.statusCode);
    console.log('Response:', JSON.stringify(bolosResponse.data, null, 2));
    
  } catch (error) {
    console.error('Ошибка при тестировании:', error.message);
  }
}

testEndpoints(); 