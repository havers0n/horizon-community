// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useEffect } from 'react';
import { Card, CardHeader, Button } from '@/shared/ui/atoms';
import { Truck, Plus, Eye, Trash2 } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { cargoManagementStore } from '../model/cargoManagementStore';
import { CreateCargoForm } from './CreateCargoForm';
import { CargoDetailsModal } from './CargoDetailsModal';
import type { Cargo } from '@/shared/types';

export const CargoManagementWidget: React.FC = () => {
    const { t } = useLocale();
    const {
        cargos,
        selectedCargo,
        isLoading,
        error,
        showCreateModal,
        showDetailsModal,
        createCargo,
        deleteCargo,
        updateCargoStatus,
        selectCargo,
        setShowCreateModal,
        setShowDetailsModal,
        loadCargos,
    } = cargoManagementStore();

    useEffect(() => {
        loadCargos();
    }, [loadCargos]);

    const handleCreateCargo = async (data: any) => {
        await createCargo(data);
    };

    const handleViewDetails = (cargo: Cargo) => {
        selectCargo(cargo);
        setShowDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setShowDetailsModal(false);
        selectCargo(null);
    };

    const handleDeleteCargo = async (cargoId: string) => {
        await deleteCargo(cargoId);
        setShowDetailsModal(false);
        selectCargo(null);
    };

    const handleUpdateStatus = async (cargoId: string, status: Cargo['status']) => {
        await updateCargoStatus(cargoId, status);
    };

    const getCargoTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            electronics: 'Электроника',
            furniture: 'Мебель',
            clothing: 'Одежда',
            food: 'Продукты',
            machinery: 'Машины',
            chemicals: 'Химикаты',
            other: 'Другое',
        };
        return labels[type] || type;
    };

    const getStatusLabel = (status: Cargo['status']) => {
        const labels: Record<string, string> = {
            pending: 'Ожидает',
            in_transit: 'В пути',
            delivered: 'Доставлен',
            cancelled: 'Отменен',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: Cargo['status']) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-400',
            in_transit: 'bg-blue-500/20 text-blue-400',
            delivered: 'bg-green-500/20 text-green-400',
            cancelled: 'bg-red-500/20 text-red-400',
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400';
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Управление грузоперевозками</h3>
                </CardHeader>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
                        <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Truck className="w-6 h-6 text-primary-500" />
                        <h3 className="text-lg font-semibold text-white">Управление грузоперевозками</h3>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Создать грузоперевозку
                    </Button>
                </CardHeader>
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {cargos.length === 0 ? (
                        <div className="text-center py-8">
                            <Truck className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                            <p className="text-secondary-400">Грузоперевозки не найдены</p>
                            <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                                Создать первую грузоперевозку
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cargos.map((cargo) => (
                                <Card key={cargo.id} className="hover:bg-secondary-800 transition-colors">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-white">
                                                    {getCargoTypeLabel(cargo.type)}
                                                </h4>
                                                <p className="text-sm text-secondary-400 line-clamp-2">
                                                    {cargo.description}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(cargo)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteCargo(cargo.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">Вес:</span>
                                                <span className="text-white">{cargo.weight} кг</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">Водитель:</span>
                                                <span className="text-white">{cargo.driver}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">Статус:</span>
                                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(cargo.status)}`}>
                                                    {getStatusLabel(cargo.status)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-secondary-400">Маршрут:</span>
                                                <span className="text-white text-xs">
                                                    {cargo.origin} → {cargo.destination}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Модальные окна */}
            {showCreateModal && (
                <CreateCargoForm
                    onSubmit={handleCreateCargo}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {showDetailsModal && selectedCargo && (
                <CargoDetailsModal
                    cargo={selectedCargo}
                    onClose={handleCloseDetails}
                    onDelete={handleDeleteCargo}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};
