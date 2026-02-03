import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MessageSquare, User, AlertCircle, Circle, CheckCircle, Repeat, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isBefore, parseISO, isValid, addDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BaseCard } from '@/components/ui/BaseCard';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StaffMember } from '@/types/staff';

// Extend props to include anything needed by useSortable or event handlers
export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: StaffMember;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date | null;
  endDate?: string | null;
  commentsCount?: number;
  status?: string;
  recurrence?: string;
  tags?: string[];
  subtasks?: { id: string; text: string; completed: boolean }[];
  completed?: boolean;
  className?: string;
  isDragOverlay?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: (id: string, completed: boolean) => void;
  onPriorityChange?: (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onAssigneeChange?: (id: string, assignee: StaffMember) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  high: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
  urgent: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

const statusColors = {
  todo: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  'in-progress': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  done: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done'
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  assignee,
  priority = 'medium',
  startDate,
  endDate,
  commentsCount = 0,
  status,
  recurrence,
  tags,
  subtasks,
  completed = false,
  className,
  isDragOverlay = false,
  onClick,
  onEdit,
  onDelete,
  onComplete,
  onPriorityChange,
  onAssigneeChange,
  onStatusChange
}) => {
  // State for editable dropdowns
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Refs for dropdowns
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  // Sample assignees for dropdown
  const availableAssignees: StaffMember[] = []; // This will be populated from props later

  // Check if due date is passed (checking endDate if available)
  const isDueDatePassed = React.useMemo(() => {
    const dateToCheck = endDate ? new Date(endDate) : startDate;
    if (!dateToCheck) return false;
    
    try {
      const date = new Date(dateToCheck);
      if (!isValid(date)) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return isBefore(date, today) && !completed;
    } catch (error) {
      console.error("Error parsing date:", error);
      return false;
    }
  }, [startDate, endDate, completed]);

  const subtaskProgress = React.useMemo(() => {
    if (!subtasks || subtasks.length === 0) return null;
    const completedCount = subtasks.filter(s => s.completed).length;
    return {
      completed: completedCount,
      total: subtasks.length,
      percentage: (completedCount / subtasks.length) * 100,
    };
  }, [subtasks]);

  // Handle editing priority
  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPriorityDropdown(!showPriorityDropdown);
    setShowAssigneeDropdown(false);
    setShowStatusDropdown(false);
  };

  // Handle editing assignee
  const handleAssigneeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAssigneeDropdown(!showAssigneeDropdown);
    setShowPriorityDropdown(false);
    setShowStatusDropdown(false);
  };
  
  // --- Define handleStatusClick BEFORE usage ---
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusDropdown(!showStatusDropdown);
    setShowPriorityDropdown(false);
    setShowAssigneeDropdown(false);
  };

  // --- Restore handleChangePriority --- 
  const handleChangePriority = (newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (onPriorityChange) {
      onPriorityChange(id, newPriority);
    }
    setShowPriorityDropdown(false);
  };

  // Handle changing status
  const handleChangeStatus = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
    setShowStatusDropdown(false);
  };
  
  // Handle changing assignee
  const handleChangeAssignee = (newAssignee: StaffMember) => {
    if (onAssigneeChange) {
      onAssigneeChange(id, newAssignee);
    }
    setShowAssigneeDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        (priorityDropdownRef.current && !priorityDropdownRef.current.contains(e.target as Node)) &&
        (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) &&
        (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node))
      ) {
        setShowPriorityDropdown(false);
        setShowAssigneeDropdown(false);
        setShowStatusDropdown(false);
      }
    };
    
    if (showPriorityDropdown || showAssigneeDropdown || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPriorityDropdown, showAssigneeDropdown, showStatusDropdown]);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) {
      onComplete(id, !completed);
    }
  };

  const statusLabel = status ? (statusLabels[status as keyof typeof statusLabels] || status) : '';
  const statusColor = status ? (statusColors[status as keyof typeof statusColors] || '') : '';

  // Create header content - title with optional completion checkbox
  const headerContent = (
    <div className="flex items-start gap-2">
      {onComplete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="complete-button h-5 w-5 p-0 flex-shrink-0 mt-0.5 text-muted-foreground hover:text-primary" 
                onClick={handleToggleComplete}
                onPointerDown={(e) => e.stopPropagation()}
                draggable="false"
              >
                {completed ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <Circle className="h-4 w-4" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{completed ? 'Mark as incomplete' : 'Mark as complete'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <div className={cn("text-sm font-medium leading-tight flex-grow mr-1", completed && "line-through text-muted-foreground")}>{title}</div>
    </div>
  );

  // Create header actions - edit and delete buttons
  const headerActions = (
    <>
      {onEdit && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 p-0 edit-button text-muted-foreground hover:text-foreground" 
          onClick={(e) => {
            e.stopPropagation(); 
            onEdit();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          draggable="false"
          title="Edit Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
        </Button>
      )}
      {onDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 p-0 delete-button text-muted-foreground hover:text-red-600" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => {
            // Prevent drag start on button click
            e.stopPropagation();
          }}
          draggable="false"
          title="Delete Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
        </Button>
      )}
    </>
  );

  // Create card content - description if exists
  const cardContent = description ? (
    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
  ) : undefined;

  // Create footer content - badges, dates, comments, assignee
  const footerContent = (
    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
      {isDueDatePassed && (
        <Badge variant="destructive" className="px-1.5 py-0.5 text-xs font-normal">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      )}
      {status && (
        <div className="relative inline-block" ref={statusDropdownRef}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn("px-1.5 py-0.5 text-xs font-normal border cursor-pointer", statusColor, "hover:opacity-80 transition-opacity")}
                  onClick={handleStatusClick}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {statusLabel}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Change Status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {showStatusDropdown && (
            <div className="absolute z-10 mt-1 min-w-[120px] bg-background border rounded shadow-lg py-1">
              {Object.keys(statusLabels).map(key => (
                <Button 
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={cn("w-full justify-start text-xs h-7 px-2", statusColors[key as keyof typeof statusColors] || '')}
                  onClick={(e) => { e.stopPropagation(); handleChangeStatus(key); }}
                >
                  {statusLabels[key as keyof typeof statusLabels]}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Priority Badge/Dropdown */}
      {priority && (
        <div className="relative inline-block" ref={priorityDropdownRef}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "px-1.5 py-0.5 text-xs font-normal border cursor-pointer", 
                    priorityColors[priority],
                    "hover:opacity-80 transition-opacity"
                  )}
                  onClick={handlePriorityClick}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {priority}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Change Priority</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {showPriorityDropdown && (
            <div className="absolute z-10 mt-1 w-24 bg-background border rounded shadow-lg">
              {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-7 px-2"
                  onClick={(e) => { e.stopPropagation(); handleChangePriority(p); }}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Due Date Display - Now displays range */}
      {startDate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "text-xs flex items-center text-muted-foreground", 
                    isDueDatePassed && "text-red-600 dark:text-red-500 font-semibold"
                  )}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>
                    {startDate ? format(new Date(startDate), 'MMM d') : ''}
                    {endDate && endDate !== (startDate ? format(new Date(startDate), 'MMM d') : '') ? ` - ${format(new Date(endDate), 'MMM d')}` : ''}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Date Range: {startDate ? format(new Date(startDate), 'MMM d') : ''}{endDate && endDate !== (startDate ? format(new Date(startDate), 'MMM d') : '') ? ` - ${format(new Date(endDate), 'MMM d')}` : ''}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      )}

      {commentsCount > 0 && (
        <div className="inline-flex items-center text-xs gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{commentsCount}</span>
        </div>
      )}

      {subtaskProgress && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center text-xs text-muted-foreground gap-1">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>{subtaskProgress.completed}/{subtaskProgress.total}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{subtaskProgress.percentage.toFixed(0)}% complete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {recurrence && recurrence !== 'none' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center text-xs text-muted-foreground gap-1">
                <Repeat className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Repeats {recurrence}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <div className="flex-grow"></div>
      
      {/* Assignee dropdown */}
      <div className="relative" ref={assigneeDropdownRef}>
        <div onClick={handleAssigneeClick} className="cursor-pointer">
          {assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <User className="h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>
        
        {showAssigneeDropdown && onAssigneeChange && (
          <div className="fixed inset-0 z-[100]" onClick={() => setShowAssigneeDropdown(false)}>
            <div 
              className="absolute z-[101] bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] max-h-[180px] overflow-y-auto"
              style={{ 
                right: assigneeDropdownRef.current ? (window.innerWidth - assigneeDropdownRef.current.getBoundingClientRect().right) + 'px' : '0px',
                top: (assigneeDropdownRef.current?.getBoundingClientRect().bottom + 5) + 'px'
              }}
              onClick={e => e.stopPropagation()}
            >
              {availableAssignees.map(person => (
                <button 
                  key={person.id}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeAssignee(person);
                  }}
                >
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarFallback className="text-xs">{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {person.name}
                </button>
              ))}
              
              <button 
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeAssignee({} as StaffMember);
                }}
              >
                <div className="h-5 w-5 mr-2 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                Unassign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BaseCard
      id={id}
      headerContent={headerContent}
      headerActions={headerActions}
      cardContent={cardContent}
      footerContent={footerContent}
      onClick={onClick}
      isDragging={false}
      isDragOverlay={isDragOverlay}
      cardClassName={cn(
        isDueDatePassed && "border-red-500 dark:border-red-600",
        completed && "opacity-80 bg-gray-50 dark:bg-gray-800/50",
        className
      )}
    />
  );
};

export default TaskCard;
