// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { DispatchStatusManager } from '@/components/DispatchStatusManager';
import { User } from 'lucide-react';

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
      <CardHeader>Статус</CardHeader>
      <div className="p-4">
        <DispatchStatusManager />
      </div>
    </Card>
  );
};
