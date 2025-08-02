import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, ExternalLink } from 'lucide-react';

interface InterfaceEmbedProps {
  type: 'mdt';
  onClose?: () => void;
}

export function InterfaceEmbed({ type, onClose }: InterfaceEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const interfaces = {
    mdt: {
      url: 'http://localhost:3001',
      title: 'MDT System',
      description: 'Система управления данными'
    }
  };

  const currentInterface = interfaces[type];

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Не удалось загрузить интерфейс');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setIframeKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(currentInterface.url, '_blank');
  };

  useEffect(() => {
    // Проверяем доступность интерфейса
    const checkAvailability = async () => {
      try {
        const response = await fetch(currentInterface.url, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        // Если запрос прошел, интерфейс доступен
      } catch (err) {
        setError('Интерфейс недоступен');
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [currentInterface.url]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{currentInterface.title}</h2>
            <p className="text-sm text-gray-600">{currentInterface.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка {currentInterface.title}...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <X className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRefresh}>
                    Попробовать снова
                  </Button>
                  <Button variant="outline" onClick={handleOpenInNewTab}>
                    Открыть в новой вкладке
                  </Button>
                </div>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={currentInterface.url}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            title={currentInterface.title}
          />
        </div>
      </div>
    </div>
  );
} 