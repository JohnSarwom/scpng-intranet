import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChecklistSection from '@/components/ChecklistSection';
import { Task } from '@/types';
import type { StaffMember } from '@/types/staff';
import { toast } from "@/components/ui/use-toast";

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSave: (updatedTask: Task) => void;
  staffMembers: StaffMember[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  open,
  onOpenChange,
  task,
  onSave,
  staffMembers
}) => {
  const loading = false;
  const currentUserDepartment = staffMembers?.[0]?.department || 'Unknown';
  
  const [editedTask, setEditedTask] = useState<Task>({...task});

  useEffect(() => {
    setEditedTask({...task});
  }, [task]);

  const handleUpdateTask = () => {
    // Basic validation
    if (!editedTask.title) {
      toast({
        title: "Error",
        description: "Task title is required",
      });
      return;
    }
    
    // Format dates properly
    const taskToSave = {
      ...editedTask,
      // Ensure dueDate is a string
      dueDate: typeof editedTask.dueDate === 'string' 
        ? editedTask.dueDate 
        : (editedTask.dueDate as Date)?.toISOString?.()?.split('T')[0] || null,
      
      // Ensure startDate is a proper date object or null
      startDate: editedTask.startDate instanceof Date 
        ? editedTask.startDate 
        : typeof editedTask.startDate === 'string' && editedTask.startDate 
          ? new Date(editedTask.startDate) 
          : null
    };
    
    onSave(taskToSave);
    onOpenChange(false);
    
    toast({
      title: "Task Updated",
      description: "The task has been successfully updated",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow pr-2 -mr-2">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input 
                id="task-title" 
                placeholder="Task Title" 
                value={editedTask.title || ''} 
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea 
                id="task-description" 
                placeholder="Task Description" 
                value={editedTask.description || ''} 
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-assignee">
                  Assignee {currentUserDepartment && <span className="text-sm text-muted-foreground">({currentUserDepartment})</span>}
                </Label>
                <Select 
                  value={editedTask.assignee || ''}
                  onValueChange={(value) => setEditedTask({...editedTask, assignee: value})}
                >
                  <SelectTrigger id="task-assignee" className={loading ? "opacity-50" : ""}>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="_loading" disabled>Loading staff members...</SelectItem>
                    ) : staffMembers && staffMembers.length > 0 ? (
                      staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.name}>
                          {staff.name} ({staff.job_title})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_no_staff" disabled>No staff members found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-status">Status</Label>
                <Select 
                  value={editedTask.status || 'todo'}
                  onValueChange={(value: 'todo' | 'in-progress' | 'review' | 'done') => 
                    setEditedTask({...editedTask, status: value})
                  }
                >
                  <SelectTrigger id="task-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select 
                  value={editedTask.priority || 'medium'}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    setEditedTask({...editedTask, priority: value})
                  }
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-percentage">Completion Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="task-percentage" 
                    type="number"
                    min="0"
                    max="100"
                    value={editedTask.completionPercentage || 0}
                    onChange={(e) => {
                      let value = parseInt(e.target.value, 10);
                      if (isNaN(value) || value < 0) {
                        value = 0;
                      } else if (value > 100) {
                        value = 100;
                      }
                      setEditedTask({...editedTask, completionPercentage: value});
                    }}
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-start-date">Start Date</Label>
                <Input 
                  id="task-start-date" 
                  type="date"
                  value={editedTask.startDate instanceof Date ? editedTask.startDate.toISOString().split('T')[0] : ''} 
                  onChange={(e) => setEditedTask({...editedTask, startDate: new Date(e.target.value)})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input 
                  id="task-due-date" 
                  type="date"
                  value={typeof editedTask.dueDate === 'string' ? editedTask.dueDate : ''} 
                  onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <ChecklistSection 
                items={editedTask.checklist || []}
                onChange={(items) => setEditedTask({...editedTask, checklist: items})}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal; 