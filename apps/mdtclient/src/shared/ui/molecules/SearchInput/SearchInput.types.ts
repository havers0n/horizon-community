import { InputHTMLAttributes } from 'react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  placeholder?: string;
  onSearch?: (value: string) => void;
  suggestions?: any[];
  onSuggestionSelect?: (suggestion: any) => void;
  showSuggestions?: boolean;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}