import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms';
import { useCitizenPortalStore } from '../model/store';
import { PersonalDataTab } from './profile-tabs/PersonalDataTab';
import { CareerTab } from './profile-tabs/CareerTab';
import { CriminalHistoryTab } from './profile-tabs/CriminalHistoryTab';

interface ProfileViewProps {
  subView: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ subView }) => {
  const { activeCharacter } = useCitizenPortalStore();

  if (!activeCharacter) return null;

  const defaultTab = subView || 'personal';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Профиль гражданина</h1>
        <p className="text-slate-400">
          Управление личными данными, карьерным путем и криминальной историей
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Личные данные</TabsTrigger>
          <TabsTrigger value="career">Карьерный путь</TabsTrigger>
          <TabsTrigger value="criminal">Криминальная история</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalDataTab character={activeCharacter} />
        </TabsContent>

        <TabsContent value="career" className="mt-6">
          <CareerTab character={activeCharacter} />
        </TabsContent>

        <TabsContent value="criminal" className="mt-6">
          <CriminalHistoryTab character={activeCharacter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 