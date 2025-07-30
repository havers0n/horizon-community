import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/atoms/Select';

interface BoloTypeSelectorProps {
  value: 'vehicle' | 'person' | 'general';
  onValueChange: (value: 'vehicle' | 'person' | 'general') => void;
  disabled?: boolean;
}

export const BoloTypeSelector: React.FC<BoloTypeSelectorProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выберите тип BOLO" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="vehicle">Транспортное средство</SelectItem>
        <SelectItem value="person">Человек</SelectItem>
        <SelectItem value="general">Общий</SelectItem>
      </SelectContent>
    </Select>
  );
}; 