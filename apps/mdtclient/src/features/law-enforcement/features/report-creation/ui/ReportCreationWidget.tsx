import React, { useState } from 'react';
import { FileText, Save, Send, Plus, Trash2 } from 'lucide-react';
import { useReportCreationStore } from '../model/store';
import { Button, Card, CardHeader, Input, Textarea } from '@/shared/ui/atoms';

export const ReportCreationWidget: React.FC = () => {
  const { t } = useLocale();
  const { 
    showForm, 
    isLoading, 
    error,
    setShowForm, 
    clearError 
  } = useReportCreationStore();

  const handleCreateReport = (report: any) => {
    // Обработка создания отчета
    console.log('Создание отчета:', report);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Составить отчет</h2>
        <Button onClick={() => setShowForm(true)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Новый отчет
        </Button>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600/50 text-red-300 p-3 rounded-md">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      <Card>
        <CardHeader>Инструкция по составлению отчета</CardHeader>
        <div className="p-6">
          <p className="text-secondary-300 mb-4">
            Для составления отчета нажмите кнопку "Новый отчет". Форма состоит из двух страниц:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary-700 p-4 rounded-md">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Страница 1 - Основная информация
              </h4>
              <ul className="text-sm text-secondary-300 space-y-1">
                <li>• Имя гражданского</li>
                <li>• Адрес инцидента</li>
                <li>• Время инцидента</li>
                <li>• Тип инцидента</li>
                <li>• Статья</li>
                <li>• Тип санкции</li>
                <li>• Описание ситуации</li>
              </ul>
            </div>
            <div className="bg-secondary-700 p-4 rounded-md">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Страница 2 - Дополнительная информация
              </h4>
              <ul className="text-sm text-secondary-300 space-y-1">
                <li>• Транспорт подозреваемого</li>
                <li>• Изъятые вещи</li>
                <li>• Оружие подозреваемого</li>
                <li>• Дополнительные флаги</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {showForm && (
        <LawReportForm
          onSubmit={handleCreateReport}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
