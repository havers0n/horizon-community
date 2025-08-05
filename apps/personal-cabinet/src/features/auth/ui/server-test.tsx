import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function ServerTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testServerHealth = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🏥 Testing server health...')
      
      // Тест 1: Проверка корневого health endpoint
      const healthResponse = await fetch('http://localhost:5000/api/health')
      const healthData = await healthResponse.json()
      
      // Тест 2: Проверка v1 health endpoint
      const v1HealthResponse = await fetch('http://localhost:5000/api/v1/health')
      const v1HealthData = await v1HealthResponse.json()
      
      // Тест 3: Проверка public health endpoint
      const publicHealthResponse = await fetch('http://localhost:5000/api/public/health')
      const publicHealthData = await publicHealthResponse.json()
      
      setResult({
        server: 'http://localhost:5000',
        endpoints: {
          '/api/health': { status: healthResponse.status, data: healthData },
          '/api/v1/health': { status: v1HealthResponse.status, data: v1HealthData },
          '/api/public/health': { status: publicHealthResponse.status, data: publicHealthData }
        }
      })
      
             console.log('✅ Server health test completed:', {
         server: 'http://localhost:5000',
         endpoints: {
           '/api/health': { status: healthResponse.status, data: healthData },
           '/api/v1/health': { status: v1HealthResponse.status, data: v1HealthData },
           '/api/public/health': { status: publicHealthResponse.status, data: publicHealthData }
         }
       })
    } catch (error) {
      console.error('❌ Server health test failed:', error)
      setResult({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        server: 'http://localhost:5000'
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuthEndpoint = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🔐 Testing auth endpoint...')
      
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
      
      const data = await response.text()
      
      setResult({
        endpoint: '/api/v1/auth/login',
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      
             console.log('✅ Auth endpoint test completed:', {
         endpoint: '/api/v1/auth/login',
         status: response.status,
         statusText: response.statusText,
         data: data
       })
    } catch (error) {
      console.error('❌ Auth endpoint test failed:', error)
      setResult({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/v1/auth/login'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Server Test</CardTitle>
        <CardDescription>Тестирование доступности сервера</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testServerHealth} disabled={loading}>
            {loading ? 'Testing...' : 'Test Health'}
          </Button>
          <Button onClick={testAuthEndpoint} disabled={loading} variant="outline">
            {loading ? 'Testing...' : 'Test Auth'}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 