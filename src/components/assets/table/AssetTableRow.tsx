import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { Asset } from "@/types/asset";
import { formatDate } from "@/lib/utils";
import { TableActions } from './TableActions';

interface AssetTableRowProps {
  asset: Asset;
  onView?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
}

export const AssetTableRow: React.FC<AssetTableRowProps> = ({
  asset,
  onView,
  onEdit,
  onDelete
}) => {
  const handleViewClick = () => {
    if (onView) {
      onView(asset);
    }
  };

  return (
    <TableRow>
      <TableCell 
        className="p-2 text-center hover:bg-muted/50 transition-colors"
        style={{ cursor: onView ? 'pointer' : 'default' }}
        onClick={handleViewClick}
      >
        <TooltipWrapper content={asset.name || "Asset image"}>
          {asset.image ? (
            <img 
              src={asset.image} 
              alt={asset.name} 
              className="w-8 h-8 mx-auto rounded-md object-cover"
            />
          ) : (
            <div className="w-8 h-8 mx-auto rounded-md bg-gray-200 flex items-center justify-center">
              {asset.name.charAt(0)}
            </div>
          )}
        </TooltipWrapper>
      </TableCell>
      <TableCell 
        className="whitespace-nowrap hover:bg-muted/50 transition-colors"
        style={{ cursor: onView ? 'pointer' : 'default' }}
        onClick={handleViewClick}
      >
        <TooltipWrapper content={`Asset name: ${asset.name}`}>
          {asset.name}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Asset ID: ${asset.asset_id || asset.id}`}>
          {asset.asset_id || asset.id}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Asset type: ${asset.type}`}>
          {asset.type}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Brand: ${asset.brand || 'N/A'}`}>
          {asset.brand}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Model: ${asset.model || 'N/A'}`}>
          {asset.model}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Serial Number: ${asset.serial_number || 'N/A'}`}>
          {asset.serial_number}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Asset condition: ${asset.condition}`}>
          {asset.condition}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={`Assigned to: ${asset.assigned_to || asset.assignedTo || 'N/A'}`}>
          {asset.assigned_to || asset.assignedTo}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={asset.email || 'N/A'}>
          {asset.email}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={asset.unit || 'N/A'}>
          {asset.unit}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={asset.division || 'N/A'}>
          {asset.division}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        <TooltipWrapper content={asset.description || 'N/A'}>
          {asset.description}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={formatDate(asset.assigned_date || asset.assignedDate) || 'N/A'}>
          {formatDate(asset.assigned_date || asset.assignedDate)}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={formatDate(asset.purchased_date || asset.purchasedDate) || 'N/A'}>
          {formatDate(asset.purchased_date || asset.purchasedDate)}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipWrapper content={formatDate(asset.last_updated || asset.lastUpdated) || 'N/A'}>
          {formatDate(asset.last_updated || asset.lastUpdated)}
        </TooltipWrapper>
      </TableCell>
      <TableCell className="text-right sticky right-0 bg-white z-10">
        <TableActions 
          asset={asset}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
