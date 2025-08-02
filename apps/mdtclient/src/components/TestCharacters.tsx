import React, { useState } from 'react';
import { CitizenApi } from '@/features/citizen-portal/api/citizenApi';

export const TestCharacters: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      console.log('🧪 Запуск теста таблицы characters...');
      const result = await CitizenApi.testTable();
      setTestResult(result);
      console.log('🧪 Результат теста:', result);
    } catch (error) {
      console.error('🧪 Ошибка при выполнении теста:', error);
      setTestResult({ success: false, error: error });
    } finally {
      setLoading(false);
    }
  };

  const createTestCharacter = async () => {
    setLoading(true);
    try {
      console.log('🧪 Создание тестового персонажа...');
      const result = await CitizenApi.createTestCharacter();
      setTestResult(result);
      console.log('🧪 Результат создания персонажа:', result);
    } catch (error) {
      console.error('🧪 Ошибка при создании персонажа:', error);
      setTestResult({ success: false, error: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🧪 Тест таблицы Characters</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Тестирование...' : 'Запустить тест таблицы'}
        </button>
        
        <button
          onClick={createTestCharacter}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Создание...' : 'Создать тестового персонажа'}
        </button>
      </div>

      {testResult && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Результат:</h4>
          <pre className="bg-white p-3 rounded border text-sm overflow-auto max-h-96">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 