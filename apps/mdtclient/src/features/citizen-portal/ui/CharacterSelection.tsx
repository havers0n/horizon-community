import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Plus, User, Loader2 } from 'lucide-react';
import type { Character } from '@/shared/types';
import { CitizenRegistrationWizard } from '../ui/CitizenRegistrationWizard';

interface CharacterSelectionProps {
  characters: Character[];
  isLoading: boolean;
  error: Error | null;
  onCharacterSelect: (character: Character) => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  characters,
  isLoading,
  error,
  onCharacterSelect,
}) => {
  const [showRegistration, setShowRegistration] = React.useState(false);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-white">Загрузка персонажей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка загрузки персонажей</p>
          <p className="text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  if (showRegistration) {
    return (
      <CitizenRegistrationWizard 
        onComplete={(character) => {
          onCharacterSelect(character);
          setShowRegistration(false);
        }}
        onCancel={() => setShowRegistration(false)}
      />
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Выберите персонажа
          </h1>
          <p className="text-slate-400">
            Выберите существующего персонажа или создайте нового
          </p>
        </div>

        {characters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {characters.map((character) => (
              <Card 
                key={character.id}
                className="hover:bg-secondary-800 transition-colors cursor-pointer"
                onClick={() => onCharacterSelect(character)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {character.firstName} {character.lastName}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {character.occupation || 'Гражданский'}
                      </p>
                      {character.ssn && (
                        <p className="text-xs text-slate-500">
                          SSN: {character.ssn}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button 
            onClick={() => setShowRegistration(true)}
            className="flex items-center gap-2 mx-auto"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Создать нового персонажа
          </Button>
        </div>
      </div>
    </div>
  );
}; 