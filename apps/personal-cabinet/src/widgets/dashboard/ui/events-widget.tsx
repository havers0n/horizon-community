import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const EventsWidget: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Лента событий
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Закреплённое объявление */}
          <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/30 p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400" aria-hidden>📢</div>
              <div className="flex-1">
                <p className="text-sm text-gray-100">
                  Здесь будут отображаться важные объявления от администрации.
                </p>
              </div>
            </div>
          </div>

          {/* Персональные уведомления */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <div className="flex items-start gap-3">
              <div className="text-gray-300" aria-hidden>🔔</div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  Здесь будет отображаться история статусов ваших заявок.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


