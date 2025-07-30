import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button, Modal } from '@/shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { 
  Palette, 
  Settings, 
  Eye, 
  EyeOff, 
  Download, 
  Upload,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Monitor as MonitorIcon,
  Trash2
} from 'lucide-react';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

interface DispatchThemeManagerProps {
  onClose?: () => void;
}

const DefaultThemes: ThemeConfig[] = [
  {
    id: 'dark-classic',
    name: 'Темная классика',
    description: 'Стандартная темная тема для диспетчерского модуля',
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Roboto Mono',
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: '0.5rem',
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'light-modern',
    name: 'Светлая современная',
    description: 'Современная светлая тема с акцентом на читаемость',
    colors: {
      primary: '#2563EB',
      secondary: '#64748B',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB'
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Roboto Mono',
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: '0.75rem',
    shadows: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'high-contrast',
    name: 'Высокий контраст',
    description: 'Тема с высоким контрастом для лучшей видимости',
    colors: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      accent: '#FFFF00',
      background: '#000000',
      surface: '#1A1A1A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333',
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
      info: '#00FFFF'
    },
    fonts: {
      primary: 'Arial',
      secondary: 'Courier New',
      size: {
        xs: '0.875rem',
        sm: '1rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem'
      }
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1.25rem',
      lg: '1.75rem',
      xl: '2.5rem'
    },
    borderRadius: '0.25rem',
    shadows: {
      sm: '0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      md: '0 6px 8px -2px rgba(255, 255, 255, 0.1)',
      lg: '0 12px 16px -4px rgba(255, 255, 255, 0.1)'
    }
  }
];

export const DispatchThemeManager: React.FC<DispatchThemeManagerProps> = ({ onClose }) => {
  const { t } = useLocale();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('dispatch-theme');
    if (saved) {
      return JSON.parse(saved);
    }
    return DefaultThemes[0];
  });

  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(() => {
    const saved = localStorage.getItem('dispatch-custom-themes');
    return saved ? JSON.parse(saved) : [];
  });

  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Применяем тему к документу
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Сохраняем темы в localStorage
  useEffect(() => {
    localStorage.setItem('dispatch-theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('dispatch-custom-themes', JSON.stringify(customThemes));
  }, [customThemes]);

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Применяем цвета
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Применяем шрифты
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);
    Object.entries(theme.fonts.size).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Применяем отступы
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Применяем другие свойства
    root.style.setProperty('--border-radius', theme.borderRadius);
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  };

  const createCustomTheme = () => {
    const newTheme: ThemeConfig = {
      id: `custom_${Date.now()}`,
      name: 'Новая тема',
      description: 'Пользовательская тема',
      colors: { ...currentTheme.colors },
      fonts: { ...currentTheme.fonts },
      spacing: { ...currentTheme.spacing },
      borderRadius: currentTheme.borderRadius,
      shadows: { ...currentTheme.shadows }
    };
    setEditingTheme(newTheme);
    setShowThemeEditor(true);
  };

  const saveCustomTheme = (theme: ThemeConfig) => {
    if (editingTheme?.id.startsWith('custom_')) {
      // Обновляем существующую тему
      setCustomThemes(customThemes.map(t => t.id === theme.id ? theme : t));
    } else {
      // Добавляем новую тему
      setCustomThemes([...customThemes, theme]);
    }
    setShowThemeEditor(false);
    setEditingTheme(null);
  };

  const deleteCustomTheme = (themeId: string) => {
    setCustomThemes(customThemes.filter(t => t.id !== themeId));
  };

  const exportTheme = (theme: ThemeConfig) => {
    const data = JSON.stringify(theme, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const theme = JSON.parse(e.target?.result as string);
            setCustomThemes([...customThemes, theme]);
          } catch (error) {
            alert('Ошибка при импорте темы');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetToDefault = () => {
    setCurrentTheme(DefaultThemes[0]);
    setCustomThemes([]);
    localStorage.removeItem('dispatch-custom-themes');
  };

  const allThemes = [...DefaultThemes, ...customThemes];

  return (
    <div className="space-y-6">
      {/* Панель управления */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Управление темами</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPreviewMode('desktop')}
            variant={previewMode === 'desktop' ? 'primary' : 'secondary'}
            size="sm"
          >
            <MonitorIcon size={16} />
          </Button>
          <Button
            onClick={() => setPreviewMode('tablet')}
            variant={previewMode === 'tablet' ? 'primary' : 'secondary'}
            size="sm"
          >
            <Tablet size={16} />
          </Button>
          <Button
            onClick={() => setPreviewMode('mobile')}
            variant={previewMode === 'mobile' ? 'primary' : 'secondary'}
            size="sm"
          >
            <Smartphone size={16} />
          </Button>
        </div>
      </div>

      {/* Выбор темы */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allThemes.map(theme => (
          <Card key={theme.id} className="cursor-pointer hover:border-primary-500 transition-colors">
            <div 
              className="p-4"
              onClick={() => setCurrentTheme(theme)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{theme.name}</h4>
                {currentTheme.id === theme.id && (
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                )}
              </div>
              <p className="text-sm text-secondary-400 mb-3">{theme.description}</p>
              
              {/* Превью цветов */}
              <div className="flex gap-1 mb-3">
                <div 
                  className="w-6 h-6 rounded border border-secondary-600"
                  style={{ backgroundColor: theme.colors.primary }}
                ></div>
                <div 
                  className="w-6 h-6 rounded border border-secondary-600"
                  style={{ backgroundColor: theme.colors.accent }}
                ></div>
                <div 
                  className="w-6 h-6 rounded border border-secondary-600"
                  style={{ backgroundColor: theme.colors.success }}
                ></div>
                <div 
                  className="w-6 h-6 rounded border border-secondary-600"
                  style={{ backgroundColor: theme.colors.error }}
                ></div>
              </div>

              {/* Действия */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTheme(theme);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Применить
                </Button>
                {theme.id.startsWith('custom_') && (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTheme(theme);
                        setShowThemeEditor(true);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <Settings size={12} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomTheme(theme.id);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </>
                )}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportTheme(theme);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <Download size={12} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Действия с темами */}
      <div className="flex items-center gap-4">
        <Button
          onClick={createCustomTheme}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Palette size={16} />
          Создать тему
        </Button>
        <Button
          onClick={importTheme}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Импорт
        </Button>
        <Button
          onClick={resetToDefault}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Settings size={16} />
          Сбросить
        </Button>
      </div>

      {/* Превью темы */}
      <Card>
        <CardHeader>Превью темы</CardHeader>
        <div className="p-4">
          <div 
            className={`border border-secondary-700 rounded-lg overflow-hidden ${
              previewMode === 'tablet' ? 'max-w-md mx-auto' :
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            }`}
          >
            <div className="bg-secondary-800 p-4 border-b border-secondary-700">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Превью интерфейса</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm">Основная кнопка</Button>
                <Button variant="secondary" size="sm">Вторичная</Button>
                <Button variant="secondary" size="sm">Контурная</Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary-800 rounded border border-secondary-700">
                  <div className="text-sm font-semibold">Карточка</div>
                  <div className="text-xs text-secondary-400">Пример содержимого</div>
                </div>
                <div className="p-3 bg-secondary-800 rounded border border-secondary-700">
                  <div className="text-sm font-semibold">Карточка</div>
                  <div className="text-xs text-secondary-400">Пример содержимого</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Редактор темы */}
      {showThemeEditor && editingTheme && (
        <Modal isOpen={showThemeEditor} onClose={() => setShowThemeEditor(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Редактирование темы</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название</label>
                <input
                  type="text"
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({...editingTheme, name: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-600 rounded-md bg-secondary-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={editingTheme.description}
                  onChange={(e) => setEditingTheme({...editingTheme, description: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-600 rounded-md bg-secondary-700 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Основной цвет</label>
                  <input
                    type="color"
                    value={editingTheme.colors.primary}
                    onChange={(e) => setEditingTheme({
                      ...editingTheme, 
                      colors: {...editingTheme.colors, primary: e.target.value}
                    })}
                    className="w-full h-10 border border-secondary-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Акцентный цвет</label>
                  <input
                    type="color"
                    value={editingTheme.colors.accent}
                    onChange={(e) => setEditingTheme({
                      ...editingTheme, 
                      colors: {...editingTheme.colors, accent: e.target.value}
                    })}
                    className="w-full h-10 border border-secondary-600 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button
                onClick={() => saveCustomTheme(editingTheme)}
                variant="primary"
              >
                Сохранить
              </Button>
              <Button
                onClick={() => setShowThemeEditor(false)}
                variant="secondary"
              >
                Отмена
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
