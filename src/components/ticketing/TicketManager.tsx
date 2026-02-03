import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  LayoutGrid, 
  Filter, 
  Search,
  Trash2,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Kanban,
  List,
  CheckCircle,
  Circle,
  CalendarDays,
  Edit,
  MessageSquare,
  ChevronDown,
  Calendar,
  CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import TicketCard from './TicketCard';
import TicketDialog from './TicketDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
  DragOverlay,
  rectIntersection
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { format, parseISO, isValid, isBefore, addDays, subDays, subMonths, subWeeks, isAfter, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import ThemeToggle from '../layout/ThemeToggle';
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

// UserNav component
const UserNav = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Type for ticket data
export interface TicketData {
  id?: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  assigneeId?: string;
  completed: boolean;
  onComplete: () => void;
  groupId?: string;
  onStatusChange?: (id: string, status: string) => void;
  onPriorityChange?: (id: string, priority: 'Low' | 'Medium' | 'High') => void;
  onAssigneeChange?: (id: string, assignee: { name: string; avatarFallback: string }) => void;
}

// Type for ticket props
export interface TicketCardProps {
  id: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  assignee?: {
    name: string;
    avatarFallback: string;
    avatarImage?: string;
  };
  startDate?: string;
  endDate?: string;
  commentsCount?: number;
  status?: string;
  type?: string;
  createdAt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  completed: boolean;
  onComplete: (id: string, completed: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
  onPriorityChange?: (id: string, priority: 'Low' | 'Medium' | 'High') => void;
  onAssigneeChange?: (id: string, assignee: { name: string; avatarFallback: string }) => void;
}

// Type for the board data structure
interface BoardData {
  [key: string]: TicketCardProps[]; 
}

// Define the Bucket interface
interface Bucket {
  id: string;
  title: string;
}

// Type for item to delete
interface ItemToDelete {
  type: 'ticket' | 'group';
  id: string;
  name?: string; // For display in confirmation
}

// Define column type
type BoardColumnId = string;

// View modes
type ViewMode = 'board' | 'grid' | 'list';

// Sample initial data
const initialBoardData: BoardData = {
  todo: [
    { id: 'TKT-001', title: 'Implement user authentication', description: 'Set up login...', priority: 'High', startDate: 'Jul 25', endDate: 'Jul 26', assignee: { name: 'Alice', avatarFallback: 'A' }, status: 'todo', completed: false, onComplete: () => {}, onStatusChange: () => {}, onPriorityChange: () => {}, onAssigneeChange: () => {} },
    { id: 'TKT-002', title: 'Design database schema', description: 'Define tables...', priority: 'Medium', commentsCount: 2, startDate: 'Jul 27', status: 'todo', completed: false, onComplete: () => {}, onStatusChange: () => {}, onPriorityChange: () => {}, onAssigneeChange: () => {} },
  ],
  inprogress: [
    { id: 'TKT-003', title: 'Develop Ticket Board UI', description: 'Create Kanban...', priority: 'Medium', assignee: { name: 'Bob', avatarFallback: 'B' }, commentsCount: 5, startDate: 'Jul 28', endDate: 'Jul 30', status: 'inprogress', completed: false, onComplete: () => {}, onStatusChange: () => {}, onPriorityChange: () => {}, onAssigneeChange: () => {} },
  ],
  done: [
    { id: 'TKT-004', title: 'Setup project repository', priority: 'Low', assignee: { name: 'Charlie', avatarFallback: 'C' }, startDate: 'Jul 20', endDate: 'Jul 20', status: 'done', completed: false, onComplete: () => {}, onStatusChange: () => {}, onPriorityChange: () => {}, onAssigneeChange: () => {} },
  ]
};

// Initial buckets
const initialBuckets = [
  { id: 'todo', title: 'TO DO' },
  { id: 'inprogress', title: 'IN PROGRESS' },
  { id: 'done', title: 'DONE' }
];

// Initial filters
const initialFilters = {
  status: [
    { id: 'todo', label: 'New', checked: false },
    { id: 'inprogress', label: 'In Progress', checked: false },
    { id: 'done', label: 'Done', checked: false },
  ],
  priority: [
    { id: 'high', label: 'High Priority', checked: false },
    { id: 'medium', label: 'Medium Priority', checked: false },
    { id: 'low', label: 'Low Priority', checked: false },
  ],
  assignee: [
    { id: 'alice', label: 'Alice', checked: false },
    { id: 'bob', label: 'Bob', checked: false },
    { id: 'charlie', label: 'Charlie', checked: false },
    { id: 'unassigned', label: 'Unassigned', checked: false },
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

// Board lane component with improved drop handling for empty groups
const BoardLane = ({ 
  id, 
  title,
  tickets, 
  onAddTicket, 
  onEditTicket, 
  onDeleteTicket,
  onDeleteGroup,
  isOver = false,
  onRenameGroup,
  onToggleComplete,
  onPriorityChange,
  onAssigneeChange,
  onStatusChange,
  dropTargetInfo
}: { 
  id: string; 
  title: string; 
  tickets: TicketCardProps[];
  onAddTicket: () => void;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  isOver?: boolean;
  onRenameGroup: (groupId: string, newTitle: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPriorityChange: (id: string, priority: 'Low' | 'Medium' | 'High') => void;
  onAssigneeChange: (id: string, assignee: { name: string; avatarFallback: string }) => void;
  onStatusChange: (id: string, status: string) => void;
  dropTargetInfo: {
    columnId: string | null;
    overItemId: string | null;
    isBottomHalf: boolean;
  };
}) => {
  const { setNodeRef, isOver: columnIsOver } = useDroppable({ id });
  const isColumnOver = isOver || columnIsOver;
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  // Get completed and incomplete tickets
  const completedTickets = tickets.filter(ticket => ticket.completed);
  const incompleteTickets = tickets.filter(ticket => !ticket.completed);
  const hasCompletedTasks = completedTickets.length > 0;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempTitle(title);
  };

  const handleBlur = () => {
    if (tempTitle.trim()) {
      onRenameGroup(id, tempTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (tempTitle.trim()) {
        onRenameGroup(id, tempTitle);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempTitle(title);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-muted/30 dark:bg-muted/20 rounded-lg overflow-hidden">
      <div className="p-3 font-medium flex items-center justify-between bg-muted/50 dark:bg-muted/30">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-background text-foreground p-1 rounded w-full mr-2"
          />
        ) : (
          <h3 onDoubleClick={handleDoubleClick} className="cursor-pointer">{title}</h3>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="ml-2">{tickets.length}</Badge>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
            onClick={onAddTicket}
            title="Add Ticket"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
            onClick={() => onDeleteGroup(id)}
            title="Delete Group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div 
        className={cn(
          "p-2 flex-grow overflow-y-auto min-h-[200px] space-y-3",
          (isColumnOver || dropTargetInfo.columnId === id) && tickets.length === 0 && "border-2 border-dashed border-primary/50 rounded-md",
          (isColumnOver || dropTargetInfo.columnId === id) && "bg-primary/5 transition-colors duration-150"
        )} 
        ref={setNodeRef}
      >
        <SortableContext items={incompleteTickets.map(ticket => ticket.id)} strategy={verticalListSortingStrategy}>
          {incompleteTickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              {dropTargetInfo.columnId === id && 
               dropTargetInfo.overItemId === ticket.id && 
               !dropTargetInfo.isBottomHalf && 
               dropTargetInfo.overItemId !== dropTargetInfo.columnId &&
                <div className="h-1 w-full bg-red-500 my-0.5 rounded-full"></div>
              }

              <TicketCard
                {...ticket}
                id={ticket.id}
                onEdit={() => onEditTicket(ticket.id)}
                onDelete={() => onDeleteTicket(ticket.id)}
                onComplete={onToggleComplete}
                onPriorityChange={onPriorityChange}
                onAssigneeChange={onAssigneeChange}
                onStatusChange={onStatusChange}
              />

              {dropTargetInfo.columnId === id && 
               dropTargetInfo.overItemId === ticket.id && 
               dropTargetInfo.isBottomHalf && 
                <div className="h-1 w-full bg-red-500 my-0.5 rounded-full"></div>
              }
            </React.Fragment>
          ))}
          
          {dropTargetInfo.columnId === id && 
           dropTargetInfo.overItemId === null && 
           incompleteTickets.length > 0 &&
            <div className="h-1 w-full bg-red-500 mt-1 rounded-full"></div>
          }
        </SortableContext>
        
        {/* Completed tasks dropdown section */}
        {hasCompletedTasks && (
          <div className="mt-4 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowCompletedTasks(prev => !prev)}
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground py-1 px-2 rounded hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center">
                <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />
                <span>Completed tasks</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1.5">{completedTickets.length}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showCompletedTasks ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {showCompletedTasks && (
              <div className="pt-2 space-y-3">
                <SortableContext items={completedTickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {completedTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      id={ticket.id}
                      title={ticket.title}
                      description={ticket.description}
                      assignee={ticket.assignee}
                      priority={ticket.priority}
                      startDate={ticket.startDate}
                      endDate={ticket.endDate}
                      commentsCount={ticket.commentsCount}
                      status={ticket.status}
                      completed={ticket.completed}
                      onEdit={() => onEditTicket(ticket.id)}
                      onDelete={() => onDeleteTicket(ticket.id)}
                      onComplete={onToggleComplete}
                      onPriorityChange={onPriorityChange}
                      onAssigneeChange={onAssigneeChange}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </SortableContext>
              </div>
            )}
          </div>
        )}
        
        {/* Placeholder for empty column drop */}
        {(isColumnOver || dropTargetInfo.columnId === id) && tickets.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-md">
            <p className="text-sm text-muted-foreground">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Grid view component
const GridView: React.FC<{
  tickets: BoardData;
  onEditTicket: (id: string) => void;
  onDeleteTicket: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPriorityChange: (id: string, priority: 'Low' | 'Medium' | 'High') => void;
  onAssigneeChange: (id: string, assignee: { name: string; avatarFallback: string }) => void;
  onStatusChange: (id: string, status: string) => void;
  onRenameGroup: (groupId: string, newTitle: string) => void;
}> = ({ tickets, onEditTicket, onDeleteTicket, onToggleComplete, onPriorityChange, onAssigneeChange, onStatusChange, onRenameGroup }) => {
  // Flatten all tickets from all columns
  const allTickets = useMemo(() => {
    const flattened: TicketCardProps[] = [];
    Object.entries(tickets).forEach(([statusId, columnTickets]) => {
      columnTickets.forEach(ticket => {
        flattened.push({
          ...ticket,
          status: statusId
        });
      });
    });
    return flattened;
  }, [tickets]);

  if (allTickets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tickets found</div>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            id={ticket.id}
            title={ticket.title}
            description={ticket.description || ""}
            priority={ticket.priority as "High" | "Medium" | "Low"}
            assignee={ticket.assignee}
            startDate={ticket.startDate}
            endDate={ticket.endDate}
            commentsCount={ticket.commentsCount}
            status={ticket.status}
            completed={ticket.completed}
            onEdit={() => onEditTicket(ticket.id)}
            onDelete={() => onDeleteTicket(ticket.id)}
            onComplete={(id, completed) => onToggleComplete(id, completed)}
            onPriorityChange={onPriorityChange}
            onAssigneeChange={onAssigneeChange}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

// Add a ListView component for the new list view option
const ListView: React.FC<{
  tickets: BoardData;
  buckets: Bucket[];
  onEditTicket: (id: string) => void;
  onDeleteTicket: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPriorityChange: (id: string, priority: 'Low' | 'Medium' | 'High') => void;
  onAssigneeChange: (id: string, assignee: { name: string; avatarFallback: string }) => void;
  onStatusChange: (id: string, status: string) => void;
}> = ({ tickets, buckets, onEditTicket, onDeleteTicket, onToggleComplete, onPriorityChange, onAssigneeChange, onStatusChange }) => {
  // Flatten all tickets from all columns and sort by status and completion
  const allTickets = useMemo(() => {
    const flattened: (TicketCardProps & { columnId: string, columnTitle: string })[] = [];
    
    Object.entries(tickets).forEach(([columnId, columnTickets]) => {
      const bucketTitle = buckets.find(b => b.id === columnId)?.title || columnId;
      
      columnTickets.forEach(ticket => {
        flattened.push({
          ...ticket,
          columnId,
          columnTitle: bucketTitle,
          status: ticket.status || columnId
        });
      });
    });
    
    // Sort by completion status (incomplete first), then by column order
    return flattened.sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then sort by column (using the order of buckets)
      const aColumnIndex = buckets.findIndex(bucket => bucket.id === a.columnId);
      const bColumnIndex = buckets.findIndex(bucket => bucket.id === b.columnId);
      
      return aColumnIndex - bColumnIndex;
    });
  }, [tickets, buckets]);

  if (allTickets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tickets found</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-xs font-medium text-left p-3 text-muted-foreground w-10"></th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground">Title</th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground">Group Name</th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground">Status</th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground">Priority</th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground whitespace-nowrap">Date Range</th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground">Assignee</th>
              <th className="text-xs font-medium text-left p-3 text-muted-foreground w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allTickets.map((ticket) => {
              // Determine status display
              const statusLabels = {
                todo: 'New',
                inprogress: 'In Progress',
                done: 'Done'
              };
              const statusColors = {
                todo: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
                inprogress: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
                done: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400'
              };
              
              const statusKey = ticket.status as keyof typeof statusLabels;
              const statusLabel = statusLabels[statusKey] || ticket.columnTitle;
              const statusColor = statusColors[statusKey as keyof typeof statusColors] || '';
              
              // Check if due date is passed (using endDate if available)
              const isDueDatePassed = useMemo(() => {
                const dateToCheckStr = ticket.endDate || ticket.startDate;
                if (!dateToCheckStr) return false;
                
                try {
                  // Parse the date
                  let date: Date | null = null;
                  
                  if (dateToCheckStr.includes('-') || dateToCheckStr.includes('T')) {
                    date = parseISO(dateToCheckStr);
                  } else {
                    const currentYear = new Date().getFullYear();
                    const fullDateStr = `${dateToCheckStr} ${currentYear}`;
                    date = new Date(fullDateStr);
                  }
                  
                  if (!isValid(date)) return false;
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  return isBefore(date, today) && !ticket.completed;
                } catch (error) {
                  console.error("Error parsing date:", error);
                  return false;
                }
              }, [ticket.startDate, ticket.endDate, ticket.completed]);
              
              return (
                <tr 
                  key={ticket.id} 
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    ticket.completed && "bg-gray-50 dark:bg-gray-800/50"
                  )}
                >
                  <td className="p-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-primary" 
                      onClick={() => onToggleComplete(ticket.id, !ticket.completed)}
                    >
                      {ticket.completed ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <Circle className="h-4 w-4" />
                      }
                    </Button>
                  </td>
                  <td className="p-3">
                    <div className={cn("font-medium text-sm", ticket.completed && "line-through text-muted-foreground")}>
                      {ticket.title}
                    </div>
                    {ticket.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {ticket.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {ticket.columnTitle}
                    </div>
                  </td>
                  <td className="p-3">
                    {/* Wrap Badge in Dropdown for Status */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={cn("px-1.5 py-0.5 text-xs font-normal border cursor-pointer hover:opacity-80", statusColor)}                          
                        >
                          {statusLabel}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* Map through possible statuses */}
                        {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(statusKey => (
                          <DropdownMenuItem 
                            key={statusKey} 
                            onSelect={() => onStatusChange(ticket.id, statusKey)} 
                            className="text-xs"
                          >
                            {statusLabels[statusKey]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="p-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "px-1.5 py-0.5 text-xs font-normal border",
                        ticket.priority === 'High' && "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
                        ticket.priority === 'Medium' && "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
                        ticket.priority === 'Low' && "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                      )}
                    >
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {ticket.startDate ? (
                      <div className={cn("text-xs flex items-center", isDueDatePassed && "text-red-600 dark:text-red-500 font-semibold")}>
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                        <span>
                          {ticket.startDate}
                          {ticket.endDate && ticket.endDate !== ticket.startDate ? ` - ${ticket.endDate}` : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {ticket.assignee.avatarImage && (
                            <AvatarImage src={ticket.assignee.avatarImage} alt={ticket.assignee.name} />
                          )}
                          <AvatarFallback>{ticket.assignee.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{ticket.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" 
                        onClick={() => onEditTicket(ticket.id)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600" 
                        onClick={() => onDeleteTicket(ticket.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main TicketManager component
const TicketManager: React.FC = () => {
  // State for the board data
  const [boardData, setBoardData] = useState<BoardData>(initialBoardData);
  const [buckets, setBuckets] = useState(initialBuckets);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // State for managing the dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<TicketCardProps | null>(null);
  const [targetColumnForNewTicket, setTargetColumnForNewTicket] = useState<string | null>(null);
  const [renamingColumnId, setRenamingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState<string>('');
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [activeDropId, setActiveDropId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<BoardColumnId | null>(null);
  const [dropTargetInfo, setDropTargetInfo] = useState<{ 
    columnId: string | null; 
    overItemId: string | null;
    isBottomHalf: boolean; 
  }>({ columnId: null, overItemId: null, isBottomHalf: false });

  const { toast } = useToast();
  const columns = buckets;
  
  // Event listeners for global control actions
  useEffect(() => {
    const handleViewModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'board' || customEvent.detail === 'grid' || customEvent.detail === 'list') {
        setViewMode(customEvent.detail as ViewMode);
      }
    };
    
    const handleCreateTicketEvent = () => {
      // Call the function to create a new ticket
      setEditingTicket(null);
      setTargetColumnForNewTicket(null);
      setIsDialogOpen(true);
    };
    
    document.addEventListener('set-view-mode', handleViewModeChange);
    document.addEventListener('create-ticket', handleCreateTicketEvent);
    
    return () => {
      document.removeEventListener('set-view-mode', handleViewModeChange);
      document.removeEventListener('create-ticket', handleCreateTicketEvent);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find ticket helper function
  const findTicketAndColumn = (ticketId: string): { columnId: BoardColumnId, index: number, ticket: TicketCardProps } | null => {
    for (const columnId in boardData) {
      const index = boardData[columnId as BoardColumnId].findIndex(t => t.id === ticketId);
      if (index !== -1) {
        return { 
            columnId: columnId as BoardColumnId, 
            index, 
            ticket: boardData[columnId as BoardColumnId][index]
        };
      }
    }
    return null;
  }

  // Handler to open dialog for creating a new ticket
  const handleCreateTicket = () => {
    setEditingTicket(null);
    setTargetColumnForNewTicket(null);
    setIsDialogOpen(true);
  };

  // Handler to open dialog for creating a new ticket in a specific column
  const handleCreateTicketInColumn = (columnId: string) => {
    console.log("Creating ticket in column:", columnId);
    setTargetColumnForNewTicket(columnId);
    setEditingTicket(null);
    setIsDialogOpen(true);
  };

  // Handler to edit a ticket
  const handleEditTicket = (ticketId: string) => {
    const itemInfo = findTicketAndColumn(ticketId);
    if (itemInfo) {
      const { ticket, columnId } = itemInfo;
      const ticketToEdit: TicketData = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status || columnId,
        groupId: columnId,
        startDate: ticket.startDate ? new Date(ticket.startDate) : null,
        endDate: ticket.endDate ? new Date(ticket.endDate) : null,
        completed: ticket.completed,
        onComplete: () => {}
      };
      setEditingTicket(ticketToEdit);
      setIsDialogOpen(true);
    } else {
      console.error("Ticket not found for editing:", ticketId);
    }
  };

  // Filter tickets
  const getFilteredTickets = () => {
    // First filter by search query if present
    let filteredData = { ...boardData };
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      Object.keys(filteredData).forEach((columnId) => {
        filteredData[columnId] = filteredData[columnId].filter((ticket) => {
          const titleMatch = ticket.title.toLowerCase().includes(lowerQuery);
          const descriptionMatch = ticket.description && ticket.description.toLowerCase().includes(lowerQuery);
          const priorityMatch = ticket.priority.toLowerCase().includes(lowerQuery);
          const statusMatch = ticket.status && ticket.status.toLowerCase().includes(lowerQuery);
          const assigneeMatch = ticket.assignee && ticket.assignee.name.toLowerCase().includes(lowerQuery);
          
          return titleMatch || descriptionMatch || priorityMatch || statusMatch || assigneeMatch;
        });
      });
    }
    
    // Then apply additional filters if any are active
    if (activeFilters.length > 0) {
      Object.keys(filteredData).forEach((columnId) => {
        filteredData[columnId] = filteredData[columnId].filter((ticket) => {
          // Check status filters
          const statusFilters = filters.status.filter(f => f.checked).map(f => f.id);
          if (statusFilters.length > 0) {
            const matchesStatus = statusFilters.includes(ticket.status || columnId);
            if (!matchesStatus) return false;
          }
          
          // Check priority filters
          const priorityFilters = filters.priority.filter(f => f.checked).map(f => f.id);
          if (priorityFilters.length > 0) {
            const matchesPriority = priorityFilters.some(p => 
              ticket.priority && ticket.priority.toLowerCase() === p
            );
            if (!matchesPriority) return false;
          }
          
          // Check assignee filters
          const assigneeFilters = filters.assignee.filter(f => f.checked).map(f => f.id);
          if (assigneeFilters.length > 0) {
            if (assigneeFilters.includes('unassigned') && !ticket.assignee) {
              return true;
            }
            const matchesAssignee = assigneeFilters.some(a => 
              ticket.assignee?.name.toLowerCase() === a
            );
            if (!matchesAssignee && !(assigneeFilters.includes('unassigned') && !ticket.assignee)) {
              return false;
            }
          }
          
          // Check date filters
          if (filters.date.type) {
            const ticketDate = ticket.endDate ? new Date(ticket.endDate) : null;
            if (!ticketDate) return true; // If no date, include by default
            
            const today = startOfDay(new Date());
            
            if (filters.date.type === 'preset') {
              if (filters.date.preset === 'today') {
                return isSameDay(ticketDate, today);
              } else if (filters.date.preset === 'last-24-hours') {
                const yesterday = subDays(today, 1);
                return isAfter(ticketDate, yesterday);
              } else if (filters.date.preset === 'last-week') {
                const lastWeek = subWeeks(today, 1);
                return isAfter(ticketDate, lastWeek);
              } else if (filters.date.preset === 'last-month') {
                const lastMonth = subMonths(today, 1);
                return isAfter(ticketDate, lastMonth);
              }
            } else if (filters.date.type === 'custom') {
              const { from, to } = filters.date.custom;
              if (from && to) {
                return (
                  isAfter(ticketDate, startOfDay(from)) && 
                  !isAfter(ticketDate, endOfDay(to))
                );
              } else if (from) {
                return isAfter(ticketDate, startOfDay(from));
              } else if (to) {
                return !isAfter(ticketDate, endOfDay(to));
              }
            }
          }
          
          return true;
        });
      });
    }
    
    return filteredData;
  };

  // Submit handler for ticket form
  const handleTicketSubmit = (ticketData: TicketData) => {
    console.log('Submitting ticket:', ticketData);
    setBoardData((prevBoard) => {
      const newBoard = { ...prevBoard };
      const targetColumn = (ticketData.groupId || ticketData.status || 'todo') as BoardColumnId;
      if (!newBoard[targetColumn]) newBoard[targetColumn] = []; // Ensure column exists

      const cardData: TicketCardProps = {
        id: ticketData.id || `TKT-${Date.now()}`, // Use timestamp for unique ID
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        startDate: ticketData.startDate ? format(ticketData.startDate, "MMM d") : undefined,
        endDate: ticketData.endDate ? format(ticketData.endDate, "MMM d") : undefined,
        status: ticketData.status || targetColumn,
        completed: ticketData.completed,
        onComplete: () => {}
      };

      if (ticketData.id) { // Update
        let updated = false;
        for (const colId in newBoard) {
          const currentColumnId = colId as BoardColumnId;
          const items = newBoard[currentColumnId];
          const itemIndex = items.findIndex(t => t.id === ticketData.id);

          if (itemIndex !== -1) {
            if (currentColumnId === targetColumn) { // Update in same column
              items[itemIndex] = cardData;
            } else { // Moved to a different column
              items.splice(itemIndex, 1); // Remove from old column
              newBoard[targetColumn].push(cardData); // Add to new column
            }
            updated = true;
            break; 
          }
        }
        if (!updated) console.error("Ticket to update not found:", ticketData.id);
      } else { // Create
        newBoard[targetColumn].push(cardData);
      }
      return newBoard;
    });
    setIsDialogOpen(false);
    setTargetColumnForNewTicket(null); // Reset target column on close
  };

  // Handle filter changes
  const handleFilterChange = (type: keyof typeof filters, id: string, checked: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Handle array-type filters (status, priority, assignee)
      if (Array.isArray(newFilters[type])) {
        const filterArray = newFilters[type] as Array<{ id: string, label: string, checked: boolean }>;
        const filterIndex = filterArray.findIndex(f => f.id === id);
        if (filterIndex !== -1) {
          filterArray[filterIndex].checked = checked;
        }
      }
      // Date filter is handled separately in date-specific functions
      
      return newFilters;
    });
    
    // Update active filters list
    setActiveFilters(prev => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter(f => f !== id);
      }
    });
  };
  
  // Add a new bucket/column
  const addBucket = () => {
    const newBucketId = `new-bucket-${Date.now()}`;
    const newBucket = { id: newBucketId, title: 'New Bucket' };
    setBuckets(prev => [...prev, newBucket]);
    setBoardData(prev => ({ ...prev, [newBucketId]: [] }));
  };

  // Handle column rename
  const handleColumnRename = (columnId: string) => {
    if (!editingColumnName.trim()) {
      setRenamingColumnId(null);
      return;
    }
    setBuckets(prevBuckets => 
      prevBuckets.map(bucket => 
        bucket.id === columnId ? { ...bucket, title: editingColumnName.trim() } : bucket
      )
    );
    setRenamingColumnId(null); // Exit renaming mode
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    const { columnId, ticket } = findTicketAndColumn(activeId) || {};
    if (ticket) {
      setActiveDragItem({ ...ticket, id: activeId });
      setOverColumnId(null);
      setDropTargetInfo({ columnId: null, overItemId: null, isBottomHalf: false });
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, collisions } = event;
    if (!over || !activeDragItem) return;

    const overId = String(over.id);
    const activeId = String(active.id);

    // Determine if we are over a column (droppable)
    const isOverColumn = columns.some(b => b.id === overId);
    let currentOverColumnId: string | null = null;
    let currentOverItemId: string | null = null;
    let isBottomHalf = false;

    if (isOverColumn) {
      currentOverColumnId = overId;
      setOverColumnId(overId);

      // Find collision with sortable items within the column
      const collision = collisions?.find(c => 
        c.id !== active.id && 
        !columns.some(b => b.id === String(c.id))
      );

      if (collision) {
          const overRect = collision.data?.droppableContainer?.rect.current;
          if (overRect) {
              const pointerY = event.activatorEvent instanceof MouseEvent 
                                 ? event.activatorEvent.clientY 
                                 : (event.activatorEvent as TouchEvent).touches[0].clientY;
              const midpoint = overRect.top + overRect.height / 2;
              currentOverItemId = String(collision.id);
              isBottomHalf = pointerY > midpoint;
          }
      } else {
          // Over column, but no specific item collision
          currentOverItemId = null;
      }

    } else {
      // Check if 'over' is a sortable item (TicketCard)
      const { columnId: overItemColumnId, ticket: overTicket } = findTicketAndColumn(overId) || {};
      if (overTicket) {
        currentOverColumnId = overItemColumnId!;
        setOverColumnId(overItemColumnId!);
        currentOverItemId = overId;

        const overRect = over.rect;
         const pointerY = event.activatorEvent instanceof MouseEvent 
                                 ? event.activatorEvent.clientY 
                                 : (event.activatorEvent as TouchEvent).touches[0].clientY;
        const midpoint = overRect.top + overRect.height / 2;
        isBottomHalf = pointerY > midpoint;
      }
    }
    
    // Avoid updating state if the target hasn't changed significantly
    if (dropTargetInfo.columnId !== currentOverColumnId || 
        dropTargetInfo.overItemId !== currentOverItemId ||
        dropTargetInfo.isBottomHalf !== isBottomHalf) {
        setDropTargetInfo({
          columnId: currentOverColumnId,
          overItemId: currentOverItemId,
          isBottomHalf: isBottomHalf
        });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveDragItem(null);
    setOverColumnId(null);
    setDropTargetInfo({ columnId: null, overItemId: null, isBottomHalf: false });

    if (!over || !active) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    
    const { columnId: originalColumnId } = findTicketAndColumn(activeId) || {};
    if (!originalColumnId) return; // Should not happen if drag started correctly

    let targetColumnId: string | null = null;
    if (columns.some(b => b.id === overId)) {
      targetColumnId = overId;
    } else {
      const { columnId: overItemColumnId } = findTicketAndColumn(overId) || {};
      targetColumnId = overItemColumnId;
    }

    if (targetColumnId && originalColumnId !== targetColumnId) {
        // Simple status update based on column drop for now
        setBoardData(prevData => {
            const newData = { ...prevData };
            const ticketIndex = newData[originalColumnId]?.findIndex(t => t.id === activeId);
            
            if (ticketIndex > -1) {
                const [ticketToMove] = newData[originalColumnId].splice(ticketIndex, 1);
                const updatedTicket = { ...ticketToMove, status: targetColumnId! };
                
                if (!newData[targetColumnId!]) {
                  newData[targetColumnId!] = [];
                }
                // Basic append - reordering logic needs the dropTargetInfo from dragEnd
                newData[targetColumnId!].push(updatedTicket);
            }
            return newData;
        });
        // Add toast or confirmation here if needed
    } else if (targetColumnId && originalColumnId === targetColumnId) {
      // --- Reordering Logic within the same column --- 
      // This requires using dropTargetInfo saved during onDragOver or recalculated here
      // and potentially the arrayMove utility from dnd-kit/sortable
      console.log("TODO: Implement reordering within column", targetColumnId);
    }
  };

  // Delete handlers
  const handleRequestDelete = (item: ItemToDelete) => {
    setItemToDelete(item);
    setIsConfirmDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setIsConfirmDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'ticket') {
      console.log("Deleting ticket:", itemToDelete.id);
      setBoardData(prevBoard => {
        const newBoard = { ...prevBoard };
        for (const columnId in newBoard) {
          newBoard[columnId] = newBoard[columnId].filter(ticket => ticket.id !== itemToDelete.id);
        }
        return newBoard;
      });
    } else if (itemToDelete.type === 'group') {
      console.log("Deleting group:", itemToDelete.id);
      const deleteId = itemToDelete.id;
      
      setBuckets(prevBuckets => {
        const newBuckets = prevBuckets.filter(bucket => bucket.id !== deleteId);
        
        setBoardData(prevBoard => {
          const newBoard = { ...prevBoard };
          delete newBoard[deleteId]; // Remove the column
          return newBoard;
        });
        
        return newBuckets;
      });
    }

    cancelDelete(); // Close dialog and reset state
  };

  // Add group handlers
  const handleSaveNewGroup = () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return; // Don't add empty names

    // Generate a safer ID with just alphanumeric characters
    const newBucketId = `bucket-${Date.now()}`;
    const newBucket: Bucket = { id: newBucketId, title: trimmedName };

    try {
      // Update buckets state
      setBuckets(prev => [...prev, newBucket]);
      // Update board data with an empty array for the new bucket
      setBoardData(prev => ({ ...prev, [newBucketId]: [] }));
      
      // Reset state
      setIsAddingGroup(false);
      setNewGroupName('');
    } catch (error) {
      console.error("Error adding new group:", error);
      // Provide user feedback
      toast({
        title: "Error",
        description: "Failed to add new group. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelAddGroup = () => {
    setIsAddingGroup(false);
    setNewGroupName('');
  };

  // Function to handle adding a ticket to a column
  const handleAddTicketToColumn = (columnId: string) => {
    setTargetColumnForNewTicket(columnId);
    setEditingTicket(null);
    setIsDialogOpen(true);
  };

  // Function to handle ticket deletion
  const handleDeleteTicket = (ticketId: string) => {
    const itemInfo = findTicketAndColumn(ticketId);
    if (itemInfo) {
      handleRequestDelete({ 
        type: 'ticket', 
        id: ticketId, 
        name: itemInfo.ticket.title 
      });
    }
  };

  // Function to handle deleting a group
  const handleDeleteGroup = (groupId: string) => {
    const bucket = buckets.find(b => b.id === groupId);
    if (bucket) {
      handleRequestDelete({
        type: 'group',
        id: groupId,
        name: bucket.title
      });
    }
  };

  // Function to handle renaming a group
  const handleRenameGroup = (groupId: string, newTitle: string) => {
    if (newTitle.trim() === '') return;
    
    setBuckets(prevBuckets => 
      prevBuckets.map(bucket => 
        bucket.id === groupId ? { ...bucket, title: newTitle.trim() } : bucket
      )
    );
  };

  // Toggle ticket completion status
  const handleToggleComplete = (ticketId: string, completed: boolean) => {
    setBoardData(prevBoard => {
      const newBoard = { ...prevBoard };
      const itemInfo = findTicketAndColumn(ticketId);
      
      if (itemInfo) {
        const { columnId, index } = itemInfo;
        const ticket = { ...newBoard[columnId][index], completed };
        
        // Update the ticket with new completed status
        const columnTickets = [...newBoard[columnId]];
        columnTickets[index] = ticket;
        newBoard[columnId] = columnTickets;
      }
      
      return newBoard;
    });
  };

  // Handle changing priority directly from the card
  const handlePriorityChange = (ticketId: string, priority: 'Low' | 'Medium' | 'High') => {
    setBoardData(prevBoard => {
      const newBoard = { ...prevBoard };
      const itemInfo = findTicketAndColumn(ticketId);
      
      if (itemInfo) {
        const { columnId, index } = itemInfo;
        const ticket = { ...newBoard[columnId][index], priority };
        
        // Update the ticket with new priority
        const columnTickets = [...newBoard[columnId]];
        columnTickets[index] = ticket;
        newBoard[columnId] = columnTickets;
      }
      
      return newBoard;
    });
  };

  // Handle changing assignee directly from the card
  const handleAssigneeChange = (ticketId: string, assignee: { name: string; avatarFallback: string }) => {
    setBoardData(prevBoard => {
      const newBoard = { ...prevBoard };
      const itemInfo = findTicketAndColumn(ticketId);
      
      if (itemInfo) {
        const { columnId, index } = itemInfo;
        // Only update if a name was provided, otherwise remove the assignee
        const ticket = { 
          ...newBoard[columnId][index], 
          assignee: assignee.name ? assignee : undefined 
        };
        
        // Update the ticket with new assignee
        const columnTickets = [...newBoard[columnId]];
        columnTickets[index] = ticket;
        newBoard[columnId] = columnTickets;
      }
      
      return newBoard;
    });
  };

  // Handle changing status directly from the card
  const handleStatusChange = (ticketId: string, status: string) => {
    setBoardData(prevBoard => {
      const newBoard = { ...prevBoard };
      const itemInfo = findTicketAndColumn(ticketId);
      
      if (itemInfo) {
        const { columnId, index } = itemInfo;
        const ticket = { ...newBoard[columnId][index], status };
        
        // If the status change means the ticket should move to a different column
        if (status !== columnId) {
          // Remove from original column
          newBoard[columnId].splice(index, 1);
          
          // Ensure target column exists
          if (!newBoard[status]) {
            newBoard[status] = [];
          }
          
          // Add to target column
          newBoard[status].push(ticket);
        } else {
          // Just update the status
          newBoard[columnId][index] = ticket;
        }
      }
      
      return newBoard;
    });
  };

  return (
    <div className="h-full overflow-auto">
      <main className="flex-1">
        <div className="flex items-center p-4 gap-4">
          <div className="flex-1">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {filters.status.map(filter => (
                <DropdownMenuCheckboxItem
                  key={filter.id}
                  checked={filter.checked}
                  onCheckedChange={(checked) => 
                    handleFilterChange('status', filter.id, checked)
                  }
                >
                  {filter.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {filters.priority.map(filter => (
                <DropdownMenuCheckboxItem
                  key={filter.id}
                  checked={filter.checked}
                  onCheckedChange={(checked) => 
                    handleFilterChange('priority', filter.id, checked)
                  }
                >
                  {filter.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {filters.assignee.map(filter => (
                <DropdownMenuCheckboxItem
                  key={filter.id}
                  checked={filter.checked}
                  onCheckedChange={(checked) => 
                    handleFilterChange('assignee', filter.id, checked)
                  }
                >
                  {filter.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Pre-defined</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    date: {
                      ...prev.date,
                      type: 'preset',
                      preset: 'today'
                    }
                  }));
                  setActiveFilters(prev => [...prev.filter(f => !f.startsWith('date-')), 'date-today']);
                }}
                className={filters.date.type === 'preset' && filters.date.preset === 'today' ? 'bg-primary/10' : ''}
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    date: {
                      ...prev.date,
                      type: 'preset',
                      preset: 'last-24-hours'
                    }
                  }));
                  setActiveFilters(prev => [...prev.filter(f => !f.startsWith('date-')), 'date-last-24-hours']);
                }}
                className={filters.date.type === 'preset' && filters.date.preset === 'last-24-hours' ? 'bg-primary/10' : ''}
              >
                Last 24 Hours
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    date: {
                      ...prev.date,
                      type: 'preset',
                      preset: 'last-week'
                    }
                  }));
                  setActiveFilters(prev => [...prev.filter(f => !f.startsWith('date-')), 'date-last-week']);
                }}
                className={filters.date.type === 'preset' && filters.date.preset === 'last-week' ? 'bg-primary/10' : ''}
              >
                Last Week
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    date: {
                      ...prev.date,
                      type: 'preset',
                      preset: 'last-month'
                    }
                  }));
                  setActiveFilters(prev => [...prev.filter(f => !f.startsWith('date-')), 'date-last-month']);
                }}
                className={filters.date.type === 'preset' && filters.date.preset === 'last-month' ? 'bg-primary/10' : ''}
              >
                Last Month
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Manual</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="px-2 py-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.date.custom.from ? (
                        filters.date.custom.to ? (
                          <>
                            {format(filters.date.custom.from, "LLL dd, y")} - {format(filters.date.custom.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.date.custom.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="range"
                      defaultMonth={filters.date.custom.from ?? new Date()}
                      selected={{
                        from: filters.date.custom.from,
                        to: filters.date.custom.to
                      }}
                      onSelect={(range) => {
                        if (range?.from || range?.to) {
                          setFilters(prev => ({
                            ...prev,
                            date: {
                              ...prev.date,
                              type: 'custom',
                              preset: null,
                              custom: {
                                from: range.from,
                                to: range.to
                              }
                            }
                          }));
                          setActiveFilters(prev => {
                            const newFilters = prev.filter(f => !f.startsWith('date-'));
                            if (range.from || range.to) {
                               return [...newFilters, 'date-custom'];
                            }
                            return newFilters;
                          });
                        } else {
                           setFilters(prev => ({
                             ...prev,
                             date: {
                               ...prev.date,
                               type: null,
                               preset: null,
                               custom: { from: null, to: null }
                             }
                           }));
                           setActiveFilters(prev => prev.filter(f => f !== 'date-custom'));
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        date: {
                          ...prev.date,
                          type: null,
                          preset: null,
                          custom: {
                            from: null,
                            to: null
                          }
                        }
                      }));
                      setActiveFilters(prev => prev.filter(f => !f.startsWith('date-')));
                    }}
                    disabled={!filters.date.custom.from && !filters.date.custom.to}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Add New Ticket Button */}
          <Button 
            onClick={handleCreateTicket}
            className="bg-primary text-white hover:bg-primary/90 h-8"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Ticket
          </Button>
          
          {/* Reset Filter Button */}
          {activeFilters.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFilters(initialFilters); 
                setActiveFilters([]);
              }}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Reset Filters
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 border rounded-md flex items-center gap-2 bg-white dark:bg-gray-800">
              <Button
                variant={viewMode === "board" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("board")}
                className="h-8 px-2"
              >
                <Kanban className="h-4 w-4 mr-1" />
                Board
              </Button>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          {viewMode === "board" ? (
            <div className="px-4 pb-4 flex space-x-4 overflow-x-auto">
              {buckets.map(bucket => {
                const columnId = bucket.id;
                const columnTickets = getFilteredTickets()[columnId] || [];
                
                return (
                  <BoardLane
                    key={columnId}
                    id={columnId}
                    title={bucket.title}
                    tickets={columnTickets}
                    onAddTicket={() => handleAddTicketToColumn(columnId)}
                    onEditTicket={handleEditTicket}
                    onDeleteTicket={handleDeleteTicket}
                    onDeleteGroup={handleDeleteGroup}
                    isOver={overColumnId === columnId}
                    onRenameGroup={handleRenameGroup}
                    onToggleComplete={handleToggleComplete}
                    onPriorityChange={handlePriorityChange}
                    onAssigneeChange={handleAssigneeChange}
                    onStatusChange={handleStatusChange}
                    dropTargetInfo={dropTargetInfo}
                  />
                );
              })}
              {isAddingGroup ? (
                <div className="w-80 flex-shrink-0">
                  <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                      autoFocus
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveNewGroup}>Save</Button>
                      <Button size="sm" variant="outline" onClick={handleCancelAddGroup}>Cancel</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-auto flex-shrink-0 w-80 border-dashed py-3 bg-muted/20 dark:bg-muted/10 hover:bg-muted/30 dark:hover:bg-muted/20"
                  onClick={() => {
                    setIsAddingGroup(true);
                    if (viewMode !== 'board') {
                      setViewMode('board');
                    }
                  }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Group
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <GridView 
              tickets={getFilteredTickets()} 
              onEditTicket={handleEditTicket} 
              onDeleteTicket={handleDeleteTicket} 
              onToggleComplete={handleToggleComplete}
              onPriorityChange={handlePriorityChange}
              onAssigneeChange={handleAssigneeChange}
              onStatusChange={handleStatusChange}
              onRenameGroup={handleRenameGroup}
            />
          ) : (
            <ListView
              tickets={getFilteredTickets()}
              buckets={buckets}
              onEditTicket={handleEditTicket}
              onDeleteTicket={handleDeleteTicket}
              onToggleComplete={handleToggleComplete}
              onPriorityChange={handlePriorityChange}
              onAssigneeChange={handleAssigneeChange}
              onStatusChange={handleStatusChange}
            />
          )}
          
          <DragOverlay>
            {activeDragItem && (
              <TicketCard
                {...activeDragItem}
                isDragOverlay={true}
                onComplete={() => {}}
                onPriorityChange={() => {}}
                onAssigneeChange={() => {}}
                onStatusChange={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      </main>

      <TicketDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleTicketSubmit}
        initialData={editingTicket}
        defaultStatus={targetColumnForNewTicket || undefined}
        buckets={buckets}
        defaultGroup={targetColumnForNewTicket || undefined}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              {itemToDelete?.type === 'group' && ` group "${itemToDelete?.name}" and all its tickets`} 
              {itemToDelete?.type === 'ticket' && ` ticket "${itemToDelete?.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteItem} 
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

export default TicketManager;
