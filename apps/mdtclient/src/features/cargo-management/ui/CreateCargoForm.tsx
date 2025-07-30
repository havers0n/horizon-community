import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { useLocale } from '@/shared/contexts/LocaleContext';

interface CreateCargoFormProps {
    onSubmit: (cargo: any) => void;
    onClose: () => void;
}

interface CargoData {
    cargoType: string;
    weight: string;
    weightUnit: string;
    destination: string;
    origin: string;
    driver: string;
    vehicle: string;
    status: string;
    estimatedDelivery: string;
    notes: string;
}

const CreateCargoForm: React.FC<CreateCargoFormProps> = ({ onSubmit, onClose }) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState<CargoData>({
        cargoType: '',
        weight: '',
        weightUnit: 'kg',
        destination: '',
        origin: '',
        driver: '',
        vehicle: '',
        status: 'active',
        estimatedDelivery: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: Date.now().toString(),
            dateCreated: new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>{t('cargoLog.createCargo')}</CardHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.cargoType')} *
                            </label>
                            <select
                                name="cargoType"
                                value={formData.cargoType}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                <option value="electronics">{t('cargoLog.types.electronics')}</option>
                                <option value="furniture">{t('cargoLog.types.furniture')}</option>
                                <option value="clothing">{t('cargoLog.types.clothing')}</option>
                                <option value="food">{t('cargoLog.types.food')}</option>
                                <option value="machinery">{t('cargoLog.types.machinery')}</option>
                                <option value="construction">{t('cargoLog.types.construction')}</option>
                                <option value="chemicals">{t('cargoLog.types.chemicals')}</option>
                                <option value="other">{t('cargoLog.types.other')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.status')}
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                            >
                                <option value="active">{t('cargoLog.statuses.active')}</option>
                                <option value="completed">{t('cargoLog.statuses.completed')}</option>
                                <option value="cancelled">{t('cargoLog.statuses.cancelled')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.weight')} *
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.weightUnit')}
                            </label>
                            <select
                                name="weightUnit"
                                value={formData.weightUnit}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                            >
                                <option value="kg">кг</option>
                                <option value="tons">тонн</option>
                                <option value="lbs">фунтов</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.estimatedDelivery')} *
                            </label>
                            <input
                                type="datetime-local"
                                name="estimatedDelivery"
                                value={formData.estimatedDelivery}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.origin')} *
                            </label>
                            <input
                                type="text"
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.destination')} *
                            </label>
                            <input
                                type="text"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.driver')} *
                            </label>
                            <input
                                type="text"
                                name="driver"
                                value={formData.driver}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-200 mb-1">
                                {t('cargoLog.vehicle')} *
                            </label>
                            <input
                                type="text"
                                name="vehicle"
                                value={formData.vehicle}
                                onChange={handleChange}
                                className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-200 mb-1">
                            {t('cargoLog.notes')}
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                        />
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
                            {t('cargoLog.createCargo')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateCargoForm;
