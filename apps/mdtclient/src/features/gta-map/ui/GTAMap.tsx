import React, { useState, useRef } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import gtaMapImage from '@/assets/images/gta-map.jpg';

interface GTAMapProps {
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const GTAMap: React.FC<GTAMapProps> = ({ 
  onClose, 
  isFullscreen = false,
  onToggleFullscreen 
}) => {
  const { t } = useLocale();
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(prev + 0.5, 5);
      } else {
        return Math.max(prev - 0.5, 0.5);
      }
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(5, prev + delta));
      return newZoom;
    });
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <Card className={`${isFullscreen ? 'h-full' : 'h-96'}`}>
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Карта GTA</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleZoom('out')}
            >
              <ZoomOut size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleZoom('in')}
            >
              <ZoomIn size={16} />
            </Button>
            {onToggleFullscreen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? '⊖' : '⊕'}
              </Button>
            )}
            {onClose && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                ✕
              </Button>
            )}
          </div>
        </CardHeader>

        <div className="relative flex-1">
          {/* Map Container */}
          <div 
            ref={mapRef}
            className="w-full h-full relative overflow-hidden"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 80px)' : '300px' }}
            onWheel={handleWheel}
          >
            {/* GTA Map Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${gtaMapImage})`,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            />

            {/* Zoom Level Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
              Масштаб: {zoom.toFixed(1)}x
            </div>

            {/* Zoom Controls Hint */}
            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
              Колесико мыши для зума
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
