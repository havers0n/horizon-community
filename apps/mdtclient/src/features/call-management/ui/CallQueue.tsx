// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Call911Card } from '@/entities/dispatch/ui/Call911Card';
import { useCallManagementStore } from '../model/store';
import { Phone, AlertTriangle } from 'lucide-react';

interface CallQueueProps {
  className?: string;
  maxItems?: number;
}

export const CallQueue: React.FC<CallQueueProps> = ({ 
  className = '', 
  maxItems = 5 
}) => {
  const { 
    calls, 
    loading, 
    error, 
    loadCalls, 
    acceptCall, 
    rejectCall,
    currentStatus 
  } = useCallManagementStore();

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const pendingCalls = calls.filter(call => call.status === 'PENDING');
  const displayedCalls = pendingCalls.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Очередь звонков</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-secondary-800 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Очередь звонков</h3>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Очередь звонков</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary-400">
            Статус: {currentStatus}
          </span>
          {pendingCalls.length > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {pendingCalls.length}
            </span>
          )}
        </div>
      </div>

      {displayedCalls.length > 0 ? (
        <div className="space-y-3">
          {displayedCalls.map(call => (
            <Call911Card
              key={call.id}
              call={call}
              onAccept={acceptCall}
              onReject={rejectCall}
              className="border border-secondary-700"
            />
          ))}
          
          {pendingCalls.length > maxItems && (
            <div className="text-center text-sm text-secondary-400">
              И еще {pendingCalls.length - maxItems} звонков в очереди
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Phone className="h-12 w-12 text-secondary-600 mx-auto mb-2" />
          <p className="text-secondary-400">Нет звонков в очереди</p>
        </div>
      )}
    </Card>
  );
}; 
