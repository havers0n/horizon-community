// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { DispatchTools } from '@/components/DispatchTools';
import { Wrench } from 'lucide-react';

interface ToolsWidgetProps {
  isCompact?: boolean;
  className?: string;
}

export const ToolsWidget: React.FC<ToolsWidgetProps> = ({ isCompact = false, className = '' }) => {
  if (isCompact) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <Wrench size={12} />
          <span>Инструменты</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>Инструменты</CardHeader>
      <div className="p-4">
        <DispatchTools />
      </div>
    </Card>
  );
};
