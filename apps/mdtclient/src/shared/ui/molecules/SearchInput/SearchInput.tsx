import React, { useState, useEffect } from 'react';
import { Input } from '../../atoms/Input';
import { Search } from 'lucide-react';
import type { SearchInputProps } from './SearchInput.types';

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = false,
  className,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2 && showSuggestions) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
  }, [searchTerm, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchTerm(suggestion.fullName || suggestion.name || suggestion);
    setShowSuggestionsList(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10"
          {...props}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
      </div>
      
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-secondary-800 border border-secondary-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 hover:bg-secondary-700 cursor-pointer border-b border-secondary-600 last:border-b-0"
            >
              {suggestion.imageUrl && (
                <div className="flex items-center gap-3">
                  <img src={suggestion.imageUrl} alt={suggestion.fullName || suggestion.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-white font-medium">{suggestion.fullName || suggestion.name}</p>
                    {suggestion.ssn && <p className="text-sm text-secondary-400">SSN: {suggestion.ssn}</p>}
                  </div>
                </div>
              )}
              {!suggestion.imageUrl && (
                <p className="text-white">{suggestion.fullName || suggestion.name || suggestion}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
