import React, { useState, useRef, useCallback } from 'react';
import { Card, Button } from '../../../shared/ui/atoms';
import { MapPin, ZoomIn, ZoomOut, Move, User, Phone, AlertTriangle, Shield, Layers, Maximize2, Minimize2, Eye, EyeOff, Search, Filter, RefreshCw, Navigation, Target, Settings } from 'lucide-react';
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
  const [showGrid, setShowGrid] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [mapRef] = useState(useRef<HTMLDivElement>(null));

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
      case 'leo':
        return <Shield className="h-4 w-4" />;
      case 'ems':
        return <User className="h-4 w-4" />;
      case 'fire':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getUnitColor = (type: string) => {
    switch (type) {
      case 'leo':
        return 'bg-blue-500';
      case 'ems':
        return 'bg-green-500';
      case 'fire':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCallColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCallIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Phone className="h-4 w-4" />;
      case 'low':
        return <Phone className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative h-full bg-slate-900 overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      {showHeader && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30">
                <MapPin className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Карта города</h2>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Масштаб: {Math.round(zoom * 100)}%</span>
                <span>•</span>
                <span>{units.length} юнитов</span>
                <span>•</span>
                <span>{calls.length} вызовов</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="h-8 w-8 p-0 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 transition-all duration-200"
              >
                <Target className="h-4 w-4" />
              </Button>
              
              {onToggleFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleFullscreen}
                  className="h-8 w-8 p-0 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 transition-all duration-200"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              
              {onClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 transition-all duration-200"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          backgroundImage: `url(${gtaMapImage})`,
          backgroundSize: `${zoom * 100}%`,
          backgroundPosition: `${position.x}px ${position.y}px`,
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${50 * zoom}px ${50 * zoom}px`
              }}
            />
          </div>
        )}

        {/* Units */}
        {showUnits && units.map((unit) => (
          <div
            key={unit.id}
            className="map-marker absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${unit.location.x}%`,
              top: `${unit.location.y}%`,
              zIndex: 10
            }}
            onClick={() => onUnitClick?.(unit)}
          >
            <div className={`relative ${getUnitColor(unit.type)} rounded-full p-2 shadow-lg border-2 border-white group-hover:scale-110 transition-all duration-200`}>
              <div className="text-white">
                {getUnitIcon(unit.type)}
              </div>
              
              {/* Pulse Animation for Active Units */}
              {unit.status === 'available' && (
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
              )}
              
              {/* Panic Animation */}
              {unit.status === 'panic' && (
                <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse"></div>
              )}
            </div>
            
            {/* Unit Label */}
            {showLabels && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-slate-800/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {unit.name}
                <div className="text-slate-400">{unit.status}</div>
              </div>
            )}
          </div>
        ))}

        {/* Calls */}
        {showCalls && calls.map((call) => (
          <div
            key={call.id}
            className="map-marker absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${call.location.x}%`,
              top: `${call.location.y}%`,
              zIndex: 5
            }}
            onClick={() => onCallClick?.(call)}
          >
            <div className={`relative ${getCallColor(call.priority)} rounded-lg p-2 shadow-lg border-2 border-white group-hover:scale-110 transition-all duration-200`}>
              <div className="text-white">
                {getCallIcon(call.priority)}
              </div>
              
              {/* Emergency Pulse for High Priority */}
              {call.priority === 'high' && (
                <div className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-75"></div>
              )}
            </div>
            
            {/* Call Label */}
            {showLabels && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-slate-800/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-xs">
                <div className="font-medium">{call.priority.toUpperCase()}</div>
                <div className="text-slate-400 truncate">{call.description}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
        {/* Zoom Controls */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom('in')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom('out')}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Layer Controls */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnits(!showUnits)}
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showUnits 
                ? 'text-blue-400 bg-blue-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {showUnits ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCalls(!showCalls)}
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showCalls 
                ? 'text-orange-400 bg-orange-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {showCalls ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showGrid 
                ? 'text-green-400 bg-green-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 z-30">
        <h4 className="text-sm font-medium text-white mb-3">Легенда</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-300">Полиция</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-300">Медики</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-300">Пожарные</span>
          </div>
          <div className="border-t border-slate-700/50 my-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-slate-300">Критические вызовы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-slate-300">Средние вызовы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-slate-300">Низкие вызовы</span>
          </div>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg px-3 py-2 z-30">
        <div className="text-xs text-slate-400">
          <div>Масштаб: {Math.round(zoom * 100)}%</div>
          <div>Позиция: {Math.round(position.x)}, {Math.round(position.y)}</div>
        </div>
      </div>
    </div>
  );
};
