import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Input } from '@/shared/ui/atoms/Input';
import { setTokenGlobally, clearTokenGlobally, getCurrentToken } from '../lib/auth-init';

export const TestTokenInserter: React.FC = () => {
  const [token, setToken] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InRlc3RfZGlzcGF0Y2hlciIsImVtYWlsIjoiZGlzcGF0Y2hlckB0ZXN0LmNvbSIsInJvbGUiOiJEaXNwYXRjaCIsInN0YXR1cyI6ImFjdGl2ZSIsImRlcGFydG1lbnRJZCI6NSwicmFuayI6IkRpc3BhdGNoZXIiLCJhdXRoSWQiOiJ0ZXN0LWF1dGgtaWQtMTIzIn0sImV4cCI6MTc1MzkxODAzMiwiaWF0IjoxNzUzODMxNjMyfQ._RxLkecjVEG4FxTwz4D97RdAjj6BXfbeSPhbuH3EIEo';

  const handleInsertTestToken = () => {
    setTokenGlobally(testToken);
    setToken(testToken);
    alert('Тестовый токен установлен! Обновите страницу.');
  };

  const handleInsertCustomToken = () => {
    if (token.trim()) {
      setTokenGlobally(token.trim());
      alert('Кастомный токен установлен! Обновите страницу.');
    } else {
      alert('Введите токен!');
    }
  };

  const handleClearToken = () => {
    clearTokenGlobally();
    setToken('');
    alert('Токен удален! Обновите страницу.');
  };

  const currentToken = getCurrentToken();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          🔑 Тест токен
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-gray-800 border-yellow-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400 text-sm">🔑 Тестовый токен авторизации</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Button
              onClick={handleInsertTestToken}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Вставить тестовый токен
            </Button>
            
            <div className="space-y-2">
              <Input
                placeholder="Или вставьте свой токен..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="text-xs"
              />
              <Button
                onClick={handleInsertCustomToken}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Вставить кастомный токен
              </Button>
            </div>

            <Button
              onClick={handleClearToken}
              size="sm"
              variant="outline"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Удалить токен
            </Button>
          </div>

          {currentToken && (
            <div className="text-xs text-green-400 bg-green-900/20 p-2 rounded">
              ✅ Токен установлен
            </div>
          )}

          <Button
            onClick={() => setIsVisible(false)}
            size="sm"
            variant="ghost"
            className="w-full text-gray-400"
          >
            Скрыть
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 