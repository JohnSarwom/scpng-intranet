
import React from 'react';
import { TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from './SortableTableHeader';
import { TableHead } from '@/components/ui/table';

interface AssetTableHeaderProps {
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export const AssetTableHeader: React.FC<AssetTableHeaderProps> = ({
  onSort,
  sortColumn,
  sortDirection
}) => {
  return (
    <TableHeader className="sticky top-0 z-10 bg-white border-b">
      <TableRow>
        <TableCell className="w-12 p-2 text-center"></TableCell>
        <SortableTableHeader 
          label="Name" 
          column="name" 
          tooltip="Click to sort by name" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader
          label="Brand"
          column="brand"
          tooltip="Click to sort by brand"
          onSort={onSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
        <SortableTableHeader
          label="Model"
          column="model"
          tooltip="Click to sort by model"
          onSort={onSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
        <SortableTableHeader
          label="Serial Number"
          column="serial_number"
          tooltip="Click to sort by serial number"
          onSort={onSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="ID" 
          column="id" 
          tooltip="Click to sort by ID" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Type" 
          column="type" 
          tooltip="Click to sort by asset type" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Condition" 
          column="condition" 
          tooltip="Click to sort by asset condition" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Assigned To" 
          column="assignedTo" 
          tooltip="Click to sort by person assigned" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Email" 
          column="email" 
          tooltip="Click to sort by email" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Unit" 
          column="unit" 
          tooltip="Click to sort by unit" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Division" 
          column="division" 
          tooltip="Click to sort by division" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Description" 
          column="description" 
          tooltip="Click to sort by description" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Assigned Date" 
          column="assignedDate" 
          tooltip="Click to sort by assigned date" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Purchased Date" 
          column="purchasedDate" 
          tooltip="Click to sort by purchase date" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Last Updated" 
          column="lastUpdated" 
          tooltip="Click to sort by last updated date" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <TableHead className="text-right font-medium sticky right-0 bg-white z-20 whitespace-nowrap">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

// Need to import TableCell which was missed in the initial component definition
import { TableCell } from '@/components/ui/table';
