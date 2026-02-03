
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { TableActions } from './TableActions';

interface DecommissionedAsset {
  id: string;
  name: string;
  asset_id: string;
  type: string;
  condition: string;
  reason: string;
  decommission_date: string;
  assigned_to: string;
  email: string;
  unit: string;
  division: string;
  description: string;
  assigned_date: string;
  purchased_date: string;
  last_updated: string;
}

interface DecommissionedAssetTableRowProps {
  asset: DecommissionedAsset;
  onView: (asset: any) => void;
  onEdit: (asset: any) => void;
  onDelete: (asset: any) => void;
  formatDate: (date: string) => string;
}

export const DecommissionedAssetTableRow: React.FC<DecommissionedAssetTableRowProps> = ({
  asset,
  onView,
  onEdit,
  onDelete,
  formatDate
}) => {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Asset name: ${asset.name}`}>
          {asset.name}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Asset ID: ${asset.asset_id}`}>
          {asset.asset_id}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Asset type: ${asset.type}`}>
          {asset.type}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Reason for decommissioning: ${asset.reason}`}>
          {asset.reason}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Last assigned to: ${asset.assigned_to}`}>
          {asset.assigned_to}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={asset.email}>
          {asset.email}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={asset.unit}>
          {asset.unit}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={asset.division}>
          {asset.division}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Decommissioned on: ${formatDate(asset.decommission_date)}`}>
          {formatDate(asset.decommission_date)}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Purchased on: ${formatDate(asset.purchased_date)}`}>
          {formatDate(asset.purchased_date)}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        <TooltipWrapper content={asset.description}>
          {asset.description}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="text-right sticky right-0 bg-white z-10">
        <TableActions 
          asset={asset as any}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
