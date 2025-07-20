
import React from 'react';
import { ReportTemplate } from '../types';

interface MainMenuProps {
  templates: ReportTemplate[];
  isAdmin: boolean;
  setView: (view: { name: string; templateId?: string }) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ templates, isAdmin, setView }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-4xl font-extrabold text-text-primary mb-10 tracking-widest">ЦЕНТР РАПОРТОВ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => setView({ name: 'filler', templateId: template.id })}
            className="group text-left p-6 bg-card border border-card-border rounded-lg shadow-lg hover:bg-opacity-80 hover:border-accent-hover transition-all duration-300"
          >
            <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-hover transition-colors">
              <span className="text-accent group-hover:text-accent-hover transition-colors mr-2">&gt;</span>
              {template.title}
            </h3>
          </button>
        ))}
      </div>
      {isAdmin && (
        <div className="text-center mt-12">
          <button
            onClick={() => setView({ name: 'admin' })}
            className="px-8 py-3 bg-accent text-accent-text font-bold rounded-lg hover:bg-accent-hover transition-colors shadow-md"
          >
            Управление шаблонами
          </button>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
