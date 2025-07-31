// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';
import { Badge } from '@/shared/ui/atoms/Badge';

interface BoloPrioritySelectorProps {
  value: 'low' | 'medium' | 'high' | 'critical';
  onValueChange: (value: 'low' | 'medium' | 'high' | 'critical') => void;
  disabled?: boolean;
}

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Критический', color: 'bg-red-100 text-red-800' }
};

export const BoloPrioritySelector: React.FC<BoloPrioritySelectorProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выберите приоритет">
          {value && (
            <Badge className={priorityConfig[value].color}>
              {priorityConfig[value].label}
            </Badge>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">
          <Badge className={priorityConfig.low.color}>Низкий</Badge>
        </SelectItem>
        <SelectItem value="medium">
          <Badge className={priorityConfig.medium.color}>Средний</Badge>
        </SelectItem>
        <SelectItem value="high">
          <Badge className={priorityConfig.high.color}>Высокий</Badge>
        </SelectItem>
        <SelectItem value="critical">
          <Badge className={priorityConfig.critical.color}>Критический</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}; 