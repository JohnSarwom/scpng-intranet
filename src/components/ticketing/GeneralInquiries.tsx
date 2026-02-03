import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Plus,
  Filter,
  Search,
  CalendarDays,
  User,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  MoreVertical,
  List,
  AlertTriangle, // Medium priority alternative
  Info, // Low priority
  XCircle, // High priority alternative
  ChevronDown, // For dropdown indicators
  Check, // For selected items in dropdowns
  Calendar as CalendarIcon // Renaming CalendarDays import
} from 'lucide-react';
import InquiryCard from './InquiryCard';
import { DateRange } from 'react-day-picker';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import DateRangePicker from '@/components/ui/DateRangePicker'; // Reuse DateRangePicker component

// Interface for Inquiry Data
export interface InquiryData {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  assignee?: {
    name: string;
    initials: string;
  };
  reportedBy: string;
  reportedAt: string; // Could be Date object, using string for simplicity based on HTML
  completed: boolean;
  // Add more fields as needed
}

// Sample initial data based on HTML concept
const initialInquiries: InquiryData[] = [
  { id: 'INQ-001', title: 'Building access system malfunction', description: 'East wing entry doors not responding to keycards, employees stuck outside...', priority: 'High', category: 'Facilities', status: 'In Progress', assignee: { name: 'David Kim', initials: 'DK' }, reportedBy: 'Security Team', reportedAt: '10:15 AM', completed: false },
  { id: 'INQ-002', title: 'Conference room AV system issues', description: 'Projector in Boardroom A not connecting to laptops, client meeting at 11AM...', priority: 'Medium', category: 'IT Support', status: 'Open', assignee: { name: 'Michael Chen', initials: 'MC' }, reportedBy: 'Sarah Johnson', reportedAt: '9:30 AM', completed: false },
  { id: 'INQ-003', title: 'Office supplies restock request', description: 'Marketing department running low on printer paper and pens...', priority: 'Low', category: 'Supplies', status: 'Resolved', assignee: { name: 'Robert Chen', initials: 'RC' }, reportedBy: 'Emily Rodriguez', reportedAt: '2:45 PM', completed: true },
  { id: 'INQ-004', title: 'Visitor parking full - VIP arrival', description: 'Client CEO arriving in 30 minutes, no visitor parking available...', priority: 'High', category: 'Parking', status: 'Resolved', assignee: { name: 'Sarah Johnson', initials: 'SJ' }, reportedBy: 'Front Desk', reportedAt: '1:15 PM', completed: true },
  { id: 'INQ-005', title: 'Cafeteria food quality complaint', description: "Several reports of undercooked chicken in today's lunch service...", priority: 'Medium', category: 'Food Service', status: 'In Progress', assignee: { name: 'Emily Rodriguez', initials: 'ER' }, reportedBy: 'Multiple Employees', reportedAt: '12:30 PM', completed: false },
];

// Static list of potential assignees and categories for dropdowns
const potentialAssignees = [
  { name: 'David Kim', initials: 'DK' },
  { name: 'Michael Chen', initials: 'MC' },
  { name: 'Robert Chen', initials: 'RC' },
  { name: 'Sarah Johnson', initials: 'SJ' },
  { name: 'Emily Rodriguez', initials: 'ER' },
  { name: 'System Admin', initials: 'SA' }
];

const potentialCategories = ['Facilities', 'IT Support', 'Supplies', 'Parking', 'Food Service', 'HR', 'General'];
const inquiryStatuses: ('Open' | 'In Progress' | 'Resolved')[] = ['Open', 'In Progress', 'Resolved'];
const inquiryPriorities: InquiryData['priority'][] = ['High', 'Medium', 'Low'];
type StatusTab = 'All Inquiries' | InquiryData['status'];

// Specify return type as React.ReactElement
const GeneralInquiries = (): React.ReactElement => {
  const [inquiries, setInquiries] = useState<InquiryData[]>(initialInquiries);
  const [searchQuery, setSearchQuery] = useState('');
  // Add state for filters later

  // --- Filter State ---
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('All Inquiries');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<InquiryData['priority']>>(new Set());
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set()); // Store assignee names
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  // --- End Filter State ---

  // Filter inquiries based on search query and filters
  const filteredInquiries = useMemo(() => {
    let filtered = [...inquiries];

    // 1. Filter by Active Status Tab
    if (activeStatusTab !== 'All Inquiries') {
      filtered = filtered.filter(inquiry => inquiry.status === activeStatusTab);
    }

    // 2. Filter by Selected Categories
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(inquiry => selectedCategories.has(inquiry.category));
    }

    // 3. Filter by Selected Priorities
    if (selectedPriorities.size > 0) {
      filtered = filtered.filter(inquiry => selectedPriorities.has(inquiry.priority));
    }

    // 4. Filter by Selected Assignees
    if (selectedAssignees.size > 0) {
      filtered = filtered.filter(inquiry => 
        (inquiry.assignee && selectedAssignees.has(inquiry.assignee.name)) ||
        (!inquiry.assignee && selectedAssignees.has('Unassigned')) // Handle unassigned case
      );
    }

    // 5. Filter by Date Range (using reportedAt for now, adjust if needed)
    if (dateRange?.from) {
      filtered = filtered.filter(inquiry => {
        try {
          // Basic parsing assuming time format like 'HH:MM AM/PM'. Needs robust parsing.
          // This is a placeholder. Real implementation needs date parsing/comparison logic.
          // const inquiryDate = parse(inquiry.reportedAt, 'h:mm a', new Date()); // Example, needs date-fns parse
          // For now, let's assume reportedAt is comparable or convert to Date if possible
          // This logic requires reportedAt to be a full date string or Date object.
          const inquiryDate = new Date(inquiry.reportedAt); // Highly likely to fail with just 'HH:MM AM/PM'
          if (isNaN(inquiryDate.getTime())) return true; // Skip if date invalid

          let keep = true;
          if (dateRange.from && inquiryDate < dateRange.from) keep = false;
          if (dateRange.to && inquiryDate > dateRange.to) keep = false;
          return keep;
        } catch (e) {
          console.error("Date parsing/filtering error for:", inquiry.reportedAt, e);
          return true; // Keep inquiry if date parsing fails
        }
      });
    }

    // 6. Filter by Search Query (apply last)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(inquiry => 
        inquiry.title.toLowerCase().includes(lowerQuery) ||
        inquiry.description.toLowerCase().includes(lowerQuery) ||
        inquiry.category.toLowerCase().includes(lowerQuery) ||
        inquiry.status.toLowerCase().includes(lowerQuery) ||
        inquiry.priority.toLowerCase().includes(lowerQuery) ||
        (inquiry.assignee && inquiry.assignee.name.toLowerCase().includes(lowerQuery)) ||
        inquiry.reportedBy.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [inquiries, searchQuery, activeStatusTab, selectedCategories, selectedPriorities, selectedAssignees, dateRange]);

  const getPriorityIcon = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Low': return <Info className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusBadgeClass = (status: 'Open' | 'In Progress' | 'Resolved') => {
    switch (status) {
      case 'Open': return 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';
      case 'In Progress': return 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60';
      case 'Resolved': return 'border-transparent bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-800/60';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }
    const hue = Math.abs(hash) % 360;
    // Using HSL for softer, consistent pastel-like colors, applied via inline style for dynamic hue
    // The badge component itself handles base padding and border-radius
    const badgeStyle = {
      backgroundColor: `hsl(${hue}, 70%, 90%)`, // Light background
      color: `hsl(${hue}, 50%, 40%)`,          // Darker text
      borderColor: `hsl(${hue}, 60%, 80%)`,    // Slightly darker border
    };
    // Return style object to be applied inline
    return badgeStyle;
  };

  const handleCreateInquiry = () => {
    console.log("Open New Inquiry Dialog");
    // Implement dialog opening logic here
  };

  const handleEditInquiry = (id: string) => {
    console.log("Edit inquiry:", id);
    // Implement dialog opening logic here
  };

  const handleDeleteInquiry = (id: string) => {
    console.log("Delete inquiry:", id);
    // Implement confirmation and deletion logic
    setInquiries(prev => prev.filter(inq => inq.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setInquiries(prev => 
      prev.map(inq => 
        inq.id === id ? { ...inq, completed: !inq.completed, status: !inq.completed ? 'Resolved' as const : 'Open' as const } : inq
      )
    );
  };

  // Handlers for inline updates via dropdowns
  const handleStatusUpdate = (id: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    setInquiries(prev =>
      prev.map(inq => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
    // TODO: Add API call to update backend
  };

  const handleCategoryUpdate = (id: string, newCategory: string) => {
    setInquiries(prev =>
      prev.map(inq => (inq.id === id ? { ...inq, category: newCategory } : inq))
    );
    // TODO: Add API call to update backend
  };

  const handleAssigneeUpdate = (id: string, newAssigneeName: string | null) => {
    const newAssignee = potentialAssignees.find(a => a.name === newAssigneeName) || undefined; // Allow unassigning
    setInquiries(prev =>
      prev.map(inq => (inq.id === id ? { ...inq, assignee: newAssignee } : inq))
    );
    // TODO: Add API call to update backend
  };

  // --- Filter Handlers ---
  const handleCategoryFilterChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(category);
      } else {
        next.delete(category);
      }
      return next;
    });
  };

  const handlePriorityFilterChange = (priority: InquiryData['priority'], checked: boolean) => {
    setSelectedPriorities(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(priority);
      } else {
        next.delete(priority);
      }
      return next;
    });
  };

  const handleAssigneeFilterChange = (assigneeName: string, checked: boolean) => {
    setSelectedAssignees(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(assigneeName);
      } else {
        next.delete(assigneeName);
      }
      return next;
    });
  };

  const handleStatusTabClick = (tab: StatusTab) => {
    setActiveStatusTab(tab);
  };

  // --- End Filter Handlers ---

  return (
    <div className="h-full flex flex-col p-4 bg-gray-50 dark:bg-gray-900">
      {/* Filters Bar */}
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {/* Implement Filter Dropdowns similar to TicketManager */}
            {/* Date Range Filter */}
            <DateRangePicker 
              selectedRange={dateRange} 
              onSelectRange={setDateRange} 
              placeholder="Filter by Date Range..."
              className="w-[280px]"
            />

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(selectedCategories.size > 0 && "border-primary text-primary")}>
                  <Filter className="mr-2 h-4 w-4" /> Category {selectedCategories.size > 0 && `(${selectedCategories.size})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {potentialCategories.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat}
                    checked={selectedCategories.has(cat)}
                    onCheckedChange={(checked) => handleCategoryFilterChange(cat, !!checked)}
                  >
                    {cat}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(selectedPriorities.size > 0 && "border-primary text-primary")}>
                  <Filter className="mr-2 h-4 w-4" /> Priority {selectedPriorities.size > 0 && `(${selectedPriorities.size})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {inquiryPriorities.map(prio => (
                  <DropdownMenuCheckboxItem
                    key={prio}
                    checked={selectedPriorities.has(prio)}
                    onCheckedChange={(checked) => handlePriorityFilterChange(prio, !!checked)}
                  >
                    {getPriorityIcon(prio)} <span className="ml-2">{prio}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assignee Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(selectedAssignees.size > 0 && "border-primary text-primary")}>
                  <User className="mr-2 h-4 w-4" /> Assigned To {selectedAssignees.size > 0 && `(${selectedAssignees.size})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Assignee</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                   key="Unassigned"
                   checked={selectedAssignees.has('Unassigned')}
                   onCheckedChange={(checked) => handleAssigneeFilterChange('Unassigned', !!checked)}
                 >
                   <span className="italic text-muted-foreground">Unassigned</span>
                 </DropdownMenuCheckboxItem>
                {potentialAssignees.map(assignee => (
                  <DropdownMenuCheckboxItem
                    key={assignee.initials}
                    checked={selectedAssignees.has(assignee.name)}
                    onCheckedChange={(checked) => handleAssigneeFilterChange(assignee.name, !!checked)}
                  >
                    <Avatar className="h-5 w-5 mr-2"><AvatarFallback className="text-[10px]">{assignee.initials}</AvatarFallback></Avatar>
                    {assignee.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCreateInquiry}
              className="bg-primary text-white hover:bg-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Inquiry
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs and Search/View Bar */}
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {/* Implement Tabs if needed */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {/* Functional Status Tabs */}
                {['All Inquiries', ...inquiryStatuses].map((tabStatus) => (
                  <button
                    key={tabStatus}
                    onClick={() => handleStatusTabClick(tabStatus as StatusTab)}
                    className={cn(
                      "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm",
                      activeStatusTab === tabStatus
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    )}
                  >
                    {tabStatus}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-2 flex-grow justify-end">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
         </div>
      </div>

      {/* Inquiry List View */}
      <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
          <div className="grid grid-cols-[auto_minmax(0,_4fr)_minmax(0,_2fr)_minmax(0,_2fr)_minmax(0,_2fr)_auto] gap-4 items-center p-3 px-4 border-b border-gray-200 dark:border-gray-600">
            <div className="col-span-1 text-xs font-medium text-muted-foreground"></div> {/* Checkbox/Priority Icon */}
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inquiry Details</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</div>
          </div>
        </div>
        <div>
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="grid grid-cols-[auto_minmax(200px,_4fr)_minmax(100px,_2fr)_minmax(100px,_2fr)_minmax(120px,_2fr)_auto] gap-4 items-center p-3 px-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div>
                <span title={inquiry.priority + ' Priority'}>
                  {getPriorityIcon(inquiry.priority)}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{inquiry.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={inquiry.description}>{inquiry.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Reported by {inquiry.reportedBy} at {inquiry.reportedAt}
                </div>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-xs font-normal justify-start p-1 h-auto min-w-[80px] rounded-md",
                        "hover:opacity-80 transition-opacity group-hover:border group-hover:border-dashed"
                      )}
                      style={getCategoryBadgeClass(inquiry.category)}
                    >
                      <span className="truncate mr-1">{inquiry.category}</span>
                      <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Change Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {potentialCategories.map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onSelect={() => handleCategoryUpdate(inquiry.id, cat)}
                          className="text-xs"
                        >
                          <span className="mr-2" style={{ color: getCategoryBadgeClass(cat).color }}>●</span>
                          {cat}
                          {inquiry.category === cat && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-xs font-medium justify-start p-1 h-auto min-w-[90px] rounded-md",
                        getStatusBadgeClass(inquiry.status),
                        "hover:opacity-80 transition-opacity group-hover:border group-hover:border-dashed"
                      )}
                    >
                      <span className="truncate mr-1">{inquiry.status}</span>
                      <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {inquiryStatuses.map((stat) => (
                        <DropdownMenuItem
                          key={stat}
                          onSelect={() => handleStatusUpdate(inquiry.id, stat)}
                          className="text-xs"
                        >
                          <span className={cn("mr-2 h-2 w-2 rounded-full", getStatusBadgeClass(stat).split(' ')[0])}></span>
                          {stat}
                          {inquiry.status === stat && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-normal justify-start p-1 h-auto min-w-[80px] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:border group-hover:border-dashed"
                    >
                      {inquiry.assignee ? (
                        <>
                          <Avatar className="h-5 w-5 mr-1.5">
                            <AvatarFallback className="text-[10px] bg-muted-foreground/20 text-muted-foreground">
                              {inquiry.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate mr-1">{inquiry.assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic mr-1">Unassigned</span>
                      )}
                      <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                     <DropdownMenuLabel>Assign To</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuItem
                           onSelect={() => handleAssigneeUpdate(inquiry.id, null)}
                           className="text-xs italic"
                         >
                           Unassigned
                           {!inquiry.assignee && <Check className="ml-auto h-4 w-4" />}
                         </DropdownMenuItem>
                       {potentialAssignees.map((assignee) => (
                         <DropdownMenuItem
                           key={assignee.initials}
                           onSelect={() => handleAssigneeUpdate(inquiry.id, assignee.name)}
                           className="text-xs"
                         >
                           <Avatar className="h-5 w-5 mr-1.5">
                             <AvatarFallback className="text-[10px] bg-muted-foreground/20 text-muted-foreground">
                               {assignee.initials}
                             </AvatarFallback>
                           </Avatar>
                           {assignee.name}
                           {inquiry.assignee?.name === assignee.name && <Check className="ml-auto h-4 w-4" />}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuGroup>
                   </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex justify-end items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditInquiry(inquiry.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteInquiry(inquiry.id)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-100/50 dark:focus:bg-red-800/30"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Inquiry Dialog Component here */}
      {/* <InquiryDialog isOpen={isDialogOpen} onClose={...} onSubmit={...} /> */}
    </div>
  );
};

export default GeneralInquiries; 