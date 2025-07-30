import React from 'react';
import { textareaVariants } from './Textarea.styles';
import type { TextareaProps } from './Textarea.types';

export const Textarea: React.FC<TextareaProps> = ({ 
  variant = 'default', 
  size = 'default', 
  className, 
  ...props 
}) => {
  return (
    <textarea 
      className={textareaVariants({ variant, size, className })}
      {...props}
    />
  );
};
