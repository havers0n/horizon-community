import React from 'react';
import { checkboxVariants } from './Checkbox.styles';
import type { CheckboxProps } from './Checkbox.types';

export const Checkbox: React.FC<CheckboxProps> = ({ 
  variant = 'default', 
  size = 'default', 
  className, 
  onCheckedChange,
  onChange,
  ...props 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };

  return (
    <input 
      type="checkbox"
      className={checkboxVariants({ variant, size, className })}
      onChange={handleChange}
      {...props}
    />
  );
};
