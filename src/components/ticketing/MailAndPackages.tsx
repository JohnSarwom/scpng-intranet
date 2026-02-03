import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Filter,
  User,
  Tag,
  Plus,
  Search,
  LayoutGrid,
  GripHorizontal,
  List,
  Mail,
  Box,
  Clock,
  Check,
  Pencil,
  MoreVertical,
  CheckCircle,
  Undo,
  AlertCircle,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid, isBefore, addDays, subDays, subMonths, subWeeks, isAfter, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import MailPackageDialog from './MailPackageDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

export type MailPackageStatus = 'Received' | 'Pending Pickup' | 'Delivered' | 'Signature Required';
export type MailPackageType = 'Mail' | 'Package';

export interface MailPackageData {
  id?: string;
  type: MailPackageType;
  title: string;
  from?: string;
  tracking?: string;
  recipientName: string;
  recipientUnit?: string;
  receivedDate: Date;
  status: MailPackageStatus;
  notes?: string;
  pickedUpDate?: Date | null;
  pickedUpBy?: string;
}

interface MailPackageItemProps extends MailPackageData {
  id: string;
  initials: string;
  receivedDateTimeStr: string;
  statusIcon: React.ElementType;
  statusColorKey: 'blue' | 'green' | 'yellow' | 'gray';
  statusLabel: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: MailPackageStatus) => void;
  recipientUnit?: string;
}

interface ItemToDelete {
  id: string;
  name?: string;
}

type ViewMode = 'list' | 'grid';

const getInitials = (name: string): string => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

const statusMap: { [key in MailPackageStatus]: { icon: React.ElementType; colorKey: 'blue' | 'green' | 'yellow' | 'gray'; label: string } } = {
  'Received': { icon: Mail, colorKey: 'gray', label: 'Received' },
  'Pending Pickup': { icon: Clock, colorKey: 'blue', label: 'Pending Pickup' },
  'Signature Required': { icon: AlertCircle, colorKey: 'yellow', label: 'Signature Req.' },
  'Delivered': { icon: CheckCircle, colorKey: 'green', label: 'Delivered' },
};

const statusColors: { [key: string]: string } = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
};

// Add a map specifically for text colors for dropdown items
const statusTextColors: { [key: string]: string } = {
  blue: 'text-blue-800 dark:text-blue-300',
  green: 'text-green-800 dark:text-green-300',
  yellow: 'text-yellow-800 dark:text-yellow-300',
  gray: 'text-gray-800 dark:text-gray-300',
};

const typeIconBgColors: { [key in MailPackageType]: string } = {
  Mail: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  Package: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

const initialMailItems: MailPackageData[] = [
  { id: 'MP-001', type: 'Mail', title: 'Priority Mail', from: 'Amazon Customer Service', tracking: '#USPS123456789', recipientName: 'David Kim', recipientUnit: 'Marketing Dept.', receivedDate: new Date(2023, 3, 15, 10, 15), status: 'Pending Pickup' },
  { id: 'MP-002', type: 'Package', title: 'FedEx Delivery', from: 'Apple Inc.', tracking: '#FX987654321', recipientName: 'Sarah Johnson', recipientUnit: 'IT Department', receivedDate: new Date(2023, 3, 14, 14, 30), status: 'Delivered', pickedUpDate: new Date(2023, 3, 15, 9, 0) },
  { id: 'MP-003', type: 'Mail', title: 'Certified Letter', from: 'State Tax Department', tracking: '#USPS987654321', recipientName: 'Robert Chen', recipientUnit: 'Finance Dept.', receivedDate: new Date(2023, 3, 14, 9, 45), status: 'Signature Required' },
  { id: 'MP-004', type: 'Package', title: 'UPS Delivery', from: 'Dell Technologies', tracking: '#UPS456789123', recipientName: 'Emily Rodriguez', recipientUnit: 'HR Department', receivedDate: new Date(2023, 3, 13, 11, 20), status: 'Delivered', pickedUpDate: new Date(2023, 3, 13, 15, 0) },
  { id: 'MP-005', type: 'Mail', title: 'Standard Mail', from: 'Bank of America', tracking: 'No tracking', recipientName: 'Michael Chen', recipientUnit: 'Operations', receivedDate: new Date(2023, 3, 12, 15, 15), status: 'Pending Pickup' },
];

const initialFilters = {
  type: [
    { id: 'Mail', label: 'Mail', checked: false },
    { id: 'Package', label: 'Package', checked: false },
  ],
  status: [
    { id: 'Received', label: 'Received', checked: false },
    { id: 'Pending Pickup', label: 'Pending Pickup', checked: false },
    { id: 'Signature Required', label: 'Signature Required', checked: false },
    { id: 'Delivered', label: 'Delivered', checked: false },
  ],
  date: {
    type: null as null | 'preset' | 'custom',
    preset: null as null | 'today' | 'last-24-hours' | 'last-week' | 'last-month',
    custom: {
      from: null as Date | null,
      to: null as Date | null
    }
  }
};

const MailAndPackages: React.FC = () => {
  const [mailItems, setMailItems] = useState<MailPackageData[]>(initialMailItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MailPackageData | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [activeTab, setActiveTab] = useState<MailPackageStatus | 'All Items'>('All Items');

  // --- Handlers (Define BEFORE useMemo) ---

  const handleFilterChange = useCallback((filterType: 'type' | 'status', id: string, checked: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      const filterArray = newFilters[filterType] as Array<{ id: string, label: string, checked: boolean }>;
      const filterIndex = filterArray.findIndex(f => f.id === id);
      if (filterIndex !== -1) {
        filterArray[filterIndex].checked = checked;
      }
      return newFilters;
    });

    setActiveFilters(prev => {
      const key = `${filterType}-${id}`;
      if (checked) {
        return [...prev, key];
      } else {
        return prev.filter(f => f !== key);
      }
    });
  }, []);

  const handleDateFilterChange = useCallback(( newDateFilter: typeof initialFilters.date) => {
     setFilters(prev => ({ ...prev, date: newDateFilter }));

     // Update active filters based on the new date state
     setActiveFilters(prevActive => {
       let nextActive = prevActive.filter(f => !f.startsWith('date-')); // Remove old date filters
       if (newDateFilter.type === 'preset' && newDateFilter.preset) {
         nextActive.push(`date-${newDateFilter.preset}`);
       } else if (newDateFilter.type === 'custom' && (newDateFilter.custom.from || newDateFilter.custom.to)) {
         nextActive.push('date-custom');
       }
       return nextActive;
     });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilters([]);
    setSearchQuery('');
  }, []);


  const handleCreateItem = useCallback(() => {
    setEditingItem(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditItem = useCallback((id: string) => {
    const item = mailItems.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
      setIsDialogOpen(true);
    }
  }, [mailItems]);

  const handleDeleteRequest = useCallback((id: string) => {
    const item = mailItems.find(i => i.id === id);
    if (item) {
      setItemToDelete({ id, name: `${item.type} for ${item.recipientName}` });
      setIsConfirmDeleteDialogOpen(true);
    }
  }, [mailItems]);

  const confirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    setMailItems(prev => prev.filter(item => item.id !== itemToDelete.id));
    setItemToDelete(null);
    setIsConfirmDeleteDialogOpen(false);
    // TODO: Add toast notification for deletion
  }, [itemToDelete]);

  const cancelDelete = useCallback(() => {
    setItemToDelete(null);
    setIsConfirmDeleteDialogOpen(false);
  }, []);

  const handleItemSubmit = useCallback((data: MailPackageData) => {
    setMailItems(prev => {
      if (data.id) {
        // Update existing item
        return prev.map(item => item.id === data.id ? data : item);
      } else {
        // Add new item with a unique ID
        return [{ ...data, id: `MP-${Date.now()}` }, ...prev];
      }
    });
    setIsDialogOpen(false);
     // TODO: Add toast notification for add/update
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: MailPackageStatus) => {
    setMailItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, status: newStatus };
        // If changing to Delivered, set pickedUpDate
        if (newStatus === 'Delivered' && !item.pickedUpDate) {
            updatedItem.pickedUpDate = new Date();
            // Optionally set pickedUpBy later if needed
        }
        // If changing away from Delivered, clear pickedUpDate
        else if (newStatus !== 'Delivered') {
            updatedItem.pickedUpDate = null;
            updatedItem.pickedUpBy = undefined;
        }
        return updatedItem;
      }
      return item;
    }));
     // TODO: Add toast notification for status change
  }, []);

  // --- Filtering Logic ---
  const filteredMailItems = useMemo(() => {
    return mailItems
      .map(item => ({ // Map to include display properties once
        ...item,
        id: item.id!, // Assert ID exists after initial load/creation
        initials: getInitials(item.recipientName),
        receivedDateTimeStr: `${format(item.receivedDate, 'MMM d, yyyy')} at ${format(item.receivedDate, 'h:mm a')}`,
        statusIcon: statusMap[item.status].icon,
        statusColorKey: statusMap[item.status].colorKey,
        statusLabel: statusMap[item.status].label,
        // Pass handlers down to props for item components
        onEdit: handleEditItem, 
        onDelete: handleDeleteRequest,
        onStatusChange: handleStatusChange,
      }))
      .filter(item => {
        // ... (filtering conditions as before) ...
         // 1. Inner Tab Filter
        if (activeTab !== 'All Items' && item.status !== activeTab) {
          return false;
        }

        // 2. Search Query Filter
        if (searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase().trim();
          const searchableFields = [
            item.title,
            item.from,
            item.tracking,
            item.recipientName,
            item.recipientUnit,
            item.status,
            item.notes
          ];
          const queryMatch = searchableFields.some(field =>
            field?.toLowerCase().includes(lowerQuery)
          );
          if (!queryMatch) return false;
        }

        // 3. Advanced Filters
        if (activeFilters.length > 0) {
          // Check Type filters
          const typeFilters = filters.type.filter(f => f.checked).map(f => f.id);
          if (typeFilters.length > 0 && !typeFilters.includes(item.type)) {
            return false;
          }

          // Check Status filters
          const statusFilters = filters.status.filter(f => f.checked).map(f => f.id);
          if (statusFilters.length > 0 && !statusFilters.includes(item.status)) {
            return false;
          }

           // Check date filters
          if (filters.date.type) {
            const itemDate = item.receivedDate; // Filter based on received date
            if (!itemDate) return true; // Should always have a date, but safeguard

            const today = startOfDay(new Date());

            if (filters.date.type === 'preset') {
                let startDate: Date | null = null;
                const endDate = endOfDay(today); // Most presets are up to today

                switch(filters.date.preset) {
                    case 'today':
                        startDate = today;
                        break;
                    case 'last-24-hours':
                        startDate = subDays(new Date(), 1); // From now, not start of yesterday
                        break;
                    case 'last-week':
                        startDate = startOfDay(subWeeks(today, 1));
                        break;
                    case 'last-month':
                        startDate = startOfDay(subMonths(today, 1));
                        break;
                }
                 if (startDate && !(isAfter(itemDate, startDate) && !isAfter(itemDate, endDate))) {
                     return false;
                 }

            } else if (filters.date.type === 'custom') {
                const { from, to } = filters.date.custom;
                const rangeStart = from ? startOfDay(from) : null;
                const rangeEnd = to ? endOfDay(to) : null;

                if (rangeStart && isBefore(itemDate, rangeStart)) return false;
                if (rangeEnd && isAfter(itemDate, rangeEnd)) return false;
            }
          }
        }
        return true; // Include item if it passes all checks
      })
      .sort((a, b) => b.receivedDate.getTime() - a.receivedDate.getTime()); // Sort by most recent first
  }, [mailItems, searchQuery, filters, activeFilters, activeTab, handleEditItem, handleDeleteRequest, handleStatusChange]); // Dependencies updated

  // --- Render Logic ---

  const renderListItem = (item: MailPackageItemProps) => (
    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
      {/* Type Icon */}
      <div className="col-span-1 flex items-center justify-center md:justify-start">
        <div className={`w-10 h-10 ${typeIconBgColors[item.type]} rounded-full flex items-center justify-center flex-shrink-0`}>
          {item.type === 'Mail' ? <Mail className="h-5 w-5" /> : <Box className="h-5 w-5" />}
        </div>
      </div>

      {/* Details */}
      <div className="col-span-1 md:col-span-3">
        <h4 className="font-medium text-gray-800 dark:text-gray-100">{item.title}</h4>
        {item.from && <p className="text-sm text-gray-500 dark:text-gray-400">From: {item.from}</p>}
        {item.tracking && <p className="text-sm text-gray-500 dark:text-gray-400">Tracking: {item.tracking}</p>}
         {item.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Note: {item.notes}</p>}
      </div>

      {/* Recipient */}
      <div className="col-span-1 md:col-span-2">
         <div className="flex items-center">
           <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 mr-2 font-medium flex-shrink-0">
             {item.initials}
           </div>
           <span className="text-sm text-gray-800 dark:text-gray-100">{item.recipientName}</span>
         </div>
         {item.recipientUnit && <p className="text-sm text-gray-500 dark:text-gray-400 md:mt-1">{item.recipientUnit}</p>}
       </div>

      {/* Received Date/Time */}
      <div className="col-span-1 md:col-span-2">
        <p className="text-sm text-gray-700 dark:text-gray-200">{format(item.receivedDate, 'MMM d, yyyy')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{format(item.receivedDate, 'h:mm a')}</p>
      </div>

      {/* Status - Now a Dropdown */}
      <div className="col-span-1 md:col-span-2 flex items-center">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="outline" className={cn("h-auto px-2 py-0.5 text-xs border whitespace-nowrap", statusColors[item.statusColorKey])}>
                     <item.statusIcon className="h-3 w-3 mr-1" />
                     {item.statusLabel}
                     <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                 <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {(Object.keys(statusMap) as MailPackageStatus[]).map((statusKey) => {
                     const StatusIcon = statusMap[statusKey].icon;
                     const colorKey = statusMap[statusKey].colorKey; // Get the color key
                     const textColorClass = statusTextColors[colorKey]; // Get the text color class
                     return (
                         <DropdownMenuItem
                             key={statusKey}
                             disabled={item.status === statusKey}
                             onClick={() => item.onStatusChange(item.id, statusKey)}
                             // Apply the text color class along with existing styles
                             className={cn("text-xs font-medium", textColorClass)}
                         >
                             <StatusIcon className={cn("h-3 w-3 mr-2", textColorClass)} /> {/* Optionally color the icon too */}
                             {statusMap[statusKey].label}
                         </DropdownMenuItem>
                     );
                 })}
             </DropdownMenuContent>
         </DropdownMenu>
       </div>

      {/* Actions */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end space-x-1">
        {/* Edit */}
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Edit Item"
            onClick={() => item.onEdit(item.id)}
            >
          <Pencil className="h-4 w-4" />
        </Button>
         {/* Delete - Changed color to match pencil */}
         <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
             title="Delete Item"
             onClick={() => item.onDelete(item.id)}
             >
           <Trash2 className="h-4 w-4" />
         </Button>
      </div>
    </div>
  );

   const renderGridItem = (item: MailPackageItemProps) => (
    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col p-4">
        <div className="flex items-center justify-between mb-3">
             <div className={`w-8 h-8 ${typeIconBgColors[item.type]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {item.type === 'Mail' ? <Mail className="h-4 w-4" /> : <Box className="h-4 w-4" />}
             </div>
             <Badge variant="outline" className={`whitespace-nowrap border text-xs ${statusColors[item.statusColorKey]}`}>
                <item.statusIcon className="h-3 w-3 mr-1" />
                {item.statusLabel}
             </Badge>
        </div>

        <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-1 text-sm line-clamp-2">{item.title}</h4>
        {item.from && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From: {item.from}</p>}
        {item.tracking && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tracking: {item.tracking}</p>}

         <div className="flex items-center mt-auto pt-3 border-t dark:border-gray-700/50">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 mr-2 font-medium flex-shrink-0">
                {item.initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 dark:text-gray-100 truncate">{item.recipientName}</p>
                {item.recipientUnit && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.recipientUnit}</p>}
            </div>
         </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{format(item.receivedDate, 'MMM d, h:mm a')}</p>

         {/* Grid Actions - Updated to cycle through all statuses */}
        <div className="flex items-center justify-end space-x-1 mt-2 -mr-2">
            {/* Received -> Pending Pickup */}
            { item.status === 'Received' && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-600" title="Mark Pending Pickup" onClick={() => item.onStatusChange(item.id, 'Pending Pickup')}><Clock className="h-3.5 w-3.5" /></Button>
            )}
            {/* Pending Pickup -> Signature Required */}
            { item.status === 'Pending Pickup' && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-yellow-600" title="Mark Signature Required" onClick={() => item.onStatusChange(item.id, 'Signature Required')}><AlertCircle className="h-3.5 w-3.5" /></Button>
            )}
            {/* Signature Required -> Delivered */}
            { item.status === 'Signature Required' && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-green-600" title="Mark Delivered" onClick={() => item.onStatusChange(item.id, 'Delivered')}><Check className="h-3.5 w-3.5" /></Button>
            )}
            {/* Delivered -> Received (Cycle back) */}
            { item.status === 'Delivered' && (
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600" title="Mark Received" onClick={() => item.onStatusChange(item.id, 'Received')}><Undo className="h-3.5 w-3.5" /></Button>
            )}
            {/* Keep Edit and Delete buttons */}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600" title="Edit" onClick={() => item.onEdit(item.id)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" title="Delete" onClick={() => item.onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
    </div>
   );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-[500px]">
      {/* Filters Row */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
             {/* Date Filter */}
             <DropdownMenu>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span>
                            {filters.date.type === 'preset' ? `Date: ${filters.date.preset}` :
                             filters.date.custom.from ? `Date: Custom` : 'Date: All Time'}
                           </span>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0" align="start">
                       <Calendar
                           mode="range"
                           defaultMonth={filters.date.custom.from ?? filters.date.custom.to ?? new Date()}
                           selected={{ from: filters.date.custom.from, to: filters.date.custom.to }}
                           onSelect={(range) => {
                             const newDateFilter = { ...filters.date, type: 'custom' as const, preset: null, custom: { from: range?.from || null, to: range?.to || null } };
                             handleDateFilterChange(newDateFilter);
                           }}
                           numberOfMonths={1} // Simpler range picker
                       />
                       <div className='p-2 border-t'>
                           <div className="grid grid-cols-2 gap-2 text-sm">
                               <Button variant={filters.date.preset === 'today' ? 'secondary': 'ghost'} size="sm" className='justify-start' onClick={() => handleDateFilterChange({...filters.date, type: 'preset', preset: 'today', custom:{from:null, to:null}})}>Today</Button>
                               <Button variant={filters.date.preset === 'last-week' ? 'secondary': 'ghost'} size="sm" className='justify-start' onClick={() => handleDateFilterChange({...filters.date, type: 'preset', preset: 'last-week', custom:{from:null, to:null}})}>Last Week</Button>
                               <Button variant={filters.date.preset === 'last-24-hours' ? 'secondary': 'ghost'} size="sm" className='justify-start' onClick={() => handleDateFilterChange({...filters.date, type: 'preset', preset: 'last-24-hours', custom:{from:null, to:null}})}>Last 24 Hours</Button>
                               <Button variant={filters.date.preset === 'last-month' ? 'secondary': 'ghost'} size="sm" className='justify-start' onClick={() => handleDateFilterChange({...filters.date, type: 'preset', preset: 'last-month', custom:{from:null, to:null}})}>Last Month</Button>
                           </div>
                       </div>
                       {(filters.date.type !== null) &&
                           <div className="p-2 border-t flex justify-end">
                               <Button variant="ghost" size="sm" onClick={() => handleDateFilterChange(initialFilters.date)}>Clear Date Filter</Button>
                           </div>
                       }
                     </PopoverContent>
                 </Popover>
             </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>Type</span>
                    {filters.type.filter(f => f.checked).length > 0 &&
                        <Badge variant="secondary" className="ml-2 rounded-full px-1.5 text-xs">{filters.type.filter(f => f.checked).length}</Badge>
                    }
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {filters.type.map(filter => (
                  <DropdownMenuCheckboxItem
                    key={filter.id}
                    checked={filter.checked}
                    onCheckedChange={(checked) => handleFilterChange('type', filter.id, !!checked)}
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Tag className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>Status</span>
                     {filters.status.filter(f => f.checked).length > 0 &&
                        <Badge variant="secondary" className="ml-2 rounded-full px-1.5 text-xs">{filters.status.filter(f => f.checked).length}</Badge>
                    }
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {filters.status.map(filter => (
                  <DropdownMenuCheckboxItem
                    key={filter.id}
                    checked={filter.checked}
                    onCheckedChange={(checked) => handleFilterChange('status', filter.id, !!checked)}
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

             {/* Reset Button */}
              {activeFilters.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-500">
                   Reset Filters
                 </Button>
              )}

          </div>
          {/* Add New Button */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="flex items-center bg-primary hover:bg-primary/90" onClick={handleCreateItem}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Mail/Package</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs and Search/View Toggle Row */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Inner Tabs - Removed overflow-x-auto and scrollbar-hide */}
          <div className="flex-grow"> {/* Allow tabs container to take available space */}
            <div className="flex flex-wrap dark:border-gray-700 -mb-px"> {/* Removed border-b */}
               {(['All Items', ...Object.keys(statusMap)] as Array<MailPackageStatus | 'All Items'>).map(tabKey => (
                     <button
                         key={tabKey}
                         onClick={() => setActiveTab(tabKey)}
                         className={cn(
                             "px-4 py-2 text-sm font-medium border-b-2",
                             activeTab === tabKey
                                 ? "border-primary text-primary"
                                 : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600"
                         )}
                     >
                        {tabKey === 'All Items' ? tabKey : statusMap[tabKey as MailPackageStatus].label}
                     </button>
                ))}
            </div>
          </div>
          {/* Search and View Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-64"
              />
            </div>
            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
               <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none border-r dark:border-gray-600"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
               </Button>
               <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                 <List className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area: List or Grid */}
       {filteredMailItems.length > 0 ? (
         viewMode === 'list' ? (
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border dark:border-gray-700">
             {/* List Header */}
             <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
               <div className="col-span-1 font-medium text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</div>
               <div className="col-span-3 font-medium text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Details</div>
               <div className="col-span-2 font-medium text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Recipient</div>
               <div className="col-span-2 font-medium text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Received</div>
               <div className="col-span-2 font-medium text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</div>
               <div className="col-span-2 font-medium text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Actions</div>
             </div>
             {/* List Body */}
             <div>
               {filteredMailItems.map(renderListItem)}
             </div>
           </div>
         ) : ( // Grid View
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredMailItems.map(renderGridItem)}
           </div>
         )
       ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No mail or packages found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeFilters.length > 0 || searchQuery ? "Try adjusting your search or filters." : "Add a new item to get started."}
            </p>
             {(activeFilters.length > 0 || searchQuery) &&
               <div className="mt-6">
                 <Button variant="outline" onClick={resetFilters}>
                   Clear Search & Filters
                 </Button>
               </div>
             }
          </div>
       )}

      {/* Dialogs */}
      <MailPackageDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleItemSubmit}
        initialData={editingItem}
      />

       <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item: <span className='font-medium'>{itemToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default MailAndPackages; 