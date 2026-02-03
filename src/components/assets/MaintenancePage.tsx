
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { formatDate } from "@/lib/utils";
import { Plus, Search, RotateCcw, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRecord {
  id: string;
  assetName: string;
  assetId: string;
  type: "preventive" | "corrective" | "inspection";
  description: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  cost?: number;
  notes?: string;
}

// Sample data
const sampleRecords: MaintenanceRecord[] = [
  {
    id: "1",
    assetName: "Canon ImageRUNNER ADVANCE DX C3730",
    assetId: "CANON-001",
    type: "preventive",
    description: "Quarterly maintenance check and toner replacement",
    status: "scheduled",
    scheduledDate: "2023-05-15",
    technician: "John Smith",
  },
  {
    id: "2",
    assetName: "HP ProLiant DL380",
    assetId: "HP-001",
    type: "corrective",
    description: "Fan replacement and system diagnostic",
    status: "completed",
    scheduledDate: "2023-04-10",
    completedDate: "2023-04-10",
    technician: "Mike Johnson",
    cost: 350,
  },
  {
    id: "3",
    assetName: "Dell XPS 15",
    assetId: "DELL-005",
    type: "inspection",
    description: "Annual hardware inspection and software update",
    status: "in-progress",
    scheduledDate: "2023-05-01",
    technician: "Sarah Williams",
  },
  {
    id: "4",
    assetName: "Polycom VVX 450",
    assetId: "POLYCOM-002",
    type: "corrective",
    description: "Microphone malfunction repair",
    status: "cancelled",
    scheduledDate: "2023-03-22",
    notes: "Asset will be replaced instead of repaired",
  },
];

export function MaintenancePage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("scheduledDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort maintenance records
  const filteredRecords = sampleRecords
    .filter((record) => {
      const matchesSearch =
        searchQuery === "" ||
        record.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.technician && record.technician.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesType = typeFilter === "all" || record.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof MaintenanceRecord];
      const bValue = b[sortColumn as keyof MaintenanceRecord];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn === column) {
      return <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>;
    }
    return null;
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-xs";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full text-xs";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full text-xs";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded-full text-xs";
    }
  };

  // Type badge color mapping
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "preventive":
        return "bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full text-xs";
      case "corrective":
        return "bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full text-xs";
      case "inspection":
        return "bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded-full text-xs";
    }
  };

  // Action handlers
  const handleAddMaintenance = () => {
    toast({
      title: "Coming Soon",
      description: "Add maintenance record functionality will be available soon.",
    });
  };

  const handleViewRecord = (record: MaintenanceRecord) => {
    toast({
      title: "View Maintenance Record",
      description: `Viewing maintenance record for ${record.assetName}`,
    });
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    toast({
      title: "Edit Maintenance Record",
      description: `Editing maintenance record for ${record.assetName}`,
    });
  };

  const handleDeleteRecord = (record: MaintenanceRecord) => {
    toast({
      title: "Delete Maintenance Record",
      description: `Deleting maintenance record for ${record.assetName}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <TooltipWrapper content="Add new maintenance record">
          <Button 
            onClick={handleAddMaintenance}
            className="bg-red-800 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Maintenance Record
          </Button>
        </TooltipWrapper>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <TooltipWrapper content="Search maintenance records">
            <Input
              placeholder="Search by asset, description, technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </TooltipWrapper>
        </div>

        <div className="flex flex-wrap gap-3">
          <TooltipWrapper content="Filter by status">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </TooltipWrapper>

          <TooltipWrapper content="Filter by type">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </TooltipWrapper>

          <TooltipWrapper content="Reset all filters">
            <Button variant="outline" onClick={resetFilters} className="gap-1">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="responsive-table-container">
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white border-b">
                  <TableRow>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("assetName")}
                    >
                      <TooltipWrapper content="Click to sort by asset name">
                        <div className="flex items-center">
                          Asset Name {renderSortIndicator("assetName")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("assetId")}
                    >
                      <TooltipWrapper content="Click to sort by asset ID">
                        <div className="flex items-center">
                          Asset ID {renderSortIndicator("assetId")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("type")}
                    >
                      <TooltipWrapper content="Click to sort by maintenance type">
                        <div className="flex items-center">
                          Type {renderSortIndicator("type")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer max-w-[200px]"
                      onClick={() => handleSort("description")}
                    >
                      <TooltipWrapper content="Click to sort by description">
                        <div className="flex items-center">
                          Description {renderSortIndicator("description")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("status")}
                    >
                      <TooltipWrapper content="Click to sort by status">
                        <div className="flex items-center">
                          Status {renderSortIndicator("status")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("scheduledDate")}
                    >
                      <TooltipWrapper content="Click to sort by scheduled date">
                        <div className="flex items-center">
                          Scheduled Date {renderSortIndicator("scheduledDate")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("completedDate")}
                    >
                      <TooltipWrapper content="Click to sort by completed date">
                        <div className="flex items-center">
                          Completed Date {renderSortIndicator("completedDate")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("technician")}
                    >
                      <TooltipWrapper content="Click to sort by technician">
                        <div className="flex items-center">
                          Technician {renderSortIndicator("technician")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("cost")}
                    >
                      <TooltipWrapper content="Click to sort by cost">
                        <div className="flex items-center">
                          Cost {renderSortIndicator("cost")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer max-w-[200px]"
                      onClick={() => handleSort("notes")}
                    >
                      <TooltipWrapper content="Click to sort by notes">
                        <div className="flex items-center">
                          Notes {renderSortIndicator("notes")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead className="text-right font-medium sticky right-0 bg-white z-20 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        No maintenance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Asset: ${record.assetName}`}>
                            {record.assetName}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Asset ID: ${record.assetId}`}>
                            {record.assetId}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Maintenance type: ${record.type}`}>
                            <span className={getTypeBadgeClass(record.type)}>
                              {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                            </span>
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <TooltipWrapper content={record.description}>
                            {record.description}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Status: ${record.status}`}>
                            <span className={getStatusBadgeClass(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Scheduled for: ${formatDate(record.scheduledDate)}`}>
                            {formatDate(record.scheduledDate)}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={record.completedDate ? `Completed on: ${formatDate(record.completedDate)}` : 'Not completed yet'}>
                            {record.completedDate ? formatDate(record.completedDate) : "N/A"}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={record.technician || 'No technician assigned'}>
                            {record.technician || "N/A"}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={record.cost ? `$${record.cost.toFixed(2)}` : 'No cost recorded'}>
                            {record.cost ? `$${record.cost.toFixed(2)}` : "N/A"}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <TooltipWrapper content={record.notes || 'No notes'}>
                            {record.notes || "N/A"}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="text-right sticky right-0 bg-white z-10">
                          <DropdownMenu>
                            <TooltipWrapper content="Maintenance record actions">
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipWrapper>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewRecord(record)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRecord(record)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRecord(record)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {sampleRecords.length} maintenance records
      </div>
    </div>
  );
}
