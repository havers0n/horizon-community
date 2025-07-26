
import React, { useState } from 'react';
import type { Incident, MDTUnit } from '../types';
import { MOCK_INCIDENTS, MOCK_UNITS } from '../constants';
import { Card, CardHeader, Button, Modal } from './ui/Theme';
import { Clock, Shield, Bot, ArrowLeft } from 'lucide-react';
import { generateIncidentReport } from '../services/geminiService';
import { useLocale } from '../contexts/LocaleContext';

const getUnitById = (id: string): MDTUnit | undefined => MOCK_UNITS.find(u => u.id === id);

export const ActiveIncidents: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [modalView, setModalView] = useState<'details' | 'ai_report'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState('');

    const activeIncidents = MOCK_INCIDENTS;
    const { t, getUnitStatus, formatTime } = useLocale();

    const handleViewDetails = (incident: Incident) => {
        setSelectedIncident(incident);
        setModalView('details');
        setReport('');
        setIsModalOpen(true);
    };

    const handleGenerateReport = async () => {
        if (!selectedIncident) return;
        setModalView('ai_report');
        setIsLoading(true);
        const generatedReport = await generateIncidentReport(selectedIncident);
        setReport(generatedReport);
        setIsLoading(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIncident(null);
    };

    return (
        <>
            <Card>
                <CardHeader>{t('incidents.activeIncidents')}</CardHeader>
                {activeIncidents.length > 0 ? (
                    <div className="space-y-3">
                        {activeIncidents.map(incident => (
                             <div key={incident.id} className="p-3 bg-secondary-900 rounded-md flex justify-between items-center gap-4 hover:bg-secondary-900/50 transition-colors">
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-primary-400 truncate">{incident.title}</p>
                                    <p className="text-sm text-secondary-300 mt-1 truncate">{incident.events[0]?.description}</p>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="text-xs text-secondary-500 flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>{formatTime(incident.events[0].timestamp)}</span>
                                    </div>
                                    <span className="font-bold text-sm bg-secondary-700 px-2 py-1 rounded">{incident.involvedUnits.length} {t('incidents.units')}</span>
                                    <Button size="sm" onClick={() => handleViewDetails(incident)}>
                                        {t('common.details')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-secondary-400">{t('incidents.noActiveIncidents')}</p>
                )}
            </Card>

            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={modalView === 'details' ? `${t('incidents.incidentDetails')}: ${selectedIncident?.title}` : t('incidents.aiReport')}
            >
                {selectedIncident && (
                    <>
                        {modalView === 'details' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                     <Button onClick={handleGenerateReport}>
                                        <Bot className="mr-2 h-4 w-4" />
                                        {t('incidents.createAiReport')}
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                                                    <div>
                                    <h4 className="font-bold text-lg text-secondary-100 mb-2">{t('incidents.eventLog')}</h4>
                                    <div className="space-y-2 text-sm text-secondary-300 max-h-60 overflow-y-auto pr-2">
                                        {selectedIncident.events.map(event => (
                                            <p key={event.id}><span className="font-mono text-secondary-500">{formatTime(event.timestamp, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>: {event.description}</p>
                                        ))}
                                    </div>
                                </div>
                                     <div>
                                        <h4 className="font-bold text-lg text-secondary-100 mb-2 flex items-center gap-2"><Shield /> {t('incidents.assignedUnits')}</h4>
                                        <div className="space-y-2">
                                            {selectedIncident.involvedUnits.map(unitId => {
                                                const unit = getUnitById(unitId);
                                                return unit ? (
                                                    <div key={unit.id} className="p-3 bg-secondary-700 rounded-md flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-white">{unit.name}</p>
                                                            <p className="text-sm text-secondary-400">{unit.department}</p>
                                                        </div>
                                                        <span className="text-sm font-medium px-2 py-1 bg-primary-600/50 text-primary-300 rounded-full">{getUnitStatus(unit.status)}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalView === 'ai_report' && (
                             <div>
                                <Button onClick={() => setModalView('details')} variant="secondary" size="sm" className="mb-4">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('incidents.backToDetails')}
                                </Button>
                                {isLoading ? (
                                     <div className="flex justify-center items-center h-48">
                                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
                                     </div>
                                ) : (
                                    <div className="prose prose-invert whitespace-pre-wrap text-secondary-300">
                                        {report}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
};