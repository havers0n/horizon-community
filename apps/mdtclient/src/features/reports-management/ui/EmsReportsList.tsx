import React, { useState } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { Modal } from '@/shared/ui/atoms/Modal';
import { FileText, Eye, Edit, Trash2, Stethoscope, Flame, Calendar, MapPin, User, Plus } from 'lucide-react';
import type { EmsFdReports } from '@roleplay-identity/db-types';
import { useReportsStore } from '../model/store';

interface EmsReportsListProps {
  reports?: EmsFdReports[];
  onEdit?: (report: EmsFdReports) => void;
  onDelete?: (reportId: string) => void;
  onCreate?: () => void;
  maxItems?: number;
  showCreateButton?: boolean;
}

const ReportDetailsModal: React.FC<{ 
  report: EmsFdReports; 
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ report, onClose, onEdit, onDelete }) => {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Н/Д';
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
          {getReportTypeIcon(report.incident_type)}
          <div>
            <h3 className="text-lg font-semibold">{report.title}</h3>
            <p className="text-sm text-secondary-400">Создан {formatDateTime(report.created_at || '')}</p>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Автор: {report.author_character_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Место: {report.incident_location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Время: {formatDateTime(report.incident_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-secondary-400" />
            <span className="text-sm text-secondary-300">Тип: {report.incident_type}</span>
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
        {report.incident_type === 'medical' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-200">Медицинская информация</h4>
            
            {report.patients && (
              <div>
                <span className="text-sm font-medium text-secondary-300">Пациенты: </span>
                <span className="text-sm text-secondary-400">{typeof report.patients === 'string' ? report.patients : JSON.stringify(report.patients)}</span>
              </div>
            )}

            {report.treatment_provided && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Оказанное лечение</h5>
                <p className="text-sm text-secondary-400 bg-secondary-800 p-3 rounded-md">
                  {report.treatment_provided}
                </p>
              </div>
            )}

            {report.medications_administered && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-1">Медикаменты</h5>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const medications = typeof report.medications_administered === 'string' 
                        ? JSON.parse(report.medications_administered) 
                        : report.medications_administered;
                      return Array.isArray(medications) ? medications.map((med: any, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                          {med}
                        </span>
                      )) : <span className="text-sm text-secondary-400">Нет данных</span>;
                    } catch {
                      return <span className="text-sm text-secondary-400">Ошибка отображения</span>;
                    }
                  })()}
                </div>
              </div>
            )}

            {report.vital_signs && (
              <div>
                <h5 className="text-sm font-medium text-secondary-300 mb-2">Жизненные показатели</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary-800 p-3 rounded-md">
                  {(() => {
                    try {
                      const vitalSigns = typeof report.vital_signs === 'string' 
                        ? JSON.parse(report.vital_signs) 
                        : report.vital_signs;
                      return (
                        <>
                          <div>
                            <span className="text-xs text-secondary-400">Пульс</span>
                            <p className="text-sm font-medium">{vitalSigns.heartRate || vitalSigns.heart_rate || 'Н/Д'} уд/мин</p>
                          </div>
                          <div>
                            <span className="text-xs text-secondary-400">Давление</span>
                            <p className="text-sm font-medium">{vitalSigns.bloodPressure || vitalSigns.blood_pressure || 'Н/Д'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-secondary-400">Температура</span>
                            <p className="text-sm font-medium">{vitalSigns.temperature || 'Н/Д'}°C</p>
                          </div>
                          <div>
                            <span className="text-xs text-secondary-400">Сатурация</span>
                            <p className="text-sm font-medium">{vitalSigns.oxygenSaturation || vitalSigns.oxygen_saturation || 'Н/Д'}%</p>
                          </div>
                        </>
                      );
                    } catch {
                      return <span className="text-sm text-secondary-400">Ошибка отображения</span>;
                    }
                  })()}
                </div>
              </div>
            )}


          </div>
        )}

        {/* Пожарная информация */}
        {report.incident_type === 'fire' && report.fire_details && (
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-200">Пожарная информация</h4>
            
            {(() => {
              try {
                const fireDetails = typeof report.fire_details === 'string' 
                  ? JSON.parse(report.fire_details) 
                  : report.fire_details;
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-secondary-300">Тип конструкции: </span>
                        <span className="text-sm text-secondary-400">{fireDetails.structureType || fireDetails.structure_type || 'Н/Д'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-secondary-300">Место возникновения: </span>
                        <span className="text-sm text-secondary-400">{fireDetails.fireOrigin || fireDetails.fire_origin || 'Н/Д'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-secondary-300">Причина: </span>
                        <span className="text-sm text-secondary-400">{fireDetails.cause || 'Н/Д'}</span>
                      </div>
                    </div>

                    {fireDetails.damage && (
                      <div>
                        <h5 className="text-sm font-medium text-secondary-300 mb-1">Ущерб</h5>
                        <p className="text-sm text-secondary-400 bg-secondary-800 p-3 rounded-md">
                          {fireDetails.damage}
                        </p>
                      </div>
                    )}
                  </>
                );
              } catch {
                return <span className="text-sm text-secondary-400">Ошибка отображения пожарных деталей</span>;
              }
            })()}
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
  const [selectedReport, setSelectedReport] = useState<EmsFdReports | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  // Используем внешние отчеты или из store
  const reports = externalReports || storeReports;
  const displayReports = maxItems ? reports.slice(0, maxItems) : reports;

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const handleViewDetails = (report: EmsFdReports) => {
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

  const getOutcomeColor = (outcome: string | null) => {
    if (!outcome) return 'text-secondary-400';
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
                    {getReportTypeIcon(report.incident_type)}
                    <div>
                      <h3 className="font-semibold text-white">
                        {getReportTypeLabel(report.incident_type)} отчет
                      </h3>
                      <p className="text-sm text-secondary-400">
                        {report.incident_location} • {formatDateTime(report.incident_time)}
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
                    <span>Автор: {report.author_character_id}</span>
                    <span>Создан: {formatDateTime(report.created_at || '')}</span>
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
