
import React, { useState, useMemo } from 'react';
import { ReportTemplate } from '../types';
import { extractVariables, renderPreview } from '../utils/templateUtils';

interface ReportFillerProps {
  template: ReportTemplate;
  setView: (view: { name: string }) => void;
}

const ReportFiller: React.FC<ReportFillerProps> = ({ template, setView }) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const variables = useMemo(() => extractVariables(template.body), [template.body]);
  const previewText = useMemo(() => renderPreview(template.body, fieldValues), [template.body, fieldValues]);

  const handleInputChange = (variable: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [variable]: value }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  const getInputType = (variableName: string) => {
    const lowerVar = variableName.toLowerCase();
    if (lowerVar.includes('дата')) return 'date';
    if (lowerVar.includes('время')) return 'time';
    return 'text';
  }

  return (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-wider uppercase">ЗАПОЛНЕНИЕ: {template.title}</h2>
        <button
            onClick={() => setView({ name: 'main' })}
            className="px-6 py-2 bg-card text-text-secondary font-semibold rounded-lg hover:bg-card-border transition-colors"
          >
            К главному меню
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Inputs */}
        <div className="p-6 bg-card border border-card-border rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-text-primary mb-6">Поля для ввода</h3>
          <div className="space-y-4">
            {variables.map(variable => (
              <div key={variable}>
                <label className="block text-sm font-medium text-text-secondary mb-1">{variable}:</label>
                {variable.toLowerCase().includes('описание') || variable.toLowerCase().includes('обстоятельства') ? (
                   <textarea
                    value={fieldValues[variable] || ''}
                    onChange={(e) => handleInputChange(variable, e.target.value)}
                    rows={4}
                    className="w-full p-2 bg-background border border-card-border rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                  />
                ) : (
                  <input
                    type={getInputType(variable)}
                    value={fieldValues[variable] || ''}
                    onChange={(e) => handleInputChange(variable, e.target.value)}
                    className="w-full p-2 bg-background border border-card-border rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="p-6 bg-card border border-card-border rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-text-primary mb-6">Предпросмотр</h3>
          <pre className="whitespace-pre-wrap font-mono text-sm text-text-primary bg-background p-4 rounded-md h-[calc(100%-120px)] overflow-y-auto">
            {previewText}
          </pre>
          <div className="mt-6 flex space-x-4">
            <button
                onClick={handleCopy}
                className="w-full px-6 py-3 bg-accent text-accent-text font-bold rounded-lg hover:bg-accent-hover transition-colors"
              >
                {copyStatus === 'idle' ? 'Скопировать текст' : 'Скопировано!'}
            </button>
            <button
                onClick={() => alert('Рапорт отправлен (симуляция)')}
                className="w-full px-6 py-3 bg-accent/80 text-accent-text font-bold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Отправить рапорт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFiller;
