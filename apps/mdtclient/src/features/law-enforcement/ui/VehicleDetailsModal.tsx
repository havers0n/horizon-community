import React from 'react';
import { Modal, Button } from '../../../shared/ui/atoms';
import { MOCK_CITIZENS_EXTENDED } from '../model/constants';
import type { Vehicle } from '../model/types';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose }) => {
  const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === vehicle.ownerId);

  return (
    <Modal isOpen={true} onClose={onClose} title="Информация об автомобиле">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Номерной знак:</strong> {vehicle.plate}</p>
            <p><strong>Модель:</strong> {vehicle.model}</p>
            <p><strong>Цвет:</strong> {vehicle.color}</p>
            <p><strong>VIN:</strong> {vehicle.vin}</p>
          </div>
          <div>
            <p><strong>Владелец:</strong> {owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно'}</p>
            <p><strong>Статус регистрации:</strong> {vehicle.registration === 'valid' ? 'Действительна' : 'Недействительна'}</p>
            <p><strong>Страховка:</strong> {vehicle.insurance === 'valid' ? 'Действительна' : 'Недействительна'}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </Modal>
  );
};
