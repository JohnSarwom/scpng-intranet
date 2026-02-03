import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function DatePicker({ selected, onSelect, className }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected);

  // When selected prop changes, update local state
  React.useEffect(() => {
    setDate(selected);
  }, [selected]);

  // When local date changes, call onSelect
  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && onSelect) {
      onSelect(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        initialFocus
      />
    </div>
  );
} 