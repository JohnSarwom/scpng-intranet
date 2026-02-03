
import React from 'react';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    [key: string]: {
      value: string;
      options: FilterOption[];
      label: string;
      tooltip: string;
    }
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <TooltipWrapper content="Search assets">
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </TooltipWrapper>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(filters).map(([key, filter]) => (
          <TooltipWrapper key={key} content={filter.tooltip}>
            <Select value={filter.value} onValueChange={(value) => onFilterChange(key, value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Filter by ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{`All ${filter.label}s`}</SelectItem>
                {filter.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipWrapper>
        ))}

        <TooltipWrapper content="Reset all filters">
          <Button variant="outline" onClick={onResetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </TooltipWrapper>
      </div>
    </div>
  );
};
