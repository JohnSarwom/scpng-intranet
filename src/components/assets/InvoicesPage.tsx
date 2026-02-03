
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Filter, RotateCcw, Download, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  assetName: string;
  assetId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paymentDate?: string;
  attachmentUrl?: string;
}

// Sample data
const sampleInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2023-001",
    vendorName: "Dell Inc.",
    assetName: "DELL E2318H",
    assetId: "DELL-001",
    amount: 399.99,
    issueDate: "2023-01-15",
    dueDate: "2023-02-15",
    status: "paid",
    paymentDate: "2023-02-10",
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-002",
    vendorName: "Canon",
    assetName: "Canon ImageRUNNER ADVANCE DX C3730",
    assetId: "CANON-001",
    amount: 2499.99,
    issueDate: "2023-02-20",
    dueDate: "2023-03-20",
    status: "paid",
    paymentDate: "2023-03-15",
  },
  {
    id: "3",
    invoiceNumber: "INV-2023-003",
    vendorName: "HP Inc.",
    assetName: "HP ProLiant DL380",
    assetId: "HP-001",
    amount: 5499.99,
    issueDate: "2023-03-05",
    dueDate: "2023-04-05",
    status: "pending",
  },
  {
    id: "4",
    invoiceNumber: "INV-2023-004",
    vendorName: "Apple",
    assetName: "MacBook Pro",
    assetId: "APPLE-001",
    amount: 1999.99,
    issueDate: "2023-03-15",
    dueDate: "2023-04-15",
    status: "overdue",
  },
];

export function InvoicesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("invoiceNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Extract unique vendors for filter
  const vendors = [...new Set(sampleInvoices.map((invoice) => invoice.vendorName))];

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort invoices
  const filteredInvoices = sampleInvoices
    .filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.assetId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      const matchesVendor = vendorFilter === "all" || invoice.vendorName === vendorFilter;

      return matchesSearch && matchesStatus && matchesVendor;
    })
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof Invoice];
      const bValue = b[sortColumn as keyof Invoice];

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
    setVendorFilter("all");
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
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full text-xs";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full text-xs";
      case "overdue":
        return "bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded-full text-xs";
    }
  };

  // Action handlers
  const handleAddInvoice = () => {
    toast({
      title: "Coming Soon",
      description: "Add invoice functionality will be available soon.",
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast({
      title: "View Invoice",
      description: `Viewing invoice ${invoice.invoiceNumber}`,
    });
  };

  const handleEditInvoice = (invoice: Invoice) => {
    toast({
      title: "Edit Invoice",
      description: `Editing invoice ${invoice.invoiceNumber}`,
    });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    toast({
      title: "Delete Invoice",
      description: `Deleting invoice ${invoice.invoiceNumber}`,
    });
  };

  const handleDownloadAll = () => {
    toast({
      title: "Download Invoices",
      description: "Downloading all filtered invoices. Feature coming soon.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <TooltipWrapper content="Add new invoice">
          <Button 
            onClick={handleAddInvoice}
            className="bg-red-800 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Invoice
          </Button>
        </TooltipWrapper>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <TooltipWrapper content="Search invoices">
            <Input
              placeholder="Search by invoice #, vendor, asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </TooltipWrapper>
        </div>

        <div className="flex flex-wrap gap-3">
          <TooltipWrapper content="Filter by status">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </TooltipWrapper>

          <TooltipWrapper content="Filter by vendor">
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipWrapper>

          <TooltipWrapper content="Reset all filters">
            <Button variant="outline" onClick={resetFilters} className="gap-1">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </TooltipWrapper>

          <div className="flex-grow"></div>

          <TooltipWrapper content="Download all invoices">
            <Button variant="outline" onClick={handleDownloadAll} className="gap-1">
              <Download className="h-4 w-4" /> Download All
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
                      onClick={() => handleSort("invoiceNumber")}
                    >
                      <TooltipWrapper content="Click to sort by invoice number">
                        <div className="flex items-center">
                          Invoice # {renderSortIndicator("invoiceNumber")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("vendorName")}
                    >
                      <TooltipWrapper content="Click to sort by vendor">
                        <div className="flex items-center">
                          Vendor {renderSortIndicator("vendorName")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("assetName")}
                    >
                      <TooltipWrapper content="Click to sort by asset">
                        <div className="flex items-center">
                          Asset {renderSortIndicator("assetName")}
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
                      onClick={() => handleSort("amount")}
                    >
                      <TooltipWrapper content="Click to sort by amount">
                        <div className="flex items-center">
                          Amount {renderSortIndicator("amount")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("issueDate")}
                    >
                      <TooltipWrapper content="Click to sort by issue date">
                        <div className="flex items-center">
                          Issue Date {renderSortIndicator("issueDate")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead 
                      className="font-medium cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("dueDate")}
                    >
                      <TooltipWrapper content="Click to sort by due date">
                        <div className="flex items-center">
                          Due Date {renderSortIndicator("dueDate")}
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
                      onClick={() => handleSort("paymentDate")}
                    >
                      <TooltipWrapper content="Click to sort by payment date">
                        <div className="flex items-center">
                          Payment Date {renderSortIndicator("paymentDate")}
                        </div>
                      </TooltipWrapper>
                    </TableHead>
                    <TableHead className="text-right font-medium sticky right-0 bg-white z-20 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Invoice #: ${invoice.invoiceNumber}`}>
                            {invoice.invoiceNumber}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Vendor: ${invoice.vendorName}`}>
                            {invoice.vendorName}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <TooltipWrapper content={`Asset: ${invoice.assetName}`}>
                            {invoice.assetName}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Asset ID: ${invoice.assetId}`}>
                            {invoice.assetId}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Amount: ${formatCurrency(invoice.amount)}`}>
                            {formatCurrency(invoice.amount)}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Issue Date: ${formatDate(invoice.issueDate)}`}>
                            {formatDate(invoice.issueDate)}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Due Date: ${formatDate(invoice.dueDate)}`}>
                            {formatDate(invoice.dueDate)}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={`Status: ${invoice.status}`}>
                            <span className={getStatusBadgeClass(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TooltipWrapper content={invoice.paymentDate ? `Payment Date: ${formatDate(invoice.paymentDate)}` : 'Not paid yet'}>
                            {invoice.paymentDate ? formatDate(invoice.paymentDate) : "N/A"}
                          </TooltipWrapper>
                        </TableCell>
                        <TableCell className="text-right sticky right-0 bg-white z-10">
                          <DropdownMenu>
                            <TooltipWrapper content="Invoice actions">
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipWrapper>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInvoice(invoice)}
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
        Showing {filteredInvoices.length} of {sampleInvoices.length} invoices
      </div>
    </div>
  );
}
