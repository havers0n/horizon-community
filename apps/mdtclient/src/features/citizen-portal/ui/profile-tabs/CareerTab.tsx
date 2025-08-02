import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Edit, Building, Calendar, User, Badge, FileText } from 'lucide-react';
import type { Character } from '@/shared/types';

interface CareerTabProps {
  character: Character;
}

export const CareerTab: React.FC<CareerTabProps> = ({ character }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isOfficer = character.isUnit || character.badgeNumber || character.departmentId;

  return (
    <div className="space-y-6">
      {/* Статус карьеры */}
      <Card className="border-slate-700">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Статус карьеры</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isOfficer ? 'bg-blue-500' : 'bg-slate-600'
            }`}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-medium">
                {isOfficer ? 'Сотрудник правоохранительных органов' : 'Гражданский'}
              </h4>
              <p className="text-slate-400 text-sm">
                {isOfficer ? 'Активный сотрудник' : 'Не является сотрудником'}
              </p>
            </div>
            {!isOfficer && (
              <Button className="ml-auto">
                <Edit className="w-4 h-4 mr-2" />
                Активировать карьеру
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Информация о службе */}
      {isOfficer && (
        <Card className="border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Информация о службе</h3>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <Badge className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Номер жетона</p>
                  <p className="text-white font-medium">{character.badgeNumber || 'Не указано'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <Building className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Департамент</p>
                  <p className="text-white font-medium">
                    {character.departmentId || 'Не указано'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Позывной</p>
                  <p className="text-white font-medium">{character.callsign || 'Не указано'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Дата найма</p>
                  <p className="text-white font-medium">
                    {formatDate(character.hireDate || '')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Звание</p>
                  <p className="text-white font-medium">
                    {character.rankId || 'Не указано'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <Building className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Подразделение</p>
                  <p className="text-white font-medium">
                    {character.divisionId || 'Не указано'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* История трудоустройства */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">История трудоустройства</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {character.employment ? (
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">
                    {character.employment.employer || 'Не указано'}
                  </h4>
                  <span className="text-sm text-slate-400">
                    {formatDate(character.employment.startDate || '')} - 
                    {character.employment.endDate ? formatDate(character.employment.endDate) : 'Настоящее время'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {character.employment.position || 'Должность не указана'}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">История трудоустройства не заполнена</p>
                <Button variant="outline" className="mt-4">
                  Добавить первую запись
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Лицензии и сертификаты */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Лицензии и сертификаты</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {character.licenses && Object.keys(character.licenses).length > 0 ? (
              Object.entries(character.licenses).map(([type, license]: [string, any]) => (
                <div key={type} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      license.status === 'valid' ? 'bg-green-500/20 text-green-400' :
                      license.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {license.status === 'valid' ? 'Действительна' :
                       license.status === 'expired' ? 'Истекла' : 'Приостановлена'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-slate-400">
                      Номер: <span className="text-white">{license.number || 'Не указан'}</span>
                    </p>
                    <p className="text-slate-400">
                      Истекает: <span className="text-white">{formatDate(license.expiry || '')}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Лицензии и сертификаты не добавлены</p>
                <Button variant="outline" className="mt-4">
                  Добавить первую лицензию
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 