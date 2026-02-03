import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  Edit, 
  Trash2, 
  MoreVertical,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Circle,
  User as UserIcon
} from 'lucide-react';
import { InquiryData } from './GeneralInquiries'; // Assuming InquiryData is exported from here

// Props definition based on InquiryData and required interactions
interface InquiryCardProps extends InquiryData {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (id: string, completed: boolean) => void; // Optional for now
  onStatusChange?: (id: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
  onPriorityChange?: (id: string, priority: 'Low' | 'Medium' | 'High') => void;
  onAssigneeChange?: (id: string, assignee: { name: string; initials: string } | null) => void;
  className?: string;
  isDragging?: boolean; // For potential drag overlay styling
  isDragOverlay?: boolean; // Style for the overlay component itself
  // Functions to get styles, similar to GeneralInquiries
  getStatusBadgeClass: (status: 'Open' | 'In Progress' | 'Resolved') => string;
  getPriorityIcon: (priority: 'High' | 'Medium' | 'Low') => React.ReactNode;
  getCategoryBadgeStyle: (category: string) => React.CSSProperties;
}

const InquiryCard: React.FC<InquiryCardProps> = ({
  id,
  title,
  description,
  priority,
  category,
  status,
  assignee,
  reportedBy,
  reportedAt,
  completed,
  onEdit,
  onDelete,
  onToggleComplete, // Keep for consistency, though not used in current list view actions
  onStatusChange,   // For board drag-and-drop
  onPriorityChange, // Placeholder for future inline editing
  onAssigneeChange, // Placeholder for future inline editing
  className,
  isDragging,
  isDragOverlay,
  getStatusBadgeClass,
  getPriorityIcon,
  getCategoryBadgeStyle,
}) => {

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click or drag start
  };

  const priorityNode = getPriorityIcon(priority);
  const categoryStyle = getCategoryBadgeStyle(category);

  return (
    <Card 
      className={cn(
        "mb-3 shadow-sm hover:shadow-md transition-shadow duration-200", 
        isDragging && "opacity-50",
        isDragOverlay && "shadow-lg scale-105",
        completed && "opacity-70 bg-muted/30",
        className
      )}
      
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium leading-tight">{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleActionClick}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleActionClick}>
              <DropdownMenuItem onClick={() => onEdit(id)}>
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Badge 
           variant="outline" 
           className="text-xs font-normal justify-start p-1 h-auto rounded-md w-fit"
           style={categoryStyle}
         >
           {category}
         </Badge>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
           <div className="flex items-center gap-1" title={`Priority: ${priority}`}>
             {priorityNode}
             <span>{priority}</span>
           </div>
           <Badge variant="outline" className={cn("text-xs font-medium px-1.5 py-0.5 rounded-md", getStatusBadgeClass(status))}>
             {status}
           </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
         <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-1" title={`Assigned to ${assignee.name}`}>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-muted-foreground/20 text-muted-foreground">{assignee.initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{assignee.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground italic">
                <UserIcon className="h-3 w-3" /> Unassigned
              </div>
            )}
          </div>
        <div className="text-xs text-muted-foreground" title={`Reported at ${reportedAt}`}>
           {reportedAt} {/* Consider formatting this if it's a date object */}
        </div>
      </CardFooter>
    </Card>
  );
};

export default InquiryCard; 