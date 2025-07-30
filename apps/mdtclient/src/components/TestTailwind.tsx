import React from 'react';

export const TestTailwind: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎨 Тест Tailwind CSS
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Карточка 1 - Базовые стили */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Базовые стили
            </h2>
            <p className="text-gray-600 mb-4">
              Проверка базовых классов Tailwind CSS
            </p>
            <div className="space-y-2">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded">
                bg-blue-100 text-blue-800
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded">
                bg-green-100 text-green-800
              </div>
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded">
                bg-red-100 text-red-800
              </div>
            </div>
          </div>

          {/* Карточка 2 - Flexbox и Grid */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Flexbox и Grid
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                flex
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                flex-wrap
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                gap-2
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded text-center text-sm">
                Grid 1
              </div>
              <div className="bg-gray-100 p-2 rounded text-center text-sm">
                Grid 2
              </div>
            </div>
          </div>

          {/* Карточка 3 - Responsive */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Responsive дизайн
            </h2>
            <div className="space-y-2 text-sm">
              <div className="bg-purple-100 text-purple-800 p-2 rounded">
                <span className="hidden sm:inline">sm: </span>
                Responsive классы
              </div>
              <div className="bg-indigo-100 text-indigo-800 p-2 rounded">
                <span className="hidden md:inline">md: </span>
                Работают корректно
              </div>
              <div className="bg-pink-100 text-pink-800 p-2 rounded">
                <span className="hidden lg:inline">lg: </span>
                На всех экранах
              </div>
            </div>
          </div>
        </div>

        {/* Тест кастомных классов */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Кастомные классы из index.css
          </h2>
          <div className="space-y-4">
            <div className="test-red">
              🎯 Тестовый класс .test-red (красный текст на желтом фоне)
            </div>
            <div className="text-glow-red text-2xl font-bold">
              ✨ Текст с красным свечением
            </div>
            <div className="text-glow text-2xl font-bold">
              ✨ Текст с синим свечением
            </div>
            <div className="dashboard-card">
              🏢 Карточка с классом .dashboard-card
            </div>
          </div>
        </div>

        {/* Статус */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Tailwind CSS работает корректно! ✅
          </div>
        </div>
      </div>
    </div>
  );
}; 