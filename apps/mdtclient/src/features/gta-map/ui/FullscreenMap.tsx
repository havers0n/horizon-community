import React, { useEffect } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { MapPin, X, Navigation } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface FullscreenMapProps {
  onClose: () => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
}

export const FullscreenMap: React.FC<FullscreenMapProps> = ({ 
  onClose, 
  onLocationSelect 
}) => {
  const { t } = useLocale();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleLocationSelect = (location: { lat: number; lng: number; name: string }) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-secondary-800 border-b border-secondary-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-primary-500" />
              <h1 className="text-xl font-semibold text-white">{t('map.fullscreenTitle')}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Map Content */}
        <div className="flex-1 relative">
          {/* Mock Map Background */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-green-800 to-yellow-900 relative">
            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-50 grid-rows-50 h-full">
                {Array.from({ length: 2500 }).map((_, i) => (
                  <div key={i} className="border border-white/5"></div>
                ))}
              </div>
            </div>

            {/* Mock Locations */}
            <div className="absolute top-1/4 left-1/4">
              <button
                onClick={() => handleLocationSelect({
                  lat: 34.0522,
                  lng: -118.2437,
                  name: "Los Santos International Airport"
                })}
                className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition-colors"
              >
                ✈️ Airport
              </button>
            </div>

            <div className="absolute top-1/3 right-1/3">
              <button
                onClick={() => handleLocationSelect({
                  lat: 34.0928,
                  lng: -118.3287,
                  name: "Vinewood Hills"
                })}
                className="bg-green-500 text-white px-3 py-1 rounded-full text-sm hover:bg-green-600 transition-colors"
              >
                🏠 Vinewood
              </button>
            </div>

            <div className="absolute bottom-1/3 left-1/3">
              <button
                onClick={() => handleLocationSelect({
                  lat: 33.9850,
                  lng: -118.4695,
                  name: "Vespucci Beach"
                })}
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors"
              >
                🏖️ Beach
              </button>
            </div>

            <div className="absolute bottom-1/4 right-1/4">
              <button
                onClick={() => handleLocationSelect({
                  lat: 33.9731,
                  lng: -118.2489,
                  name: "Grove Street"
                })}
                className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-600 transition-colors"
              >
                🏘️ Grove St
              </button>
            </div>

            {/* Center Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3">
            <h3 className="text-white text-sm font-medium mb-2">{t('map.controls')}</h3>
            <div className="space-y-2">
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                🔍 {t('map.zoomIn')}
              </button>
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                🔍 {t('map.zoomOut')}
              </button>
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                🧭 {t('map.compass')}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg p-3">
            <h3 className="text-white text-sm font-medium mb-2">{t('map.quickActions')}</h3>
            <div className="space-y-2">
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                🏥 {t('map.hospitals')}
              </button>
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                👮 {t('map.police')}
              </button>
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                ⛽ {t('map.gasStations')}
              </button>
              <button className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded">
                🏦 {t('map.banks')}
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm">
            <div>Lat: 34.0522° N</div>
            <div>Lng: 118.2437° W</div>
            <div>Zoom: 12x</div>
          </div>
        </div>
      </div>
    </div>
  );
};
