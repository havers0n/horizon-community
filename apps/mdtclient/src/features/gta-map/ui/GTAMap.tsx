import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface GTAMapProps {
  onClose?: () => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface MapLocation {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description?: string;
  icon?: string;
  category?: string;
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  locations: MapLocation[];
}

// Mock data for GTA map locations
const mockLocations: MapLocation[] = [
  {
    id: 1,
    name: "Los Santos International Airport",
    type: "airport",
    lat: 34.0522,
    lng: -118.2437,
    description: "Main airport serving Los Santos",
    category: "transport"
  },
  {
    id: 2,
    name: "Vinewood Hills",
    type: "residential",
    lat: 34.0928,
    lng: -118.3287,
    description: "Upscale residential area",
    category: "residential"
  },
  {
    id: 3,
    name: "Downtown Los Santos",
    type: "business",
    lat: 34.0522,
    lng: -118.2437,
    description: "Central business district",
    category: "business"
  },
  {
    id: 4,
    name: "Vespucci Beach",
    type: "recreation",
    lat: 33.9850,
    lng: -118.4695,
    description: "Popular beach area",
    category: "recreation"
  },
  {
    id: 5,
    name: "Grove Street",
    type: "residential",
    lat: 33.9731,
    lng: -118.2489,
    description: "Historic neighborhood",
    category: "residential"
  },
  {
    id: 6,
    name: "Mount Chiliad",
    type: "landmark",
    lat: 34.0928,
    lng: -118.3287,
    description: "Highest peak in the region",
    category: "landmark"
  },
  {
    id: 7,
    name: "Del Perro Pier",
    type: "recreation",
    lat: 33.9850,
    lng: -118.4695,
    description: "Popular pier and amusement area",
    category: "recreation"
  },
  {
    id: 8,
    name: "Los Santos Police Department",
    type: "government",
    lat: 34.0522,
    lng: -118.2437,
    description: "Main police station",
    category: "government"
  },
  {
    id: 9,
    name: "Central Los Santos Medical Center",
    type: "medical",
    lat: 34.0522,
    lng: -118.2437,
    description: "Major hospital",
    category: "medical"
  },
  {
    id: 10,
    name: "Los Santos Fire Station",
    type: "emergency",
    lat: 34.0522,
    lng: -118.2437,
    description: "Fire department headquarters",
    category: "emergency"
  }
];

const mockLayers: MapLayer[] = [
  {
    id: "transport",
    name: "Transport",
    visible: true,
    color: "#3B82F6",
    locations: mockLocations.filter(loc => loc.category === "transport")
  },
  {
    id: "residential",
    name: "Residential",
    visible: true,
    color: "#10B981",
    locations: mockLocations.filter(loc => loc.category === "residential")
  },
  {
    id: "business",
    name: "Business",
    visible: true,
    color: "#F59E0B",
    locations: mockLocations.filter(loc => loc.category === "business")
  },
  {
    id: "recreation",
    name: "Recreation",
    visible: true,
    color: "#8B5CF6",
    locations: mockLocations.filter(loc => loc.category === "recreation")
  },
  {
    id: "landmark",
    name: "Landmarks",
    visible: true,
    color: "#EF4444",
    locations: mockLocations.filter(loc => loc.category === "landmark")
  },
  {
    id: "government",
    name: "Government",
    visible: true,
    color: "#6B7280",
    locations: mockLocations.filter(loc => loc.category === "government")
  },
  {
    id: "medical",
    name: "Medical",
    visible: true,
    color: "#EC4899",
    locations: mockLocations.filter(loc => loc.category === "medical")
  },
  {
    id: "emergency",
    name: "Emergency",
    visible: true,
    color: "#DC2626",
    locations: mockLocations.filter(loc => loc.category === "emergency")
  }
];

export const GTAMap: React.FC<GTAMapProps> = ({ 
  onClose, 
  onLocationSelect, 
  isFullscreen = false,
  onToggleFullscreen 
}) => {
  const { t } = useLocale();
  const [layers, setLayers] = useState<MapLayer[]>(mockLayers);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [zoom, setZoom] = useState(10);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        name: location.name
      });
    }
  };

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(prev + 1, 20);
      } else {
        return Math.max(prev - 1, 1);
      }
    });
  };

  const centerOnLocation = (location: MapLocation) => {
    setSelectedLocation(location);
    // В реальной реализации здесь будет центрирование карты
  };

  const getLocationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      airport: "✈️",
      residential: "🏠",
      business: "🏢",
      recreation: "🎡",
      landmark: "🗽",
      government: "🏛️",
      medical: "🏥",
      emergency: "🚨"
    };
    return icons[type] || "📍";
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <Card className={`${isFullscreen ? 'h-full' : 'h-96'}`}>
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">{t('gtaMap.title')}</h3>
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
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
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
            className="w-full h-full bg-gradient-to-br from-blue-900 to-green-900 relative overflow-hidden"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 80px)' : '300px' }}
          >
            {/* Map Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-20 grid-rows-20 h-full">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div key={i} className="border border-white/10"></div>
                ))}
              </div>
            </div>

            {/* Location Markers */}
            {layers.map(layer => 
              layer.visible && layer.locations.map(location => (
                <div
                  key={location.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${((location.lng + 118.5) / 0.5) * 100}%`,
                    top: `${((34.5 - location.lat) / 0.5) * 100}%`,
                  }}
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">{getLocationIcon(location.type)}</div>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {location.name}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Zoom Level Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
              Zoom: {zoom}x
            </div>
          </div>

          {/* Layer Controls */}
          <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-white" />
              <span className="text-white text-sm font-medium">{t('gtaMap.layers')}</span>
            </div>
            <div className="space-y-1">
              {layers.map(layer => (
                <label key={layer.id} className="flex items-center gap-2 text-white text-xs">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => toggleLayer(layer.id)}
                    className="w-3 h-3"
                  />
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  {layer.name}
                </label>
              ))}
            </div>
          </div>

          {/* Quick Location List */}
          <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3 max-w-xs">
            <h4 className="text-white text-sm font-medium mb-2">{t('gtaMap.quickLocations')}</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {mockLocations.slice(0, 5).map(location => (
                <button
                  key={location.id}
                  onClick={() => centerOnLocation(location)}
                  className="block w-full text-left text-white text-xs hover:bg-white/10 px-2 py-1 rounded"
                >
                  {getLocationIcon(location.type)} {location.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 bg-black/90 rounded-lg p-4 max-w-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium">{selectedLocation.name}</h4>
                <p className="text-gray-300 text-sm">{selectedLocation.description}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {onLocationSelect && (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => onLocationSelect({
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                  name: selectedLocation.name
                })}
              >
                <Navigation size={14} className="mr-1" />
                {t('map.selectLocation')}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
