
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TableSortIndicatorProps {
  column: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export const TableSortIndicator: React.FC<TableSortIndicatorProps> = ({
  column,
  sortColumn,
  sortDirection,
}) => {
  if (sortColumn === column) {
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  }
  return null;
};
