import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmployees, Employee } from '@/contexts/EmployeesContext';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GlobalAssigneeSelectorProps {
    /**
     * Current selected value(s).
     * For 'single' mode, pass an array with one Employee or empty array.
     * For 'multiple' mode, pass an array of Employees.
     */
    selected: Employee[];

    /**
     * Callback when selection changes.
     * Always returns an array of Employees.
     */
    onChange: (employees: Employee[]) => void;

    /**
     * Selection mode: 'single' or 'multiple'
     * @default 'single'
     */
    mode?: 'single' | 'multiple';

    /**
     * Placeholder text for the button
     */
    placeholder?: string;

    /**
     * Class name for the trigger button
     */
    className?: string;
}

export const GlobalAssigneeSelector: React.FC<GlobalAssigneeSelectorProps> = ({
    selected = [],
    onChange,
    mode = 'single',
    placeholder = "Select Staff...",
    className
}) => {
    const [open, setOpen] = useState(false);
    const { employees, isLoading, isInitialized } = useEmployees();

    // Handle selection toggling
    const handleSelect = (employee: Employee) => {
        if (mode === 'single') {
            // In single mode, selecting an item replaces the current selection
            // If clicking the same item, strictly speaking we could deselect, 
            // but usually in dropdowns it just confirms selection. 
            // Let's allow replacing.
            onChange([employee]);
            setOpen(false);
        } else {
            // Multiple mode
            const isSelected = selected.some(s => s.id === employee.id);
            let newSelection: Employee[];

            if (isSelected) {
                newSelection = selected.filter(s => s.id !== employee.id);
            } else {
                newSelection = [...selected, employee];
            }
            onChange(newSelection);
        }
    };

    const handleRemove = (e: React.MouseEvent, employeeId: string) => {
        e.stopPropagation();
        const newSelection = selected.filter(s => s.id !== employeeId);
        onChange(newSelection);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* For Multiple mode, display chips outside or inside? 
          Design choice: Use badges for selected items in multiple mode below or above component 
          OR keep it simple and just show text summary in button if many. 
          Let's follow the standard badge approach for multi-select.
      */}

            {mode === 'multiple' && selected.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {selected.map(emp => (
                        <Badge key={emp.id} variant="secondary" className="pl-1 pr-1 py-0.5 h-6 flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[9px]">{emp.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-normal">{emp.displayName}</span>
                            <div
                                role="button"
                                className="rounded-full hover:bg-muted p-0.5 cursor-pointer ml-1"
                                onClick={(e) => handleRemove(e, emp.id)}
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </Badge>
                    ))}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between font-normal text-left", className)}
                    >
                        {mode === 'single' ? (
                            selected.length > 0 ? selected[0].displayName : placeholder
                        ) : (
                            selected.length > 0 ? `${selected.length} selected` : placeholder
                        )}

                        {isLoading ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search staff..." />
                        <CommandList>
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                                {!isInitialized || isLoading ? (
                                    <div className="p-4 text-sm text-center text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                        Loading employees...
                                    </div>
                                ) : (
                                    employees.map((employee) => {
                                        const isSelected = selected.some(s => s.id === employee.id);
                                        return (
                                            <CommandItem
                                                key={employee.id}
                                                value={employee.displayName}
                                                onSelect={() => handleSelect(employee)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        isSelected ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col">
                                                    <span>{employee.displayName}</span>
                                                    {employee.jobTitle && (
                                                        <span className="text-xs text-muted-foreground">{employee.jobTitle}</span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        );
                                    })
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};
