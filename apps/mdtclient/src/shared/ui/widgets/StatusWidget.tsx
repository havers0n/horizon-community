import { DispatchStatusManager } from '@/components/DispatchStatusManager';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { User } from 'lucide-react';
import React from 'react';

interface StatusWidgetProps {
  isCompact?: boolean;
  className?: string;
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({ isCompact = false, className = '' }) => {
  if (isCompact) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <User size={12} />
          <span>Статус</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <>{'Статус'}</>
      </CardHeader>
      <div className="p-4">
        <DispatchStatusManager
          currentStatus="available"
          onStatusChange={() => {
            // Mock function
          }}
        />
      </div>
    </Card>
  );
};
