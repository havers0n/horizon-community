import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { DispatchSearch } from '@/components/DispatchSearch';
import { Search } from 'lucide-react';

interface SearchWidgetProps {
  isCompact?: boolean;
  className?: string;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({ isCompact = false, className = '' }) => {
  if (isCompact) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <Search size={12} />
          <span>Поиск</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>Поиск</CardHeader>
      <div className="p-4">
        <DispatchSearch />
      </div>
    </Card>
  );
};
