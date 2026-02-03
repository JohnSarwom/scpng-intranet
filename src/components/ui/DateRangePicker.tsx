import React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  id?: string;
  selectedRange: DateRange | undefined;
  onSelectRange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  error?: boolean; // Optional error prop for styling
  numberOfMonths?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  id,
  selectedRange,
  onSelectRange,
  className,
  placeholder = "Pick a date range",
  error = false,
  numberOfMonths = 2,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal py-3 px-4 rounded-lg", // Keep consistent styling
            !selectedRange && "text-muted-foreground",
            error && "border-red-500", // Apply error styling if needed
            className // Allow overriding via props
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedRange?.from ? (
            selectedRange.to ? (
              <>
                {format(selectedRange.from, "LLL dd, y")} -{" "}
                {format(selectedRange.to, "LLL dd, y")}
              </>
            ) : (
              format(selectedRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={selectedRange?.from || new Date()} // Use selected date or today
          selected={selectedRange}
          onSelect={onSelectRange} // Call the passed handler
          numberOfMonths={numberOfMonths}
          className="border-0" // Keep consistent calendar styling
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker; 