// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { Call911Handler } from '@/components/Call911Handler';
import { Phone } from 'lucide-react';
import type { DispatchStatus } from '@/entities/dispatch/model/types';

interface Calls911WidgetProps {
  isCompact?: boolean;
  className?: string;
  currentStatus?: DispatchStatus;
}

export const Calls911Widget: React.FC<Calls911WidgetProps> = ({ 
  isCompact = false, 
  className = '',
  currentStatus = DispatchStatus.OPERATOR
}) => {
  if (isCompact) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <Phone size={12} />
          <span>Звонки 911</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>Звонки 911</CardHeader>
      <div className="p-4">
        <Call911Handler currentStatus={currentStatus} />
      </div>
    </Card>
  );
};
