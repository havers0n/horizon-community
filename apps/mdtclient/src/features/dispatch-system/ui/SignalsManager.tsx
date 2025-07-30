import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { Radio, Plus, Trash2, Edit, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface Signal {
  id: string;
  code: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  active: boolean;
  createdAt: Date;
  authorId: string;
}

interface SignalsManagerProps {
  onClose?: () => void;
}

const CreateSignalForm: React.FC<{ onSubmit: (signal: Omit<Signal, 'id' | 'createdAt' | 'authorId'>) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    active: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>{t('signals.createSignal')}</CardHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-200 mb-1">
                {t('signals.code')} *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-200 mb-1">
                {t('signals.priority')} *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                required
              >
                <option value="low">{t('signals.priorities.low')}</option>
                <option value="medium">{t('signals.priorities.medium')}</option>
                <option value="high">{t('signals.priorities.high')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-200 mb-1">
              {t('signals.category')} *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
              required
            >
              <option value="">{t('common.select')}</option>
              <option value="emergency">{t('signals.categories.emergency')}</option>
              <option value="traffic">{t('signals.categories.traffic')}</option>
              <option value="weather">{t('signals.categories.weather')}</option>
              <option value="general">{t('signals.categories.general')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-200 mb-1">
              {t('signals.description')} *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-secondary-200">
              {t('signals.active')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('signals.createSignal')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const ManageTones: React.FC = () => {
  const { t } = useLocale();
  const [tones] = useState([
    { id: '1', name: 'Emergency Tone', frequency: '440Hz', active: true },
    { id: '2', name: 'Traffic Alert', frequency: '880Hz', active: true },
    { id: '3', name: 'Weather Warning', frequency: '660Hz', active: false },
  ]);

  return (
    <Card>
      <CardHeader>{t('signals.manageTones')}</CardHeader>
      <div className="p-6">
        <div className="space-y-3">
          {tones.map(tone => (
            <div key={tone.id} className="flex items-center justify-between p-3 bg-secondary-800 rounded-lg">
              <div>
                <h4 className="font-medium text-white">{tone.name}</h4>
                <p className="text-sm text-secondary-400">{tone.frequency}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${tone.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-secondary-400">
                  {tone.active ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export const SignalsManager: React.FC<SignalsManagerProps> = ({ onClose }) => {
  const { t } = useLocale();
  const [signals, setSignals] = useState<Signal[]>([
    {
      id: '1',
      code: '10-4',
      description: 'Acknowledgment',
      priority: 'low',
      category: 'general',
      active: true,
      createdAt: new Date(),
      authorId: '1'
    },
    {
      id: '2',
      code: '10-20',
      description: 'Location',
      priority: 'medium',
      category: 'general',
      active: true,
      createdAt: new Date(),
      authorId: '1'
    },
    {
      id: '3',
      code: '10-97',
      description: 'Arrived at scene',
      priority: 'medium',
      category: 'emergency',
      active: true,
      createdAt: new Date(),
      authorId: '1'
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateSignal = (signalData: Omit<Signal, 'id' | 'createdAt' | 'authorId'>) => {
    const newSignal: Signal = {
      ...signalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      authorId: '1' // Mock user ID
    };
    setSignals(prev => [...prev, newSignal]);
    setShowCreateForm(false);
  };

  const handleRevokeSignal = (signalId: string) => {
    setSignals(prev => prev.map(signal => 
      signal.id === signalId ? { ...signal, active: false } : signal
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={16} />;
      case 'medium':
        return <Info size={16} />;
      case 'low':
        return <CheckCircle size={16} />;
      default:
        return <Radio size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t('signals.title')}</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          {t('signals.createSignal')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>{t('signals.activeSignals')}</CardHeader>
          <div className="p-6">
            <div className="space-y-3">
              {signals.filter(signal => signal.active).map(signal => (
                <div
                  key={signal.id}
                  className={`p-4 rounded-lg border ${getPriorityColor(signal.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getPriorityIcon(signal.priority)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{signal.code}</h4>
                          <span className="text-xs px-2 py-1 bg-secondary-700 rounded">
                            {signal.category}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-300">{signal.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSignal(signal.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <ManageTones />
      </div>

      {showCreateForm && (
        <CreateSignalForm
          onSubmit={handleCreateSignal}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};
