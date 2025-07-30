import { HTMLAttributes } from 'react';

export interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}