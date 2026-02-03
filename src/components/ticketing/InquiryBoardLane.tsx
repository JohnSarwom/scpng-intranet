import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import InquiryCard from './InquiryCard';
import { InquiryData } from './GeneralInquiries'; // Assuming InquiryData is exported

// Props needed for the lane
interface InquiryBoardLaneProps {
  id: string; // Status like 'Open', 'In Progress', 'Resolved'
  title: string; // Display title for the lane
  inquiries: InquiryData[];
  onAddInquiry?: (status: string) => void; // Optional: Trigger adding inquiry to this lane
  onEditInquiry: (id: string) => void;
  onDeleteInquiry: (id: string) => void;
  isOver?: boolean; // Passed from DndContext
  // Props passed down to InquiryCard
  getStatusBadgeClass: (status: 'Open' | 'In Progress' | 'Resolved') => string;
  getPriorityIcon: (priority: 'High' | 'Medium' | 'Low') => React.ReactNode;
  getCategoryBadgeStyle: (category: string) => React.CSSProperties;
  // For rendering drop indicator
  dropTargetInfo: {
    columnId: string | null;
    overItemId: string | null;
    isBottomHalf: boolean;
  };
}

const InquiryBoardLane: React.FC<InquiryBoardLaneProps> = ({
  id,
  title,
  inquiries,
  onAddInquiry,
  onEditInquiry,
  onDeleteInquiry,
  isOver,
  getStatusBadgeClass,
  getPriorityIcon,
  getCategoryBadgeStyle,
  dropTargetInfo,
}) => {
  const { setNodeRef, isOver: columnIsOver } = useDroppable({ id });
  const isColumnDropTarget = isOver || columnIsOver || dropTargetInfo.columnId === id;

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-muted/30 dark:bg-muted/20 rounded-lg overflow-hidden">
      <div className="p-3 font-medium flex items-center justify-between bg-muted/50 dark:bg-muted/30">
        <h3>{title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="ml-2">{inquiries.length}</Badge>
          {onAddInquiry && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={() => onAddInquiry(id)}
              title="Add Inquiry to this status"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          {/* Maybe add delete group later if needed */}
        </div>
      </div>
      <div 
        ref={setNodeRef}
        className={cn(
          "p-2 flex-grow overflow-y-auto min-h-[200px] space-y-1", // Reduced space-y for tighter fit
          isColumnDropTarget && "bg-primary/5 transition-colors duration-150",
          isColumnDropTarget && inquiries.length === 0 && "border-2 border-dashed border-primary/50 rounded-md" 
        )}
      >
        <SortableContext items={inquiries.map(inq => inq.id)} strategy={verticalListSortingStrategy}>
          {inquiries.map((inquiry) => (
            <React.Fragment key={inquiry.id}>
              {/* Drop Indicator - Top */}
              {dropTargetInfo.columnId === id && 
               dropTargetInfo.overItemId === inquiry.id && 
               !dropTargetInfo.isBottomHalf &&
                <div className="h-1 w-full bg-primary my-0.5 rounded-full"></div>
              }

              {/* Sortable Inquiry Card Wrapper */}
              <SortableInquiryCardWrapper
                inquiry={inquiry}
                onEditInquiry={onEditInquiry}
                onDeleteInquiry={onDeleteInquiry}
                getStatusBadgeClass={getStatusBadgeClass}
                getPriorityIcon={getPriorityIcon}
                getCategoryBadgeStyle={getCategoryBadgeStyle}
              />

              {/* Drop Indicator - Bottom */}
              {dropTargetInfo.columnId === id && 
               dropTargetInfo.overItemId === inquiry.id && 
               dropTargetInfo.isBottomHalf && 
                <div className="h-1 w-full bg-primary my-0.5 rounded-full"></div>
              }
            </React.Fragment>
          ))}
          
          {/* Drop Indicator - End of Column (if dropping at the end) */}
           {dropTargetInfo.columnId === id && 
            dropTargetInfo.overItemId === null && 
            inquiries.length > 0 && // Only show if column has items but not hovering over one
             <div className="h-1 w-full bg-primary mt-1 rounded-full"></div>
           }
        </SortableContext>

        {/* Placeholder for empty column drop */}
        {isColumnDropTarget && inquiries.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-md">
            <p className="text-sm text-muted-foreground">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Separate Sortable Wrapper for InquiryCard to use useSortable hook
const SortableInquiryCardWrapper = ({ 
  inquiry,
  onEditInquiry,
  onDeleteInquiry,
  getStatusBadgeClass,
  getPriorityIcon,
  getCategoryBadgeStyle
}: { 
  inquiry: InquiryData;
  onEditInquiry: (id: string) => void;
  onDeleteInquiry: (id: string) => void;
  getStatusBadgeClass: (status: 'Open' | 'In Progress' | 'Resolved') => string;
  getPriorityIcon: (priority: 'High' | 'Medium' | 'Low') => React.ReactNode;
  getCategoryBadgeStyle: (category: string) => React.CSSProperties;
}) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging
  } = useSortable({ id: inquiry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <InquiryCard
        {...inquiry} 
        onEdit={onEditInquiry}
        onDelete={onDeleteInquiry}
        getStatusBadgeClass={getStatusBadgeClass}
        getPriorityIcon={getPriorityIcon}
        getCategoryBadgeStyle={getCategoryBadgeStyle}
        isDragging={isDragging}
      />
    </div>
  );
}

export default InquiryBoardLane; 