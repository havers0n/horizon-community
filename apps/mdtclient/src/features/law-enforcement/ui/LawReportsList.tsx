// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Card, CardHeader, Button, Modal } from '../../../shared/ui/atoms';
import { DataTable } from '../../../shared/ui/molecules';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import type { LawReport } from '@/shared/types';

interface LawReportsListProps {
  reports: LawReport[];
  onDelete?: (reportId: string) => void;
  onEdit?: (report: LawReport) => void;
}

const LawReportDetailsModal: React.FC<{ report: LawReport; onClose: () => void }> = ({ report, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSanctionTypeLabel = (type: string) => {
    switch (type) {
      case 'warning': return 'Предупреждение';
      case 'arrest': return 'Арест';
      case 'fine': return 'Штраф';
      default: return type;
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Детали отчета">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Гражданский:</strong> {report.citizenName}</p>
            <p><strong>Адрес инцидента:</strong> {report.incidentAddress}</p>
            <p><strong>Время инцидента:</strong> {formatDate(report.incidentTime)}</p>
            <p><strong>Тип инцидента:</strong> {report.incidentType}</p>
            <p><strong>Статья:</strong> {report.penalCode}</p>
            <p><strong>Тип санкции:</strong> {getSanctionTypeLabel(report.sanctionType)}</p>
          </div>
          <div>
            <p><strong>Автор:</strong> {report.author}</p>
            <p><strong>Дата создания:</strong> {formatDate(report.createdAt)}</p>
            <p><strong>Описание:</strong></p>
            <p className="text-secondary-400 bg-secondary-800 p-2 rounded">{report.description}</p>
          </div>
        </div>

        {report.seizedItems.length > 0 && (
          <div>
            <p><strong>Изъятые вещи:</strong></p>
            <ul className="list-disc list-inside text-secondary-400">
              {report.seizedItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {report.suspectVehicle && (
          <div>
            <p><strong>Транспорт подозреваемого:</strong></p>
            <div className="bg-secondary-800 p-3 rounded">
              <p>Номерной знак: {report.suspectVehicle.plate || 'Не указан'}</p>
              <p>Модель: {report.suspectVehicle.model || 'Не указана'}</p>
              <p>Цвет: {report.suspectVehicle.color || 'Не указан'}</p>
              <p>Эвакуирован: {report.suspectVehicle.isImpounded ? 'Да' : 'Нет'}</p>
              <p>Угнанное ТС: {report.suspectVehicle.isStolen ? 'Да' : 'Нет'}</p>
            </div>
          </div>
        )}

        {report.suspectWeapon && (
          <div>
            <p><strong>Оружие подозреваемого:</strong></p>
            <div className="bg-secondary-800 p-3 rounded">
              <p>Серийный номер: {report.suspectWeapon.serialNumber || 'Не указан'}</p>
              <p>Модель: {report.suspectWeapon.model || 'Не указана'}</p>
              <p>Тип: {report.suspectWeapon.type || 'Не указан'}</p>
              <p>Имеет серийный номер: {report.suspectWeapon.hasSerialNumber ? 'Да' : 'Нет'}</p>
              <p>Зарегистрировано: {report.suspectWeapon.isRegistered ? 'Да' : 'Нет'}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </Modal>
  );
};

export const LawReportsList: React.FC<LawReportsListProps> = ({ reports, onDelete, onEdit }) => {
  const { t } = useLocale();
  const [selectedReport, setSelectedReport] = useState<LawReport | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSanctionTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-600';
      case 'arrest': return 'bg-red-600';
      case 'fine': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getSanctionTypeLabel = (type: string) => {
    switch (type) {
      case 'warning': return 'Предупреждение';
      case 'arrest': return 'Арест';
      case 'fine': return 'Штраф';
      default: return type;
    }
  };

  const reportColumns = [
    { key: 'citizenName', header: 'Гражданский' },
    { key: 'incidentType', header: 'Тип инцидента' },
    { key: 'penalCode', header: 'Статья' },
    { key: 'sanctionType', header: 'Санкция', render: (value: string) => (
      <span className={`px-2 py-1 rounded text-xs ${getSanctionTypeColor(value)}`}>
        {getSanctionTypeLabel(value)}
      </span>
    )},
    { key: 'createdAt', header: 'Дата создания', render: (value: string) => formatDate(value) },
    { key: 'author', header: 'Автор' },
    { key: 'actions', header: 'Действия', render: (value: any, row: LawReport) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSelectedReport(row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        {onEdit && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Отчеты ({reports.length})</span>
            </div>
          </div>
        </CardHeader>
        <div className="p-6">
          {reports.length > 0 ? (
            <DataTable 
              columns={reportColumns}
              data={reports}
            />
          ) : (
            <div className="text-center py-8 text-secondary-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет доступных отчетов</p>
            </div>
          )}
        </div>
      </Card>

      {selectedReport && (
        <LawReportDetailsModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};
