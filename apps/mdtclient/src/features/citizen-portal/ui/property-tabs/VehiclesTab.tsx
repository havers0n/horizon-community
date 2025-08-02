import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Character } from '@/shared/types';

interface VehiclesTabProps {
  character: Character;
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({ character }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Транспортные средства</h3>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            Транспортные средства персонажа {character.firstName} {character.lastName}
          </p>
          <p className="text-slate-500 mt-2">
            Компонент находится в разработке
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 