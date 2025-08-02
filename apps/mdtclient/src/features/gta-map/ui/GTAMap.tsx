import React, { useState, useRef, useCallback } from 'react';
import { Card, Button } from '../../../shared/ui/atoms';
import { MapPin, ZoomIn, ZoomOut, Move, User, Phone, AlertTriangle, Shield } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import gtaMapImage from '@/assets/images/gta-map.jpg';

interface Unit {
  id: string;
  name: string;
  status: string;
  location: { x: number; y: number };
  type: 'leo' | 'ems' | 'fire' | 'dispatch';
}

interface Call {
  id: string;
  description: string;
  location: { x: number; y: number };
  priority: 'low' | 'medium' | 'high';
  status: string;
}

interface GTAMapProps {
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
  showHeader?: boolean;
  units?: Unit[];
  calls?: Call[];
  onUnitClick?: (unit: Unit) => void;
  onCallClick?: (call: Call) => void;
}

export const GTAMap: React.FC<GTAMapProps> = ({ 
  onClose, 
  isFullscreen = false,
  onToggleFullscreen,
  className = '',
  showHeader = true,
  units = [],
  calls = [],
  onUnitClick,
  onCallClick
}) => {
  const { t } = useLocale();
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showUnits, setShowUnits] = useState(true);
  const [showCalls, setShowCalls] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(prev + 0.5, 5);
      } else {
        return Math.max(prev - 0.5, 0.5);
      }
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(5, prev + delta));
      return newZoom;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Не начинаем перетаскивание, если кликнули на маркер
    if ((e.target as HTMLElement).closest('.map-marker')) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'leo': return <Shield className="w-4 h-4" />;
      case 'ems': return <User className="w-4 h-4" />;
      case 'fire': return <AlertTriangle className="w-4 h-4" />;
      case 'dispatch': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getUnitColor = (type: string) => {
    switch (type) {
      case 'leo': return 'bg-blue-500';
      case 'ems': return 'bg-red-500';
      case 'fire': return 'bg-orange-500';
      case 'dispatch': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCallColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center p-4 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Карта GTA</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUnits(!showUnits)}
              className={`${showUnits ? 'bg-blue-600/50' : 'bg-slate-700/50'} hover:bg-slate-600/50`}
              title="Показать/скрыть юниты"
            >
              <User size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCalls(!showCalls)}
              className={`${showCalls ? 'bg-red-600/50' : 'bg-slate-700/50'} hover:bg-slate-600/50`}
              title="Показать/скрыть вызовы"
            >
              <Phone size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleZoom('out')}
              className="bg-slate-700/50 hover:bg-slate-600/50"
            >
              <ZoomOut size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleZoom('in')}
              className="bg-slate-700/50 hover:bg-slate-600/50"
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              className="bg-slate-700/50 hover:bg-slate-600/50"
              title="Сбросить вид"
            >
              <Move size={16} />
            </Button>
            {onToggleFullscreen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onToggleFullscreen}
                className="bg-slate-700/50 hover:bg-slate-600/50"
              >
                {isFullscreen ? '⊖' : '⊕'}
              </Button>
            )}
            {onClose && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="bg-slate-700/50 hover:bg-slate-600/50"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full relative overflow-hidden"
        style={{ 
          minHeight: isFullscreen ? 'calc(100vh - 80px)' : showHeader ? 'calc(100% - 80px)' : '100%',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* GTA Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${gtaMapImage})`,
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        />

        {/* Units Markers */}
        {showUnits && units.map((unit) => (
          <div
            key={unit.id}
            className="absolute map-marker cursor-pointer z-10"
            style={{
              left: `${unit.location.x}%`,
              top: `${unit.location.y}%`,
              transform: `translate(-50%, -50%) scale(${1/zoom})`
            }}
            onClick={() => onUnitClick?.(unit)}
          >
            <div className={`${getUnitColor(unit.type)} rounded-full p-2 shadow-lg border-2 border-white`}>
              {getUnitIcon(unit.type)}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              {unit.name}
            </div>
          </div>
        ))}

        {/* Calls Markers */}
        {showCalls && calls.map((call) => (
          <div
            key={call.id}
            className="absolute map-marker cursor-pointer z-10"
            style={{
              left: `${call.location.x}%`,
              top: `${call.location.y}%`,
              transform: `translate(-50%, -50%) scale(${1/zoom})`
            }}
            onClick={() => onCallClick?.(call)}
          >
            <div className={`${getCallColor(call.priority)} rounded-full p-2 shadow-lg border-2 border-white`}>
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap max-w-32 truncate">
              {call.description}
            </div>
          </div>
        ))}

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">
          Масштаб: {zoom.toFixed(1)}x
        </div>

        {/* Controls Hint */}
        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">
          Колесико мыши для зума • Перетаскивание для перемещения
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded text-sm backdrop-blur-sm">
          <div className="font-semibold mb-2">Легенда:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Полиция</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Скорая</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Пожарные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Диспетчеры</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {!gtaMapImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
              <p className="text-slate-400">Загрузка карты...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
