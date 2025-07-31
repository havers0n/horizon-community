// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Label } from '@/shared/ui/atoms/Label';
import { Input } from '@/shared/ui/atoms/Input';
import { Textarea } from '@/shared/ui/atoms/Textarea';

interface BoloFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const BoloFormField: React.FC<BoloFormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
          rows={3}
        />
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 