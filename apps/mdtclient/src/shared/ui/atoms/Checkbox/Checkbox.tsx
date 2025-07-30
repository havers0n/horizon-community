import React from 'react';
import { checkboxVariants } from './Checkbox.styles';
import type { CheckboxProps } from './Checkbox.types';

export const Checkbox: React.FC<CheckboxProps> = ({ 
  variant = 'default', 
  size = 'default', 
  className, 
  ...props 
}) => {
  return (
    <input 
      type="checkbox"
      className={checkboxVariants({ variant, size, className })}
      {...props}
    />
  );
};
