import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Modal } from '@/shared/ui/atoms/Modal';
import { Input } from '@/shared/ui/atoms/Input';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { FileText, PlusCircle, Search, ArrowLeft, Eye, Edit, Trash2 } from 'lucide-react';

// Типы для отчетов
interface MDTReport {
  id: string;
  title: string;
  author: string;
  timestamp: string;
  type: ReportType;
  content: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

interface ReportTemplate {
  type: ReportType;
  title: string;
  content: string;
}

type ReportType = 'incident' | 'arrest' | 'traffic' | 'investigation' | 'general';

interface ReportsPortalProps {
  reports: MDTReport[];
  reportTypeName: string;
  onReportCreate?: (report: MDTReport) => void;
  onReportUpdate?: (report: MDTReport) => void;
  onReportDelete?: (reportId: string) => void;
}

// Шаблоны отчетов
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    type: 'incident',
    title: 'Отчет об инциденте',
    content: 'Описание инцидента:\n\nМесто происшествия:\n\nВремя:\n\nУчастники:\n\nДействия:\n\nРезультат:'
  },
  {
    type: 'arrest',
    title: 'Отчет об аресте',
    content: 'Подозреваемый:\n\nПричина ареста:\n\nМесто ареста:\n\nВремя:\n\nОбнаруженные улики:\n\nДополнительная информация:'
  },
  {
    type: 'traffic',
    title: 'Дорожный инцидент',
    content: 'Тип нарушения:\n\nМесто:\n\nВремя:\n\nУчастники:\n\nТранспортные средства:\n\nНарушения:\n\nШтрафы:'
  },
  {
    type: 'investigation',
    title: 'Отчет о расследовании',
    content: 'Предмет расследования:\n\nНачало расследования:\n\nСобранные улики:\n\nСвидетели:\n\nВыводы:\n\nРекомендации:'
  },
  {
    type: 'general',
    title: 'Общий отчет',
    content: 'Тема:\n\nОписание:\n\nДетали:\n\nЗаключение:'
  }
];

// Компонент создания отчета
const ReportCreator: React.FC<{
  allowedTypes: ReportType[];
  onSave: (newReport: MDTReport) => void;
  onClose: () => void;
}> = ({ allowedTypes, onSave, onClose }) => {
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '' as ReportType
  });

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      title: template.title,
      type: template.type
    }));
    setStep('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: MDTReport = {
      id: `rep_${Date.now()}`,
      title: formData.title,
      author: 'Current User', // TODO: Get from auth context
      timestamp: new Date().toISOString(),
      type: formData.type,
      content: formData.content,
      status: 'draft'
    };
    onSave(newReport);
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('template');
      setSelectedTemplate(null);
    } else {
      onClose();
    }
  };

  if (step === 'template') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="secondary" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h3 className="text-lg font-semibold text-white">Выберите шаблон</h3>
        </div>
        <div className="grid gap-4">
          {REPORT_TEMPLATES.filter(template => allowedTypes.includes(template.type)).map(template => (
            <div 
              key={template.type} 
              className="p-4 border border-secondary-600 rounded-md hover:bg-secondary-800 cursor-pointer transition-colors" 
              onClick={() => handleSelectTemplate(template)}
            >
              <h4 className="font-semibold text-white mb-2">{template.title}</h4>
              <p className="text-sm text-secondary-400">{template.content.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="secondary" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <h3 className="text-lg font-semibold text-white">Создание рапорта</h3>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Название</label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary-300 mb-1">Содержание</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 min-h-[200px] resize-vertical"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" variant="primary">
          <FileText className="mr-2 h-4 w-4" />
          Создать отчет
        </Button>
      </div>
    </form>
  );
};

// Компонент просмотра отчета
const ReportViewer: React.FC<{
  report: MDTReport;
  onClose: () => void;
  onEdit?: (report: MDTReport) => void;
  onDelete?: (reportId: string) => void;
}> = ({ report, onClose, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h3 className="text-lg font-semibold text-white">{report.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(report)}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(report.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="text-secondary-400">Автор:</span>
            <p className="text-white">{report.author}</p>
          </div>
          <div>
            <span className="text-secondary-400">Тип:</span>
            <p className="text-white capitalize">{report.type}</p>
          </div>
          <div>
            <span className="text-secondary-400">Дата:</span>
            <p className="text-white">{new Date(report.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="border-t border-secondary-700 pt-4">
          <h4 className="font-semibold text-white mb-2">Содержание:</h4>
          <div className="text-secondary-300 whitespace-pre-wrap">{report.content}</div>
        </div>
      </div>
    </div>
  );
};

export const ReportsPortal: React.FC<ReportsPortalProps> = ({ 
  reports, 
  reportTypeName,
  onReportCreate,
  onReportUpdate,
  onReportDelete
}) => {
  const { t } = useLocale();
  const [localReports, setLocalReports] = useState<MDTReport[]>(reports);
  const [selectedReport, setSelectedReport] = useState<MDTReport | null>(reports[0] ?? null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    setLocalReports(reports);
    setSelectedReport(reports[0] ?? null);
  }, [reports]);

  const allowedTypes = useMemo(() => {
    return [...new Set(reports.map(r => r.type))] as ReportType[];
  }, [reports]);

  const filteredReports = useMemo(() => {
    let sortedReports = [...localReports].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (!searchTerm) {
      return sortedReports;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return sortedReports.filter(rep =>
      rep.title.toLowerCase().includes(lowercasedTerm) ||
      rep.author.toLowerCase().includes(lowercasedTerm) ||
      rep.content.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, localReports]);
  
  useEffect(() => {
    if (filteredReports.length > 0 && !filteredReports.find(r => r.id === selectedReport?.id)) {
      setSelectedReport(filteredReports[0]);
    } else if (filteredReports.length === 0) {
      setSelectedReport(null);
    }
  }, [filteredReports, selectedReport]);

  const handleReportSave = (newReport: MDTReport) => {
    setLocalReports(prev => [newReport, ...prev]);
    setSelectedReport(newReport);
    setIsCreateModalOpen(false);
    onReportCreate?.(newReport);
  };

  const handleReportEdit = (report: MDTReport) => {
    // TODO: Implement edit functionality
    console.log('Edit report:', report);
  };

  const handleReportDelete = (reportId: string) => {
    setLocalReports(prev => prev.filter(r => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(filteredReports[1] ?? null);
    }
    onReportDelete?.(reportId);
  };

  const handleViewReport = (report: MDTReport) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{reportTypeName}</h2>
          <p className="text-secondary-400">Управление отчетами и документацией</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Создать отчет
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
        <Input
          type="text"
          placeholder="Поиск по отчетам..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Список отчетов */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Список отчетов</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-800 hover:bg-secondary-700 text-secondary-300'
                      }`}
                      onClick={() => handleViewReport(report)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{report.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'approved' ? 'bg-green-600' :
                          report.status === 'rejected' ? 'bg-red-600' :
                          report.status === 'submitted' ? 'bg-yellow-600' : 'bg-secondary-600'
                        } text-white`}>
                          {report.status || 'draft'}
                        </span>
                      </div>
                      <div className="text-xs opacity-75">
                        <div>{report.author}</div>
                        <div>{new Date(report.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Отчеты не найдены</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Предварительный просмотр */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Предварительный просмотр</h3>
            </CardHeader>
            <CardContent>
              {selectedReport ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold text-white">{selectedReport.title}</h4>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleViewReport(selectedReport)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Полный просмотр
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-secondary-400">
                    <div>Автор: {selectedReport.author}</div>
                    <div>Дата: {new Date(selectedReport.timestamp).toLocaleString()}</div>
                    <div>Тип: {selectedReport.type}</div>
                  </div>
                  <div className="border-t border-secondary-700 pt-4">
                    <p className="text-secondary-300 line-clamp-6">
                      {selectedReport.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Выберите отчет для просмотра</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальные окна */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Создание отчета"
        size="lg"
      >
        <ReportCreator
          allowedTypes={allowedTypes}
          onSave={handleReportSave}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedReport?.title || 'Просмотр отчета'}
        size="xl"
      >
        {selectedReport && (
          <ReportViewer
            report={selectedReport}
            onClose={() => setIsViewModalOpen(false)}
            onEdit={handleReportEdit}
            onDelete={handleReportDelete}
          />
        )}
      </Modal>
    </div>
  );
};
