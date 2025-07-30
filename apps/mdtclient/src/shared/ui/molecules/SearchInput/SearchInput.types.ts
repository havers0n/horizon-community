import { InputHTMLAttributes } from 'react';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onSearch?: (value: string) => void;
  suggestions?: any[];
  onSuggestionSelect?: (suggestion: any) => void;
  showSuggestions?: boolean;
  className?: string;
}