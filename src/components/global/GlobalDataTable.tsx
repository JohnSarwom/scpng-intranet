import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, MoreVertical, Info, Edit, Trash2 } from 'lucide-react';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import HighlightMatch from '@/components/ui/HighlightMatch'; // Assuming this is needed
import { cn, formatDate } from '@/lib/utils'; // Assuming utils are needed

// Define the shape of the data items (generic)
export type DataItem = Record<string, any>;

// Define the structure for a column definition
export interface ColumnDefinition<T extends DataItem> {
  accessorKey: keyof T | string; // Key to access data in the row item
  header: React.ReactNode;      // Content for the table header cell (Th)
  cell: (row: T) => React.ReactNode; // Function to render the table data cell (Td)
  minWidth?: string;             // Optional minimum width
  width?: string;                // Optional fixed width
  sticky?: 'left' | 'right';     // Optional sticky positioning
  headerClassName?: string;      // Optional classes for TH
  cellClassName?: string;        // Optional classes for TD
}

// Define the props for the GlobalDataTable component
interface GlobalDataTableProps<T extends DataItem> {
  data: T[];                        // Array of data items to display
  columns: ColumnDefinition<T>[];    // Array of column definitions
  isLoading?: boolean;              // Optional loading state flag
  error?: Error | null;             // Optional error object
  filterText?: string;              // Optional filter text for highlighting
  rowKeyField: keyof T | string;    // Field to use as the unique key for each row
  onRowClick?: (row: T) => void;    // Optional handler for clicking a row/cell
  onEditClick?: (row: T) => void;   // Optional handler for edit action
  onDeleteClick?: (row: T) => void; // Optional handler for delete action
  maxHeight?: string;               // Optional max height for the scroll container
  className?: string;               // Optional additional className for the container
  emptyStateMessage?: string;       // Optional message for when data is empty
}

// Basic structure of the component
const GlobalDataTable = <T extends DataItem>({
  data,
  columns,
  isLoading = false,
  error = null,
  filterText = '',
  rowKeyField,
  onRowClick,
  onEditClick,
  onDeleteClick,
  maxHeight = 'calc(100vh - 350px)', // Default max height
  className,
  emptyStateMessage = 'No data found.',
}: GlobalDataTableProps<T>) => {

  // Calculate left offset for sticky columns dynamically
  const getStickyOffset = (index: number): string => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
          if (columns[i].sticky === 'left') {
              // Attempt to parse width, fallback to a default estimate if complex/missing
              const widthStr = columns[i].width || columns[i].minWidth || '100px'; // Estimate if no width provided
              const widthMatch = widthStr.match(/(\d+)/);
              offset += widthMatch ? parseInt(widthMatch[1], 10) : 100; // Add width in pixels
          }
      }
      return `${offset}px`;
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: maxHeight }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 text-destructive flex items-center justify-center" style={{ height: maxHeight }}>
        <p>Error loading data: {error.message}</p>
      </div>
    );
  }

  // Placeholder for the actual table implementation
  return (
    <div className={cn("overflow-auto relative", className)} style={{ maxHeight }}>
      <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400"> 
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-20">
          <tr>
            {columns.map((column, index) => {
              const isStickyLeft = column.sticky === 'left';
              const isStickyRight = column.sticky === 'right';
              const style: React.CSSProperties = {};
              if (isStickyLeft) style.left = getStickyOffset(index);
              if (isStickyRight) style.right = '0px'; // Assuming only one sticky right column for now (actions)
              
              return (
                <th 
                  key={String(column.accessorKey)} 
                  scope="col" 
                  className={cn(
                    "px-2 py-1 bg-gray-100 dark:bg-gray-700", 
                    isStickyLeft || isStickyRight ? "sticky z-20" : "",
                    column.headerClassName
                  )}
                  style={{ ...style, minWidth: column.minWidth, width: column.width }}
                >
                  {column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map(row => (
              <tr 
                key={String(row[rowKeyField])} 
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 h-auto"
              >
                {columns.map((column, index) => {
                    const isStickyLeft = column.sticky === 'left';
                    const isStickyRight = column.sticky === 'right';
                    const style: React.CSSProperties = {};
                    if (isStickyLeft) style.left = getStickyOffset(index);
                    if (isStickyRight) style.right = '0px';

                    return (
                        <td 
                            key={String(column.accessorKey)} 
                            className={cn(
                                "px-2 py-1", 
                                isStickyLeft || isStickyRight ? "sticky z-10 bg-white dark:bg-gray-800" : "", 
                                column.cellClassName
                            )}
                            style={style} 
                        >
                            {column.cell(row)}
                        </td>
                    );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="h-24 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyStateMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GlobalDataTable; 