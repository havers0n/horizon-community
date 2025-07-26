
import React, { useState, useEffect, useMemo } from 'react';
import type { MDTReport, ReportTemplate, ReportType } from '../types';
import { REPORT_TEMPLATES } from '../constants';
import { Card, CardHeader, Modal, Button } from './ui/Theme';
import { FileText, PlusCircle, Search, ArrowLeft } from 'lucide-react';

interface ReportsPortalProps {
    reports: MDTReport[];
    reportTypeName: string;
}

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
            content: formData.content
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
                    <h3 className="text-lg font-semibold">Выберите шаблон</h3>
                </div>
                <div className="grid gap-4">
                    {REPORT_TEMPLATES.filter(template => allowedTypes.includes(template.type)).map(template => (
                        <div key={template.type} className="p-4 border border-secondary-600 rounded-md hover:bg-secondary-800 cursor-pointer" onClick={() => handleSelectTemplate(template)}>
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
                <h3 className="text-lg font-semibold">Создание рапорта</h3>
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Название</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Содержание</label>
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 min-h-[200px]"
                    required
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
                <Button type="submit">Сохранить рапорт</Button>
            </div>
        </form>
    );
};

export const ReportsPortal: React.FC<ReportsPortalProps> = ({ reports, reportTypeName }) => {
    const [localReports, setLocalReports] = useState<MDTReport[]>(reports);
    const [selectedReport, setSelectedReport] = useState<MDTReport | null>(reports[0] ?? null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    }

    return (
        <>
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-14rem)]">
                <div className="col-span-12 lg:col-span-4 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader>{reportTypeName}</CardHeader>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                            <input
                                type="text"
                                placeholder="Поиск по названию, автору..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-secondary-700 border border-secondary-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="space-y-2 overflow-y-auto flex-grow pr-2">
                            {filteredReports.length > 0 ? (
                                filteredReports.map(rep => (
                                    <button key={rep.id} onClick={() => setSelectedReport(rep)} className={`w-full text-left p-3 rounded-md transition-colors flex flex-col ${selectedReport?.id === rep.id ? 'bg-primary-600/80' : 'bg-secondary-800 hover:bg-secondary-700'}`}>
                                        <p className="font-semibold text-white truncate">{rep.title}</p>
                                        <div className="flex justify-between items-center text-xs text-secondary-400 mt-1">
                                            <span>{rep.author}</span>
                                            <span>{new Date(rep.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-secondary-400 pt-4">Рапорты не найдены.</p>
                            )}
                        </div>
                        <div className="pt-4 mt-auto border-t border-secondary-700">
                            <Button className="w-full" onClick={() => setIsCreateModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Создать новый рапорт
                            </Button>
                        </div>
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-8 h-full">
                    {selectedReport ? (
                        <Card className="h-full overflow-y-auto">
                            <CardHeader className="flex items-center gap-2"><FileText /> {selectedReport.title}</CardHeader>
                            <div className="flex justify-between items-baseline text-sm text-secondary-400 mb-4 pb-4 border-b border-secondary-700">
                                <p><strong>Автор:</strong> {selectedReport.author}</p>
                                <p><strong>Дата:</strong> {new Date(selectedReport.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="prose prose-invert max-w-none text-secondary-300 whitespace-pre-wrap">
                                {selectedReport.content}
                            </div>
                        </Card>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Card><p className="text-secondary-400">Выберите рапорт для просмотра или создайте новый.</p></Card>
                        </div>
                    )}
                </div>
            </div>
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Создание нового рапорта"
            >
                <ReportCreator 
                    allowedTypes={allowedTypes}
                    onSave={handleReportSave}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </>
    );
};