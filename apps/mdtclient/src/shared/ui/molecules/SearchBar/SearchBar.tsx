import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/ui/atoms/Input';
import { Button } from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Поиск...",
  onSearch,
  onClear,
  className,
  disabled = false,
  defaultValue = "",
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Очищаем предыдущий таймер
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Устанавливаем новый таймер для debounce
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    
    setDebounceTimer(timer);
  };

  const handleClear = () => {
    setQuery("");
    onClear?.();
    onSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )
          }
          className="pr-10"
        />
      </div>
    </form>
  );
}; 
