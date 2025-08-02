import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Character } from '@/shared/types';

interface CompaniesTabProps {
  character: Character;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({ character }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Компании и бизнес</h3>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            Компании и бизнес-интересы персонажа {character.firstName} {character.lastName}
          </p>
          <p className="text-slate-500 mt-2">
            Компонент находится в разработке
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 