import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/atoms/Dialog';
import { CreateBoloForm } from './CreateBoloForm';

interface CreateBoloModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateBoloModal: React.FC<CreateBoloModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новую ориентировку (BOLO)</DialogTitle>
        </DialogHeader>
        <CreateBoloForm
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}; 