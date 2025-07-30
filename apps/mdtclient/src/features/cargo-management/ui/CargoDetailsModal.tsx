import React from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface CargoDetailsModalProps {
    cargo: any;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const CargoDetailsModal: React.FC<CargoDetailsModalProps> = ({ cargo, onClose, onEdit, onDelete }) => {
    const { t } = useLocale();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-400';
            case 'completed':
                return 'text-blue-400';
            case 'cancelled':
                return 'text-red-400';
            default:
                return 'text-secondary-300';
        }
    };

    const getCargoTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            electronics: 'Электроника',
            furniture: 'Мебель',
            clothing: 'Одежда',
            food: 'Продукты питания',
            machinery: 'Машины и оборудование',
            construction: 'Строительные материалы',
            chemicals: 'Химикаты',
            other: 'Другое'
        };
        return types[type] || type;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>{t('cargoLog.cargoDetails')}</CardHeader>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.cargoType')}
                            </label>
                            <p className="text-white">{getCargoTypeLabel(cargo.cargoType)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.status')}
                            </label>
                            <p className={`${getStatusColor(cargo.status)} font-medium`}>
                                {t(`cargoLog.${cargo.status}`)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.weight')}
                            </label>
                            <p className="text-white">{cargo.weight} {t(`cargoLog.${cargo.weightUnit}`)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.origin')}
                            </label>
                            <p className="text-white">{cargo.origin}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.destination')}
                            </label>
                            <p className="text-white">{cargo.destination}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.driver')}
                            </label>
                            <p className="text-white">{cargo.driver}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.vehicle')}
                            </label>
                            <p className="text-white">{cargo.vehicle}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.dateCreated')}
                            </label>
                            <p className="text-white">{formatDate(cargo.dateCreated)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.estimatedDelivery')}
                            </label>
                            <p className="text-white">{formatDate(cargo.estimatedDelivery)}</p>
                        </div>
                    </div>

                    {cargo.notes && (
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.notes')}
                            </label>
                            <p className="text-white bg-secondary-800 p-3 rounded-md">{cargo.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                            {onEdit && (
                                <Button
                                    onClick={onEdit}
                                    variant="secondary"
                                >
                                    {t('cargoLog.editCargo')}
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    onClick={onDelete}
                                    variant="secondary"
                                    className="text-red-400 hover:text-red-300"
                                >
                                    {t('cargoLog.deleteCargo')}
                                </Button>
                            )}
                        </div>
                        <Button
                            onClick={onClose}
                        >
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CargoDetailsModal;
