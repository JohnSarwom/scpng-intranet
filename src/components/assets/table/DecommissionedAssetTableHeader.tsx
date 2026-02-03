
import React from 'react';
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { SortableTableHeader } from './SortableTableHeader';

interface DecommissionedAssetTableHeaderProps {
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}

export const DecommissionedAssetTableHeader: React.FC<DecommissionedAssetTableHeaderProps> = ({
  onSort,
  sortColumn,
  sortDirection
}) => {
  return (
    <TableHeader className="sticky top-0 z-10 bg-white border-b">
      <TableRow>
        <SortableTableHeader 
          label="Name" 
          column="name" 
          tooltip="Click to sort by name" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Asset ID" 
          column="asset_id" 
          tooltip="Click to sort by asset ID" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Type" 
          column="type" 
          tooltip="Click to sort by type" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Reason" 
          column="reason" 
          tooltip="Click to sort by reason" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Assigned To" 
          column="assigned_to" 
          tooltip="Click to sort by assigned person" 
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
          label="Decommission Date" 
          column="decommission_date" 
          tooltip="Click to sort by decommission date" 
          onSort={onSort} 
          sortColumn={sortColumn} 
          sortDirection={sortDirection}
        />
        <SortableTableHeader 
          label="Purchase Date" 
          column="purchased_date" 
          tooltip="Click to sort by purchase date" 
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
          className="font-medium cursor-pointer whitespace-nowrap max-w-[200px]"
        />
        <TableHead className="text-right font-medium sticky right-0 bg-white z-20 whitespace-nowrap">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
