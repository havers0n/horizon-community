import React, { useState } from 'react';
import { Card, CardHeader, Button, Modal } from '../../../shared/ui/atoms';
import { DataTable } from '../../../shared/ui/molecules';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import type { LawReports, Json } from '@roleplay-identity/db-types';

interface LawReportsListProps {
  reports: LawReports[];
  onDelete?: (reportId: string) => void;
  onEdit?: (report: LawReports) => void;
}

const LawReportDetailsModal: React.FC<{ report: LawReports; onClose: () => void }> = ({ report, onClose }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatJsonField = (value: Json | null, fieldName: string) => {
    if (!value) return 'Не указано';
    
    try {
      if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        return (
          <div className="bg-secondary-800 p-3 rounded">
            <pre className="text-sm text-secondary-400">{JSON.stringify(parsed, null, 2)}</pre>
          </div>
        );
      }
      return (
        <div className="bg-secondary-800 p-3 rounded">
          <pre className="text-sm text-secondary-400">{JSON.stringify(value, null, 2)}</pre>
        </div>
      );
    } catch {
      return <span className="text-secondary-400">{String(value)}</span>;
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Детали отчета">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Название полицейского отчета о правонарушении по уголовному делу о правонарушении:</strong> {report.title}</p>
            <p><strong>Место совершения правонарушения по уголовному делу о правонарушении по уголовному делу:</strong> {report.incident_location}</p>
            <p><strong>Дата и время совершения правонарушения по уголовному делу о правонарушении по уголовному делу:</strong> {formatDate(report.incident_time)}</p>
            <p><strong>Категория правонарушения по уголовному делу о правонарушении по уголовному делу:</strong> {report.incident_type}</p>
            <p><strong>ID сотрудника правоохранительных органов, составившего отчет о правонарушении по уголовному делу:</strong> <span className="font-mono text-sm">{report.author_character_id}</span></p>
            <p><strong>Дата и время составления полицейского отчета о правонарушении по уголовному делу:</strong> {formatDate(report.created_at)}</p>
            {report.updated_at && (
              <p><strong>Дата и время последнего редактирования полицейского отчета о правонарушении:</strong> {formatDate(report.updated_at)}</p>
            )}
            {report.call_id && (
              <p><strong>Связанный вызов в систему экстренного реагирования по уголовному делу о правонарушении:</strong> <span className="font-mono text-sm">{report.call_id}</span></p>
            )}
          </div>
          <div>
            <p><strong>Подробное описание правонарушения и обстоятельств уголовного дела о правонарушении:</strong></p>
            <p className="text-secondary-400 bg-secondary-800 p-2 rounded">{report.description}</p>
          </div>
        </div>

        {report.penal_codes && (
          <div>
            <p><strong>Примененные статьи уголовного кодекса и санкции по уголовному делу о правонарушении:</strong></p>
            {formatJsonField(report.penal_codes, 'penal_codes')}
          </div>
        )}

        {report.seized_items && (
          <div>
            <p><strong>Изъятые предметы и вещественные доказательства по уголовному делу о правонарушении по уголовному делу:</strong></p>
            {formatJsonField(report.seized_items, 'seized_items')}
          </div>
        )}

        {report.participants && (
          <div>
            <p><strong>Участники и свидетели правонарушения по уголовному делу о правонарушении по уголовному делу:</strong></p>
            {formatJsonField(report.participants, 'participants')}
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
  const [selectedReport, setSelectedReport] = useState<LawReports | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const reportColumns = [
    { key: 'title', header: 'Название' },
    { key: 'incident_type', header: 'Тип инцидента' },
    { key: 'incident_location', header: 'Место инцидента' },
    { 
      key: 'author_character_id', 
      header: 'ID автора',
      render: (value: unknown) => (
        <span className="font-mono text-sm">{value as string}</span>
      )
    },
    { 
      key: 'created_at', 
      header: 'Дата создания', 
      render: (value: unknown) => formatDate(value as string | null) 
    },
    { 
      key: 'actions', 
      header: 'Действия', 
      render: (_value: unknown, row: LawReports) => (
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
      )
    }
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
