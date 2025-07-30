import React from 'react';
import { Users, Car, Building, FileText, Phone, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';

export const CivilDepartmentPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 digital-noise">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white glow neon-glow">Гражданский Департамент</h1>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="digital" className="floating-card neon-glow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-400 mr-3 digital-flicker glow-primary" />
              <div className="text-left">
                <h3 className="font-medium text-white glow">Создать гражданского</h3>
                <p className="text-sm text-slate-400">Мастер создания персонажа</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="digital" className="floating-card neon-glow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="w-6 h-6 text-green-400 mr-3 digital-flicker glow-success" />
              <div className="text-left">
                <h3 className="font-medium text-white glow">Вызов 911 (текстовый)</h3>
                <p className="text-sm text-slate-400">Создать текстовый вызов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="digital" className="floating-card neon-glow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="w-6 h-6 text-red-400 mr-3 digital-flicker glow-danger" />
              <div className="text-left">
                <h3 className="font-medium text-white glow">Вызов 911 (голосовой)</h3>
                <p className="text-sm text-slate-400">Создать голосовой вызов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="digital" className="floating-card neon-glow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Car className="w-6 h-6 text-yellow-400 mr-3 digital-flicker glow" />
              <div className="text-left">
                <h3 className="font-medium text-white glow">Зарегистрировать Т/С</h3>
                <p className="text-sm text-slate-400">Регистрация транспортного средства</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="digital" className="floating-card neon-glow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-purple-400 mr-3 digital-flicker glow" />
              <div className="text-left">
                <h3 className="font-medium text-white glow">Зарегистрировать оружие</h3>
                <p className="text-sm text-slate-400">Регистрация оружия</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="digital" className="floating-card neon-glow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="w-6 h-6 text-indigo-400 mr-3 digital-flicker glow" />
              <div className="text-left">
                <h3 className="font-medium text-white glow">Управление компаниями</h3>
                <p className="text-sm text-slate-400">Создание и управление компаниями</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Citizens */}
        <Card variant="glass" className="floating-card neon-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white glow">Недавние граждане</CardTitle>
              <Button variant="outline" size="sm" className="depth-button">Показать всех</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Card variant="secondary" className="p-3 neon-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white glow">Иван Петров</p>
                    <p className="text-sm text-slate-400">ID: 123-45-6789</p>
                  </div>
                  <Button variant="outline" size="sm" className="depth-button">Просмотр</Button>
                </div>
              </Card>
              <Card variant="secondary" className="p-3 neon-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white glow">Мария Сидорова</p>
                    <p className="text-sm text-slate-400">ID: 987-65-4321</p>
                  </div>
                  <Button variant="outline" size="sm" className="depth-button">Просмотр</Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Recent Vehicles */}
        <Card variant="glass" className="floating-card neon-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white glow">Недавние Т/С</CardTitle>
              <Button variant="outline" size="sm" className="depth-button">Показать все</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Card variant="secondary" className="p-3 neon-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white glow">ABC123</p>
                    <p className="text-sm text-slate-400">Bravado Buffalo</p>
                  </div>
                  <Button variant="outline" size="sm" className="depth-button">Просмотр</Button>
                </div>
              </Card>
              <Card variant="secondary" className="p-3 neon-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white glow">XYZ789</p>
                    <p className="text-sm text-slate-400">Declasse Granger</p>
                  </div>
                  <Button variant="outline" size="sm" className="depth-button">Просмотр</Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Status */}
      <Card variant="digital" className="floating-card neon-glow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white glow">Статус департамента</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400 glow-success digital-flicker">12</p>
              <p className="text-sm text-slate-400">Активных граждан</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400 glow-primary digital-flicker">8</p>
              <p className="text-sm text-slate-400">Зарегистрированных Т/С</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400 glow digital-flicker">3</p>
              <p className="text-sm text-slate-400">Активных компаний</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400 glow-danger digital-flicker">5</p>
              <p className="text-sm text-slate-400">Вызовов 911 сегодня</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
