
import React from 'react';
import { ReportTemplate } from '../types';

interface AdminScreenProps {
  templates: ReportTemplate[];
  setView: (view: { name: string; templateId?: string }) => void;
  onDelete: (templateId: string) => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ templates, setView, onDelete }) => {
  
  const handleDelete = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if(window.confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      onDelete(templateId);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-text-primary tracking-wider">УПРАВЛЕНИЕ ШАБЛОНАМИ</h2>
        <div>
          <button
            onClick={() => setView({ name: 'main' })}
            className="px-4 py-2 bg-card text-text-secondary font-semibold rounded-lg hover:bg-card-border transition-colors mr-4"
          >
            Назад
          </button>
          <button
            onClick={() => setView({ name: 'editor', templateId: 'new' })}
            className="px-6 py-2 bg-accent text-accent-text font-bold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Создать новый
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {templates.map(template => (
          <div
            key={template.id}
            className="flex items-center justify-between p-4 bg-card border border-card-border rounded-lg cursor-pointer hover:border-accent-hover"
            onClick={() => setView({ name: 'editor', templateId: template.id })}
          >
            <span className="font-semibold text-text-primary">{template.title}</span>
            <button 
              onClick={(e) => handleDelete(e, template.id)}
              className="px-3 py-1 text-sm bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminScreen;
