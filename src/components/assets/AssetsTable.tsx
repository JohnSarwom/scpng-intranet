
import React from "react";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { Asset } from "@/types/asset";
import { AssetTableHeader } from "./table/AssetTableHeader";
import { AssetTableRow } from "./table/AssetTableRow";
import { TableRow } from "@/components/ui/table";

interface AssetsTableProps {
  assets: Asset[];
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  divisionId?: string;
  onView?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
}

export function AssetsTable({ 
  assets, 
  onSort, 
  sortColumn, 
  sortDirection,
  divisionId,
  onView,
  onEdit,
  onDelete
}: AssetsTableProps) {
  return (
    <div className="rounded-md border">
      <div className="responsive-table-container">
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
          <Table>
            <AssetTableHeader 
              onSort={onSort} 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
            />
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="h-24 text-center">
                    No assets found
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <AssetTableRow 
                    key={asset.id} 
                    asset={asset} 
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
