import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDivisionContext } from '@/hooks/useDivisionContext';

export const DivisionSelector = () => {
  const { currentDivisionId, setCurrentDivisionId, userDivisions, loading, error } = useDivisionContext();

  // Handle division change
  const handleDivisionChange = (value: string) => {
    setCurrentDivisionId(value);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
        Loading divisions...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-10 w-[200px] rounded-md border border-destructive bg-background px-3 py-2 text-sm text-destructive">
        Error loading divisions
      </div>
    );
  }

  // No divisions case
  if (userDivisions.length === 0) {
    return (
      <div className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
        No divisions assigned
      </div>
    );
  }

  return (
    <Select
      value={currentDivisionId || undefined}
      onValueChange={handleDivisionChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select division" />
      </SelectTrigger>
      <SelectContent>
        {userDivisions.map((division) => (
          <SelectItem key={division.id} value={division.id}>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: division.color || '#888888' }}
              />
              <span>{division.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DivisionSelector; 