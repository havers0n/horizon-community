// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useEffect } from 'react';
import { Modal } from '@/shared/ui/atoms/Modal';
import { Button } from '@/shared/ui/atoms/Button';
import { Call911Card } from '@/entities/dispatch/ui/Call911Card';
import { useCallManagementStore } from '../model/store';
import { Phone, CheckCircle, XCircle, Volume2 } from 'lucide-react';

interface IncomingCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    incomingCall, 
    callResponse, 
    acceptCall, 
    rejectCall 
  } = useCallManagementStore();

  useEffect(() => {
    if (isOpen && incomingCall) {
      // Автоматически скрываем через 30 секунд если не ответили
      const timer = setTimeout(() => {
        if (callResponse === 'pending') {
          rejectCall(incomingCall.id);
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, incomingCall, callResponse, rejectCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    acceptCall(incomingCall.id);
  };

  const handleReject = () => {
    rejectCall(incomingCall.id);
  };

  const getResponseMessage = () => {
    switch (callResponse) {
      case 'accepted':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span>Звонок принят!</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="h-5 w-5" />
            <span>Звонок отклонен</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Входящий звонок">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">
            <Phone className="h-16 w-16 text-red-500" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Входящий звонок 911
          </h3>
          <p className="text-secondary-400">
            Приоритет: {incomingCall.priority.toUpperCase()}
          </p>
        </div>

        <Call911Card
          call={incomingCall}
          showActions={false}
          className="border border-secondary-700"
        />

        {getResponseMessage()}

        {!callResponse && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Принять
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Отклонить
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-secondary-500">
          <Volume2 className="h-3 w-3 inline mr-1" />
          Звонок автоматически отклонится через 30 секунд
        </div>
      </div>
    </Modal>
  );
}; 
