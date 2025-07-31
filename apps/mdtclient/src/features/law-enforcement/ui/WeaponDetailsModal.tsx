// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Modal, Button } from '../../../shared/ui/atoms';
import { MOCK_CITIZENS_EXTENDED } from '@/shared';
import type { Weapon } from '@/shared/types';

interface WeaponDetailsModalProps {
  weapon: Weapon;
  onClose: () => void;
}

export const WeaponDetailsModal: React.FC<WeaponDetailsModalProps> = ({ weapon, onClose }) => {
  const owner = MOCK_CITIZENS_EXTENDED.find(c => c.id === weapon.ownerId);

  return (
    <Modal isOpen={true} onClose={onClose} title="Информация об оружии">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Серийный номер:</strong> {weapon.serialNumber}</p>
            <p><strong>Модель:</strong> {weapon.model}</p>
            <p><strong>Тип:</strong> {weapon.type}</p>
            <p><strong>Калибр:</strong> {weapon.caliber}</p>
          </div>
          <div>
            <p><strong>Владелец:</strong> {owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестно'}</p>
            <p><strong>Статус:</strong> {
              weapon.status === 'registered' ? 'Зарегистрировано' :
              weapon.status === 'stolen' ? 'Похищено' : 'Конфисковано'
            }</p>
            <p><strong>Дата регистрации:</strong> {new Date(weapon.registrationDate).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        {weapon.notes && (
          <div>
            <p><strong>Заметки:</strong></p>
            <p className="text-secondary-400">{weapon.notes}</p>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </Modal>
  );
};
