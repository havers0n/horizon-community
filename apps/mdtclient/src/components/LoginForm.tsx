import React, { useState } from 'react';
import { useAuth } from '../shared/contexts/AuthContext';
import { Button } from '../shared/ui/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/atoms/Card';
import { Input } from '../shared/ui/atoms/Input';
import { Label } from '../shared/ui/atoms/Label';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  console.log('[LoginForm] Component rendered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('[LoginForm] Attempting login with email:', email);
      await login(email, password);
      console.log('[LoginForm] Login successful');
    } catch (error) {
      console.error('[LoginForm] Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            MDT System Login
          </CardTitle>
          <p className="text-gray-400 mt-2">
            Enter your credentials to access the MDT system
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900 border border-red-700 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Test Credentials:
            </h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Email:</strong> admin@test.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 