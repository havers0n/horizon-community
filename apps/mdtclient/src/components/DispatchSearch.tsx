import React, { useState } from 'react';
import { Input } from '@/shared/ui/atoms/Input';
import { Search, MapPin, Phone, User } from 'lucide-react';

interface DispatchSearchProps {
  onSearch: (query: string, type: 'citizen' | 'vehicle' | 'location') => void;
}

export const DispatchSearch: React.FC<DispatchSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'citizen' | 'vehicle' | 'location'>('citizen');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), searchType);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-3">Dispatch Search</h3>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setSearchType('citizen')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              searchType === 'citizen' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <User className="w-4 h-4 inline mr-1" />
            Citizen
          </button>
          
          <button
            onClick={() => setSearchType('vehicle')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              searchType === 'vehicle' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Vehicle
          </button>
          
          <button
            onClick={() => setSearchType('location')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              searchType === 'location' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </button>
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder={`Search ${searchType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            leftIcon={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-slate-400">
        <p>Quick search for citizens, vehicles, or locations in the system.</p>
      </div>
    </div>
  );
}; 