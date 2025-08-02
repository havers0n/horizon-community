import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';

interface MDTViewProps {
  subView: string;
}

export const MDTView: React.FC<MDTViewProps> = ({ subView }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">MDT Система</h1>
        <p className="text-slate-400">
          Доступ к базе данных правоохранительных органов
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">MDT View</h2>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Подраздел: {subView || 'dashboard'}
          </p>
          <p className="text-slate-400 mt-2">
            Компонент MDT системы находится в разработке
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 