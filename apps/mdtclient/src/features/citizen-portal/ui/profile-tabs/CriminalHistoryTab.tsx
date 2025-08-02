import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { Edit, AlertTriangle, Calendar, FileText, Plus } from 'lucide-react';
import type { Character } from '@/shared/types';

interface CriminalHistoryTabProps {
  character: Character;
}

export const CriminalHistoryTab: React.FC<CriminalHistoryTabProps> = ({ character }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const criminalRecords = character.criminalRecord || [];

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-400">Всего нарушений</p>
                <p className="text-lg font-semibold text-white">{criminalRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-400">Проступки</p>
                <p className="text-lg font-semibold text-white">
                  {criminalRecords.filter((record: any) => record.severity === 'misdemeanor').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-400">Преступления</p>
                <p className="text-lg font-semibold text-white">
                  {criminalRecords.filter((record: any) => record.severity === 'felony').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Криминальная история */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Криминальная история</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить запись
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criminalRecords.length > 0 ? (
              criminalRecords.map((record: any, index: number) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h4 className="text-white font-medium">{record.offense}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.severity === 'felony' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {record.severity === 'felony' ? 'Преступление' : 'Проступок'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.status === 'active' ? 'bg-red-500/20 text-red-400' :
                        record.status === 'expunged' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {record.status === 'active' ? 'Активно' :
                         record.status === 'expunged' ? 'Погашено' : 'Ожидает'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Дата: </span>
                      <span className="text-white">{formatDate(record.date)}</span>
                    </div>
                    
                    {record.sentence && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Приговор: </span>
                        <span className="text-white">{record.sentence}</span>
                      </div>
                    )}
                    
                    {record.fine && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Штраф: </span>
                        <span className="text-white">${record.fine}</span>
                      </div>
                    )}
                    
                    {record.jailTime && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Тюремный срок: </span>
                        <span className="text-white">{record.jailTime}</span>
                      </div>
                    )}
                  </div>
                  
                  {record.notes && (
                    <div className="mt-3 p-3 bg-slate-700/50 rounded">
                      <p className="text-slate-300 text-sm">{record.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Просмотр деталей
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Криминальная история чиста</h4>
                <p className="text-slate-400 mb-6">
                  У персонажа нет записей о нарушениях закона
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первую запись
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Активные ордера */}
      <Card className="border-slate-700">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Активные ордера</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Активные ордера отсутствуют</p>
          </div>
        </CardContent>
      </Card>

      {/* История арестов */}
      <Card className="border-slate-700">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">История арестов</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">История арестов отсутствует</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 