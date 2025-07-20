
import React, { useState, useEffect, useMemo } from 'react';
import { ReportTemplate } from '../types';
import { extractVariables } from '../utils/templateUtils';

interface TemplateEditorProps {
  template?: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
  setView: (view: { name: string }) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, setView }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setBody(template.body);
    }
  }, [template]);

  const usedVariables = useMemo(() => extractVariables(body), [body]);

  const handleSave = () => {
    if (!title.trim() || !body.trim()) {
      alert('Название и тело шаблона не могут быть пустыми.');
      return;
    }
    const newTemplate: ReportTemplate = {
      id: template?.id || `template_${Date.now()}`,
      title,
      body,
    };
    onSave(newTemplate);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-card border border-card-border rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-text-primary mb-6">РЕДАКТОР ШАБЛОНА</h2>
      
      <div className="mb-6">
        <label htmlFor="template-title" className="block text-sm font-medium text-text-secondary mb-2">Название рапорта:</label>
        <input
          id="template-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Рапорт об инциденте"
          className="w-full p-3 bg-background border border-card-border rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="template-body" className="block text-sm font-medium text-text-secondary mb-2">Тело шаблона:</label>
        <textarea
          id="template-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Используйте {{ПЕРЕМЕННЫЕ}} для создания полей ввода."
          rows={15}
          className="w-full p-3 bg-background border border-card-border rounded-md text-text-primary font-mono text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
        />
      </div>

      <div className="mb-6 p-4 bg-background rounded-md border border-card-border">
        <h4 className="text-sm font-medium text-text-secondary mb-2">Используемые переменные:</h4>
        {usedVariables.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {usedVariables.map(v => (
              <span key={v} className="px-2 py-1 bg-card text-text-secondary text-xs font-mono rounded-md">{v}</span>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm italic">Переменные не найдены. Пример: {'{{ИМЯ_ОФИЦЕРА}}'}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button onClick={() => setView({ name: 'admin' })} className="px-6 py-2 bg-card text-text-secondary font-semibold rounded-lg hover:bg-card-border transition-colors">Отмена</button>
        <button onClick={handleSave} className="px-8 py-2 bg-accent text-accent-text font-bold rounded-lg hover:bg-accent-hover transition-colors">СОХРАНИТЬ</button>
      </div>
    </div>
  );
};

export default TemplateEditor;
