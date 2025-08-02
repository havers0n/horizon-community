import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms';
import { useCitizenPortalStore } from '../model/store';
import { VehiclesTab } from './property-tabs/VehiclesTab';
import { WeaponsTab } from './property-tabs/WeaponsTab';
import { CompaniesTab } from './property-tabs/CompaniesTab';
import { PetsTab } from './property-tabs/PetsTab';
import { CargoTab } from './property-tabs/CargoTab';

interface PropertyViewProps {
  subView: string;
}

export const PropertyView: React.FC<PropertyViewProps> = ({ subView }) => {
  const { activeCharacter } = useCitizenPortalStore();

  if (!activeCharacter) return null;

  const defaultTab = subView || 'vehicles';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Собственность и связи</h1>
        <p className="text-slate-400">
          Управление транспортом, оружием, компаниями и другими активами
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="vehicles">Транспорт</TabsTrigger>
          <TabsTrigger value="weapons">Оружие</TabsTrigger>
          <TabsTrigger value="companies">Компании</TabsTrigger>
          <TabsTrigger value="pets">Питомцы</TabsTrigger>
          <TabsTrigger value="cargo">Грузоперевозки</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-6">
          <VehiclesTab character={activeCharacter} />
        </TabsContent>

        <TabsContent value="weapons" className="mt-6">
          <WeaponsTab character={activeCharacter} />
        </TabsContent>

        <TabsContent value="companies" className="mt-6">
          <CompaniesTab character={activeCharacter} />
        </TabsContent>

        <TabsContent value="pets" className="mt-6">
          <PetsTab character={activeCharacter} />
        </TabsContent>

        <TabsContent value="cargo" className="mt-6">
          <CargoTab character={activeCharacter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 