import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Character } from '../../types';
import { Users, UserPlus, Edit, Eye } from 'lucide-react';

interface CharacterListWidgetProps {
  className?: string;
  maxItems?: number;
  onCharacterSelect?: (character: Character) => void;
  onCharacterEdit?: (character: Character) => void;
  onCharacterView?: (character: Character) => void;
  onCreateNew?: () => void;
}

export const CharacterListWidget: React.FC<CharacterListWidgetProps> = ({
  className = '',
  maxItems = 5,
  onCharacterSelect,
  onCharacterEdit,
  onCharacterView,
  onCreateNew
}) => {
  const { characters, isLoading } = useAuth();

  const displayedCharacters = characters.slice(0, maxItems);

  const getCharacterStatus = (character: Character) => {
    if (character.dead) return { label: 'Мертв', color: 'bg-red-100 text-red-800' };
    if (character.missing) return { label: 'Пропал', color: 'bg-yellow-100 text-yellow-800' };
    if (character.arrested) return { label: 'Арестован', color: 'bg-orange-100 text-orange-800' };
    if (character.isUnit && character.isActive) return { label: 'Активен', color: 'bg-green-100 text-green-800' };
    if (character.isUnit && !character.isActive) return { label: 'Неактивен', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Гражданский', color: 'bg-blue-100 text-blue-800' };
  };

  const getCharacterType = (character: Character) => {
    if (character.isUnit) {
      if (character.departmentId) {
        // Здесь можно добавить логику для определения департамента
        return 'Сотрудник';
      }
      return 'Сотрудник';
    }
    return 'Гражданский';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Мои персонажи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Мои персонажи
          </CardTitle>
          {onCreateNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateNew}
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Создать
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedCharacters.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">У вас пока нет персонажей</p>
            {onCreateNew && (
              <Button onClick={onCreateNew} className="flex items-center gap-2 mx-auto">
                <UserPlus className="h-4 w-4" />
                Создать первого персонажа
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedCharacters.map((character) => {
              const status = getCharacterStatus(character);
              const type = getCharacterType(character);
              
              return (
                <div
                  key={character.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {character.firstName} {character.lastName}
                        </h4>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Тип:</span>
                          <span>{type}</span>
                        </div>
                        
                        {character.occupation && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Профессия:</span>
                            <span>{character.occupation}</span>
                          </div>
                        )}
                        
                        {character.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Телефон:</span>
                            <span>{character.phoneNumber}</span>
                          </div>
                        )}
                        
                        {character.address && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Адрес:</span>
                            <span className="truncate">{character.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {onCharacterView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCharacterView(character)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onCharacterEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCharacterEdit(character)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onCharacterSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCharacterSelect(character)}
                          className="text-xs"
                        >
                          Выбрать
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {characters.length > maxItems && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Показано {maxItems} из {characters.length} персонажей
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 