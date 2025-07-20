
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ReportTemplate } from './types';
import { DEFAULT_TEMPLATES } from './constants';
import MainMenu from './screens/MainMenu';
import AdminScreen from './screens/AdminScreen';
import TemplateEditor from './screens/TemplateEditor';
import ReportFiller from './screens/ReportFiller';
import ThemeToggle from './components/ThemeToggle';

type View =
  | { name: 'main' }
  | { name: 'admin' }
  | { name: 'editor'; templateId: string | 'new' }
  | { name: 'filler'; templateId: string };

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  const [isAdmin, setIsAdmin] = useLocalStorage<boolean>('isAdmin', true);
  const [templates, setTemplates] = useLocalStorage<ReportTemplate[]>('reportTemplates', DEFAULT_TEMPLATES);
  const [view, setView] = useState<View>({ name: 'main' });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleSaveTemplate = (template: ReportTemplate) => {
    setTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [...prev, template];
    });
    setView({ name: 'admin' });
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }

  const renderView = () => {
    switch (view.name) {
      case 'main':
        return <MainMenu templates={templates} isAdmin={isAdmin} setView={setView} />;
      case 'admin':
        return <AdminScreen templates={templates} setView={setView} onDelete={handleDeleteTemplate} />;
      case 'editor':
        const templateToEdit = templates.find(t => t.id === view.templateId);
        return <TemplateEditor template={templateToEdit} onSave={handleSaveTemplate} setView={setView} />;
      case 'filler':
        const templateToFill = templates.find(t => t.id === view.templateId);
        if (!templateToFill) {
            setView({name: 'main'});
            return null;
        }
        return <ReportFiller template={templateToFill} setView={setView} />;
      default:
        return <MainMenu templates={templates} isAdmin={isAdmin} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans p-4 sm:p-6 lg:p-8 text-text-primary">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-wider uppercase cursor-pointer" onClick={() => setView({name: 'main'})}>
          ЕДИНАЯ СИСТЕМА УЧЕТА
        </h1>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </header>
      <main>
        {renderView()}
      </main>
      <footer className="fixed bottom-4 right-4">
        <label className="flex items-center space-x-2 cursor-pointer text-text-secondary">
          <input 
            type="checkbox" 
            checked={isAdmin} 
            onChange={() => setIsAdmin(prev => !prev)}
            className="form-checkbox h-5 w-5 rounded bg-card text-accent border-card-border focus:ring-accent"
          />
          <span>Режим Администратора</span>
        </label>
      </footer>
    </div>
  );
};

export default App;
