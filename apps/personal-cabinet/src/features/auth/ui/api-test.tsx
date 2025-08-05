import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { AuthAPI } from '../api'

export function ApiTest() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🧪 Testing login with:', { email, password })
      const response = await AuthAPI.signIn({ email, password })
      console.log('✅ Login response:', response)
      setResult(response)
    } catch (error) {
      console.error('❌ Login error:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testRegister = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🧪 Testing register with:', { email, password, firstName: 'Test', lastName: 'User' })
      const response = await AuthAPI.signUp({ email, password, first_name: 'Test', last_name: 'User' })
      console.log('✅ Register response:', response)
      setResult(response)
    } catch (error) {
      console.error('❌ Register error:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Test</CardTitle>
        <CardDescription>Тестирование API аутентификации</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={testLogin} disabled={loading}>
            {loading ? 'Testing...' : 'Test Login'}
          </Button>
          <Button onClick={testRegister} disabled={loading} variant="outline">
            {loading ? 'Testing...' : 'Test Register'}
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