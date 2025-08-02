import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';

interface ReferenceViewProps {
  subView: string;
}

export const ReferenceView: React.FC<ReferenceViewProps> = ({ subView }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Справочная информация</h1>
        <p className="text-slate-400">
          Полезные ссылки и документация
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Reference View</h2>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Подраздел: {subView || 'general'}
          </p>
          <p className="text-slate-400 mt-2">
            Справочная система находится в разработке
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 