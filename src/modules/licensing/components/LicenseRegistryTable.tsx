import React, { useState, useMemo, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'; // Assuming these are ShadCN table components
import { Input } from '@/components/ui/input'; // ShadCN input
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'; // ShadCN select
import { Button } from '@/components/ui/button'; // ShadCN button
import { Badge } from '@/components/ui/badge'; // ShadCN badge
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    FileImage,
    Edit3,
    Trash2,
    Search,
    Filter,
    MoreVertical,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added for dropdown
import { licensesService } from '@/integrations/supabase/supabaseClient'; // Changed path to use @ alias
import { differenceInDays, isBefore, parse } from 'date-fns'; // Added for date calculations

const DOTS = '...'; // Ellipsis marker

// Helper function to generate pagination items
const getPaginationItems = (currentPage: number, totalPages: number, siblingCount = 1): (string | number)[] => {
    const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    // Default case for safety, though ideally covered above
    return Array.from({ length: totalPages }, (_, i) => i + 1);
};

// Updated LicenseRecord interface to match Supabase schema (snake_case)
interface LicenseRecord {
    id: string;
    created_at: string; // ISO timestamp string
    issued_date: string; // Format: DD/MM/YYYY
    expiry_date: string; // Format: DD/MM/YYYY
    license_number: string;
    licensee_name: string;
    regulated_activity: string; // Used as 'licenseType'
    legal_reference?: string;
    signatory_name?: string;
    signatory_title?: string;
    left_sections?: string;
    left_authorized_activity?: string;
    right_side_activity_display?: string;
    license_image_url?: string;
    license_type_id: string;
}

type LicenseStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Invalid Date';

// Helper function to parse DD/MM/YYYY dates safely
const parseDisplayDate = (dateStr: string): Date | null => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.toLowerCase() === 'dd/mm/yyyy' || dateStr.trim() === '') {
        return null;
    }
    try {
        const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
        // Check if parsing was successful by ensuring components match, e.g. day exists for the month
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // month in Date is 0-indexed
            const year = parseInt(parts[2], 10);
            if (parsedDate.getFullYear() === year && parsedDate.getMonth() === month && parsedDate.getDate() === day) {
                return parsedDate;
            }
        }
        console.warn(`Mismatch after parsing date string: ${dateStr}`);
        return null;
    } catch (error) {
        console.error(`Error parsing date string: ${dateStr}`, error);
        return null;
    }
};

const getLicenseStatus = (issuedDateStr: string, expiryDateStr: string): LicenseStatus => {
    const expiryDate = parseDisplayDate(expiryDateStr);
    // const issuedDate = parseDisplayDate(issuedDateStr); // issuedDate not strictly needed for current status logic

    if (!expiryDate) return 'Invalid Date';

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day for accurate comparison

    if (isBefore(expiryDate, today)) {
        return 'Expired';
    }

    const expiringSoonThresholdDays = 90; // e.g., 3 months
    const daysToExpiry = differenceInDays(expiryDate, today);

    if (daysToExpiry >= 0 && daysToExpiry <= expiringSoonThresholdDays) {
        return 'Expiring Soon';
    }

    return 'Active';
};

const ITEMS_PER_PAGE = 5;

const LicenseRegistryTable: React.FC = () => {
    const [allLicenses, setAllLicenses] = useState<LicenseRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [licenseTypeFilter, setLicenseTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchLicenses = async () => {
            setIsLoading(true);
            try {
                const data = await licensesService.getLicenses();
                if (data) {
                    // Assuming data from service matches LicenseRecord structure (snake_case)
                    setAllLicenses(data as LicenseRecord[]);
                } else {
                    setAllLicenses([]); // Ensure it's an array even if data is null/undefined
                }
            } catch (error) {
                console.error("Failed to fetch licenses:", error);
                setAllLicenses([]); // Set to empty array on error
                // Optionally, set an error state here to display to the user
            } finally {
                setIsLoading(false);
            }
        };
        fetchLicenses();
    }, []);

    const filteredLicenses = useMemo(() => {
        return allLicenses.filter((license) => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearchTerm =
                (license.license_number && license.license_number.toLowerCase().includes(searchTermLower)) ||
                (license.licensee_name && license.licensee_name.toLowerCase().includes(searchTermLower));

            const matchesLicenseType =
                !licenseTypeFilter || license.regulated_activity === licenseTypeFilter;

            const currentStatus = getLicenseStatus(license.issued_date, license.expiry_date);
            const matchesStatus = !statusFilter || currentStatus === statusFilter;

            return matchesSearchTerm && matchesLicenseType && matchesStatus;
        });
    }, [searchTerm, licenseTypeFilter, statusFilter, allLicenses]);

    const totalPages = Math.ceil(filteredLicenses.length / ITEMS_PER_PAGE);
    const paginatedLicenses = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLicenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLicenses, currentPage]);

    // Use the helper function to get pagination items
    const paginationItems = useMemo(() => {
        return getPaginationItems(currentPage, totalPages);
    }, [currentPage, totalPages]);

    const getStatusBadgeVariant = (status: LicenseStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'Active':
                return 'default';
            case 'Expiring Soon':
                return 'secondary';
            case 'Expired':
                return 'destructive';
            case 'Invalid Date':
            default:
                return 'outline';
        }
    };

    const uniqueLicenseTypes = useMemo(() => {
        const types = new Set(allLicenses.map(l => l.regulated_activity).filter(Boolean)); // Filter out null/undefined types
        return Array.from(types) as string[];
    }, [allLicenses]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Loading licenses...</p>
                {/* Consider adding a spinner component here */}
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-intranet-dark min-h-screen">
            <div className="container mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 border border-gray-300 dark:border-gray-600">
                {/* <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 md:mb-8">License Registry</h1> */}

                {/* Table Controls */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2 lg:col-span-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="License No. or Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="licenseTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Type</label>
                            <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
                                <SelectTrigger id="licenseTypeFilter">
                                    <SelectValue placeholder="All License Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All License Types</SelectItem>
                                    {uniqueLicenseTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="statusFilter">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Removed Apply Filters button as filtering is now instant */}
                    </div>
                </div>

                {/* Responsive Table Wrapper */}
                <div className="overflow-x-auto mt-6 mb-6">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>License Number</TableHead>
                                <TableHead>Licensee Name</TableHead>
                                <TableHead>License Type</TableHead>
                                <TableHead>Issued Date</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead> {/* Changed from Date Generated */}
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLicenses.length > 0 ? (
                                paginatedLicenses.map((license) => {
                                    const currentStatus = getLicenseStatus(license.issued_date, license.expiry_date);
                                    const createdAtDate = license.created_at ? parse(license.created_at, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date()) : null;
                                    const formattedCreatedAt = createdAtDate ? `${createdAtDate.toLocaleDateString()} ${createdAtDate.toLocaleTimeString()}` : 'N/A';

                                    return (
                                        <TableRow key={license.id}>
                                            <TableCell className="font-medium">{license.license_number || 'N/A'}</TableCell>
                                            <TableCell>{license.licensee_name || 'N/A'}</TableCell>
                                            <TableCell>{license.regulated_activity || 'N/A'}</TableCell>
                                            <TableCell>{license.issued_date || 'N/A'}</TableCell>
                                            <TableCell>{license.expiry_date || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(currentStatus)} className="whitespace-nowrap">
                                                    {currentStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formattedCreatedAt}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center space-x-1">
                                                    {/* Save Button (formerly Edit) */}
                                                    <Button variant="ghost" size="icon" title="Edit"> {/* Changed title to Edit */}
                                                        <Edit3 className="h-4 w-4 text-purple-600" />
                                                    </Button>

                                                    {/* Delete Button */}
                                                    <Button variant="ghost" size="icon" title="Delete">
                                                        <Trash2 className="h-4 w-4 text-gray-500" />
                                                    </Button>

                                                    {/* More Actions Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" title="More actions">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end"> {/* Ensure dropdown opens correctly */}
                                                            <DropdownMenuItem onClick={() => console.log('View action clicked for', license.id)}>
                                                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                                                <span>View</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => console.log('Download PDF action clicked for', license.id)}>
                                                                <FileText className="mr-2 h-4 w-4 text-red-600" />
                                                                <span>Download PDF</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => console.log('Download JPEG action clicked for', license.id)}>
                                                                <FileImage className="mr-2 h-4 w-4 text-yellow-500" />
                                                                <span>Download JPEG</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        No licenses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                aria-label="Previous Page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {paginationItems.map((item, index) => {
                                if (typeof item === 'string') { // Ellipsis
                                    return (
                                        <span key={`${item}-${index}`} className="flex items-center justify-center w-9 h-9 text-sm text-gray-500">
                                            {DOTS}
                                        </span>
                                    );
                                }
                                // Page number button
                                return (
                                    <Button
                                        key={item}
                                        variant={currentPage === item ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(item)}
                                        className="w-9 h-9 p-0"
                                        aria-label={`Go to page ${item}`}
                                    >
                                        {item}
                                    </Button>
                                );
                            })}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                aria-label="Next Page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LicenseRegistryTable; 