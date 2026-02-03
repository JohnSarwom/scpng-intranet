
import React from 'react';
import { TableHead } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { TableSortIndicator } from './TableSortIndicator';

interface SortableTableHeaderProps {
  label: string;
  column: string;
  tooltip: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  className?: string;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  column,
  tooltip,
  sortColumn,
  sortDirection,
  onSort,
  className = "font-medium cursor-pointer whitespace-nowrap"
}) => {
  const handleClick = () => {
    if (onSort) {
      onSort(column);
    }
  };

  return (
    <TableHead 
      className={className}
      onClick={handleClick}
    >
      <TooltipWrapper content={tooltip}>
        <div className="flex items-center">
          {label} <TableSortIndicator column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
        </div>
      </TooltipWrapper>
    </TableHead>
  );
};
