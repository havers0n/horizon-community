import { HTMLAttributes } from 'react';

export interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}