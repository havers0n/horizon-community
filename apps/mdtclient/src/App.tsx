import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">MDT Client</h1>
        <p className="text-lg text-muted-foreground">
          Система управления департаментами - MDT Client
        </p>
        <div className="mt-8 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">Статус системы</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Сервер подключен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>База данных активна</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>MDT система готова к работе</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 