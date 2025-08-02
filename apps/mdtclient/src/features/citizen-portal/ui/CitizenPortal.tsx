import React from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { CharacterSelection } from './CharacterSelection';
import { CitizenSidebar } from './CitizenSidebar';
import { CitizenMainContent } from './CitizenMainContent';
import { useCitizenPortalStore } from '../model/store';
import type { Character } from '@/shared/types';

export const CitizenPortal: React.FC = () => {
  const { user } = useAuth();
  const { activeCharacter, setActiveCharacter } = useCitizenPortalStore();
  const apiService = new ApiService();

  // Загружаем персонажей пользователя через бэкенд API
  const { data: characters, isLoading, error } = useQuery({
    queryKey: ['user-characters', user?.id],
    queryFn: () => apiService.getUserCharacters(),
    enabled: !!user?.id,
  });

  // Если нет активного персонажа, показываем выбор
  if (!activeCharacter) {
    return (
      <CharacterSelection 
        characters={characters || []}
        isLoading={isLoading}
        error={error}
        onCharacterSelect={setActiveCharacter}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <CitizenSidebar />
      <CitizenMainContent />
    </div>
  );
}; 