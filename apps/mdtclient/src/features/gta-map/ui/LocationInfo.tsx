import React from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { MapPin, Navigation, Phone, Mail, Clock, Star } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface LocationInfoProps {
  location: {
    id: number;
    name: string;
    type: string;
    lat: number;
    lng: number;
    description?: string;
    category?: string;
  };
  onClose: () => void;
  onNavigate?: () => void;
}

const getLocationIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    airport: "✈️",
    residential: "🏠",
    business: "🏢",
    recreation: "🎡",
    landmark: "🗽",
    government: "🏛️",
    medical: "🏥",
    emergency: "🚨",
    restaurant: "🍽️",
    hotel: "🏨",
    gas_station: "⛽",
    bank: "🏦",
    school: "🏫",
    hospital: "🏥",
    police: "👮",
    fire: "🚒"
  };
  return icons[type] || "📍";
};

const getLocationTypeName = (type: string) => {
  const types: { [key: string]: string } = {
    airport: "Аэропорт",
    residential: "Жилой район",
    business: "Бизнес-центр",
    recreation: "Место отдыха",
    landmark: "Достопримечательность",
    government: "Правительственное здание",
    medical: "Медицинское учреждение",
    emergency: "Экстренная служба",
    restaurant: "Ресторан",
    hotel: "Отель",
    gas_station: "Заправка",
    bank: "Банк",
    school: "Школа",
    hospital: "Больница",
    police: "Полиция",
    fire: "Пожарная часть"
  };
  return types[type] || type;
};

export const LocationInfo: React.FC<LocationInfoProps> = ({ 
  location, 
  onClose, 
  onNavigate 
}) => {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getLocationIcon(location.type)}</div>
            <div>
              <h3 className="text-lg font-semibold text-white">{location.name}</h3>
              <p className="text-secondary-400 text-sm">{getLocationTypeName(location.type)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-white"
          >
            ✕
          </button>
        </CardHeader>
        
        <div className="p-6 space-y-4">
          {location.description && (
            <div>
              <p className="text-white text-sm">{location.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-secondary-400" />
              <div>
                <p className="text-white text-sm font-medium">Координаты</p>
                <p className="text-secondary-400 text-xs">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>

            {location.category && (
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-secondary-400" />
                <div>
                  <p className="text-white text-sm font-medium">Категория</p>
                  <p className="text-secondary-400 text-xs capitalize">{location.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-secondary-400" />
              <div>
                <p className="text-white text-sm font-medium">Расстояние</p>
                <p className="text-secondary-400 text-xs">~2.3 км от центра</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {onNavigate && (
              <Button
                onClick={onNavigate}
                className="flex-1"
              >
                <Navigation size={16} className="mr-2" />
                {t('map.navigate')}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="secondary"
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
