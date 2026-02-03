import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useToast } from "@/hooks/use-toast";
import { FilterGroup } from '@/components/assets/filters/FilterGroup';
import { DecommissionedAssetTableHeader } from '@/components/assets/table/DecommissionedAssetTableHeader';
import { DecommissionedAssetTableRow } from '@/components/assets/table/DecommissionedAssetTableRow';

// Sample decommissioned assets data
const decommissionedAssets = [
  {
    id: '1',
    name: 'Dell XPS 15',
    asset_id: 'DELL-001',
    type: 'Laptop',
    condition: 'Decommissioned',
    reason: 'Obsolete',
    decommission_date: '2023-01-15',
    assigned_to: 'John Doe',
    email: 'john.doe@example.com',
    unit: 'IT Unit',
    division: 'Corporate Services',
    description: 'Old laptop with damaged screen',
    assigned_date: '2020-06-01',
    purchased_date: '2020-05-15',
    last_updated: '2023-01-15'
  },
  {
    id: '2',
    name: 'HP LaserJet Pro',
    asset_id: 'HP-002',
    type: 'Printer',
    condition: 'Decommissioned',
    reason: 'Damaged',
    decommission_date: '2023-02-20',
    assigned_to: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    unit: 'Marketing',
    division: 'Corporate Services',
    description: 'Office printer with mechanical issues',
    assigned_date: '2019-03-10',
    purchased_date: '2019-02-28',
    last_updated: '2023-02-20'
  },
  {
    id: '3',
    name: 'Cisco IP Phone',
    asset_id: 'CISCO-003',
    type: 'Phone',
    condition: 'Decommissioned',
    reason: 'Replaced',
    decommission_date: '2023-03-05',
    assigned_to: 'Mike Williams',
    email: 'mike.williams@example.com',
    unit: 'Legal Advisory',
    division: 'Legal Services',
    description: 'Office phone replaced with newer model',
    assigned_date: '2018-11-15',
    purchased_date: '2018-10-30',
    last_updated: '2023-03-05'
  },
  {
    id: '4',
    name: 'Apple iMac',
    asset_id: 'APPLE-004',
    type: 'Desktop PC',
    condition: 'Decommissioned',
    reason: 'Obsolete',
    decommission_date: '2023-04-12',
    assigned_to: 'Emma Davis',
    email: 'emma.davis@example.com',
    unit: 'Design',
    division: 'Marketing',
    description: 'Design team iMac, no longer compatible with new software',
    assigned_date: '2017-08-20',
    purchased_date: '2017-08-10',
    last_updated: '2023-04-12'
  }
];

const DecommissionedAssets: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<string>('decommission_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort column click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Extract unique values for filters
  const types = [...new Set(decommissionedAssets.map(asset => asset.type))];
  const reasons = [...new Set(decommissionedAssets.map(asset => asset.reason))];
  const units = [...new Set(decommissionedAssets.map(asset => asset.unit))];
  const divisions = [...new Set(decommissionedAssets.map(asset => asset.division))];

  // Create filter options
  const filterOptions = {
    type: {
      value: typeFilter,
      options: types.map(type => ({ value: type, label: type })),
      label: 'Type',
      tooltip: 'Filter by asset type'
    },
    reason: {
      value: reasonFilter,
      options: reasons.map(reason => ({ value: reason, label: reason })),
      label: 'Reason',
      tooltip: 'Filter by decommission reason'
    },
    unit: {
      value: unitFilter,
      options: units.map(unit => ({ value: unit, label: unit })),
      label: 'Unit',
      tooltip: 'Filter by unit'
    },
    division: {
      value: divisionFilter,
      options: divisions.map(division => ({ value: division, label: division })),
      label: 'Division',
      tooltip: 'Filter by division'
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    switch(key) {
      case 'type':
        setTypeFilter(value);
        break;
      case 'reason':
        setReasonFilter(value);
        break;
      case 'unit':
        setUnitFilter(value);
        break;
      case 'division':
        setDivisionFilter(value);
        break;
    }
  };

  // Apply filters and sorting
  const filteredAssets = decommissionedAssets.filter(asset => {
    const matchesSearch = 
      searchTerm === '' || 
      Object.values(asset).some(val => 
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesReason = reasonFilter === 'all' || asset.reason === reasonFilter;
    const matchesUnit = unitFilter === 'all' || asset.unit === unitFilter;
    const matchesDivision = divisionFilter === 'all' || asset.division === divisionFilter;
    
    return matchesSearch && matchesType && matchesReason && matchesUnit && matchesDivision;
  }).sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a];
    const bValue = b[sortColumn as keyof typeof b];
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;
    
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setReasonFilter('all');
    setUnitFilter('all');
    setDivisionFilter('all');
  };

  // Handle asset actions
  const handleViewAsset = (asset: any) => {
    toast({
      title: 'View Asset',
      description: `Viewing decommissioned asset: ${asset.name}`,
    });
  };

  const handleEditAsset = (asset: any) => {
    toast({
      title: 'Edit Asset',
      description: `Editing decommissioned asset: ${asset.name}`,
    });
  };

  const handleDeleteAsset = (asset: any) => {
    toast({
      title: 'Delete Asset',
      description: `Deleting decommissioned asset: ${asset.name}`,
    });
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Decommissioned Assets</h1>
      </div>

      <FilterGroup
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />

      <Card>
        <CardContent className="p-0">
          <div className="responsive-table-container">
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              <Table>
                <DecommissionedAssetTableHeader
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-24 text-center">
                        No decommissioned assets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <DecommissionedAssetTableRow
                        key={asset.id}
                        asset={asset}
                        onView={handleViewAsset}
                        onEdit={handleEditAsset}
                        onDelete={handleDeleteAsset}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredAssets.length} of {decommissionedAssets.length} decommissioned assets
      </div>
    </div>
  );
};

export default DecommissionedAssets;
