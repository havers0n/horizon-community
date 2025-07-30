import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { Modal } from '@/shared/ui/atoms/Modal';
import { FileText, Eye, Edit, Trash2, Stethoscope, Flame, Calendar, MapPin, User, Plus } from 'lucide-react';
import { EmsReport } from '../model/types';
import { useReportsStore } from '../model/store';

interface EmsReportsListProps {
  reports?: EmsReport[];
  onEdit?: (report: EmsReport) => void;
  onDelete?: (reportId: string) => void;
  onCreate?: () => void;
  maxItems?: number;
  showCreateButton?: boolean;
}

const ReportDetailsModal: React.FC<{ 
  report: EmsReport; 
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ report, onClose, onEdit, onDelete }) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Stethoscope className="h-5 w-5 text-blue-400" />;
      case 'fire':
      case 'rescue':
        return <Flame className="h-5 w-5 text-red-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'medical':
        return 'Медицинский отчет';
      case 'fire':
        return 'Пожарный отчет';
      case 'rescue':
        return 'Спасательный отчет';
      default:
        return 'Отчет';
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Детали отчета">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-center gap-3 pb-4 border-b border-secondary-700">
          {getReportTypeIcon(report.type)}
          <div>
            <h3 className="text-lg font-semibold">{getReportTypeLabel(report.type)}</h3>
            <p className="text-sm text-secondary-400">Создан {formatDateTime(report.createdAt)}</p>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Автор: {report.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Место: {report.incidentLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Время: {formatDateTime(report.incidentTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Тип: {report.incidentType}</span>
          </div>
        </div>

        {/* Описание */}
        <div>
          <h4 className="font-semibold text-secondary-200 mb-2">Описание</h4>
          <p className="text-sm text-secondary-300 bg-secondary-800 p-3 rounded-md">
            {report.description}
          </p>
        </div>

        {/* Медицинская информация */}
        {report.type === 'medical' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-200">Медицинская информация</h4>
            
            {report.patientName && (
              <div>
                <span className="text-sm font-medium text-secondary-300">Пациент: </span>
                <span className="text-sm text-secondary-400">{report.patientName}</span>
              </div>
            )}

            {report.treatmentProvided && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Оказанное лечение</h5>
                <p className="text-sm text-secondary-400 bg-secondary-800 p-3 rounded-md">
                  {report.treatmentProvided}
                </p>
              </div>
            )}

            {report.medications && report.medications.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Медикаменты</h5>
                <div className="flex flex-wrap gap-2">
                  {report.medications.map((med, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report.vitalSigns && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-2">Жизненные показатели</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary-800 p-3 rounded-md">
                  <div>
                    <span className="text-xs text-secondary-400">Пульс</span>
                    <p className="text-sm font-medium">{report.vitalSigns.heartRate} уд/мин</p>
                  </div>
                  <div>
                    <span className="text-xs text-secondary-400">Давление</span>
                    <p className="text-sm font-medium">{report.vitalSigns.bloodPressure}</p>
                  </div>
                  <div>
                    <span className="text-xs text-secondary-400">Температура</span>
                    <p className="text-sm font-medium">{report.vitalSigns.temperature}°C</p>
                  </div>
                  <div>
                    <span className="text-xs text-secondary-400">Сатурация</span>
                    <p className="text-sm font-medium">{report.vitalSigns.oxygenSaturation}%</p>
                  </div>
                </div>
              </div>
            )}

            {report.disposition && (
              <div>
                <span className="text-sm font-medium text-secondary-300">Расположение: </span>
                <span className="text-sm text-secondary-400">{report.disposition}</span>
              </div>
            )}
          </div>
        )}

        {/* Пожарная информация */}
        {report.type === 'fire' && report.fireDetails && (
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-200">Пожарная информация</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-secondary-300">Тип конструкции: </span>
                <span className="text-sm text-secondary-400">{report.fireDetails.structureType}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-300">Место возникновения: </span>
                <span className="text-sm text-secondary-400">{report.fireDetails.fireOrigin}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-300">Причина: </span>
                <span className="text-sm text-secondary-400">{report.fireDetails.cause}</span>
              </div>
            </div>

            {report.fireDetails.damage && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Ущерб</h5>
                <p className="text-sm text-secondary-400 bg-secondary-800 p-3 rounded-md">
                  {report.fireDetails.damage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Исход */}
        <div>
          <h4 className="font-semibold text-secondary-200 mb-2">Исход</h4>
          <p className="text-sm text-secondary-300 bg-secondary-800 p-3 rounded-md">
            {report.outcome}
          </p>
        </div>

        {/* Действия */}
        <div className="flex gap-2 pt-4 border-t border-secondary-700">
          {onEdit && (
            <Button onClick={onEdit} variant="secondary" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="danger" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const EmsReportsList: React.FC<EmsReportsListProps> = ({
  reports: externalReports,
  onEdit,
  onDelete,
  onCreate,
  maxItems,
  showCreateButton = true
}) => {
  const { reports: storeReports, deleteReport } = useReportsStore();
  const [selectedReport, setSelectedReport] = useState<EmsReport | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  // Используем внешние отчеты или из store
  const reports = externalReports || storeReports;
  const displayReports = maxItems ? reports.slice(0, maxItems) : reports;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const handleViewDetails = (report: EmsReport) => {
    setSelectedReport(report);
    setViewMode('details');
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
    setViewMode('list');
  };

  const handleEditReport = () => {
    if (selectedReport && onEdit) {
      onEdit(selectedReport);
    }
    handleCloseDetails();
  };

  const handleDeleteReport = () => {
    if (selectedReport) {
      if (onDelete) {
        onDelete(selectedReport.id);
      } else {
        deleteReport(selectedReport.id);
      }
    }
    handleCloseDetails();
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Stethoscope className="h-4 w-4 text-blue-400" />;
      case 'fire':
      case 'rescue':
        return <Flame className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'medical':
        return 'Медицинский';
      case 'fire':
        return 'Пожарный';
      case 'rescue':
        return 'Спасательный';
      default:
        return 'Отчет';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'stable':
      case 'contained':
      case 'extinguished':
        return 'text-green-400';
      case 'critical':
      case 'spreading':
        return 'text-red-400';
      case 'controlled':
        return 'text-yellow-400';
      default:
        return 'text-secondary-400';
    }
  };

  if (viewMode === 'details' && selectedReport) {
    return (
      <ReportDetailsModal
        report={selectedReport}
        onClose={handleCloseDetails}
        onEdit={onEdit ? handleEditReport : undefined}
        onDelete={onDelete ? handleDeleteReport : undefined}
      />
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Отчеты EMS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-400">
              {reports.length} отчетов
            </span>
            {showCreateButton && onCreate && (
              <Button onClick={onCreate} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Создать
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          {displayReports.length > 0 ? (
            displayReports.map(report => (
              <div 
                key={report.id} 
                className="p-4 bg-secondary-800 rounded-lg border border-secondary-700 hover:bg-secondary-800/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(report)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getReportTypeIcon(report.type)}
                    <div>
                      <h3 className="font-semibold text-white">
                        {getReportTypeLabel(report.type)} отчет
                      </h3>
                      <p className="text-sm text-secondary-400">
                        {report.incidentLocation} • {formatDateTime(report.incidentTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getOutcomeColor(report.outcome)}`}>
                      {report.outcome}
                    </span>
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-secondary-300 line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-secondary-500">
                    <span>Автор: {report.author}</span>
                    <span>Создан: {formatDateTime(report.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-secondary-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет отчетов для отображения</p>
              <p className="text-sm mt-1">
                Создайте медицинский отчет для начала работы
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 
