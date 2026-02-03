import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, User, Send, PaperclipIcon, LinkIcon, Repeat, Trash2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import DateRangePicker from '@/components/ui/DateRangePicker';
import { StaffMember } from '@/types/staff';
import { Task, Kra, Kpi } from '@/types';

// Define the shape of a comment
interface Comment {
  id: string;
  authorName: string;
  authorAvatarFallback: string;
  timestamp: Date;
  text: string;
}

type Subtask = { id: string; text: string; completed: boolean };

interface StatusOption {
  id: string;
  name: string;
}

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
  initialData?: Partial<Task> | null; // For editing
  statuses?: StatusOption[]; // Available status options
  defaultStatus?: string | null; // Added prop for default status on create
  buckets?: { id: string; title: string }[]; // Available buckets/groups
  defaultGroup?: string | null; // Default group for new tickets
  staffMembers: StaffMember[];
  kras: Kra[];
  kpis: Kpi[];
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  statuses = [
    { id: 'todo', name: 'TO DO' },
    { id: 'in-progress', name: 'IN PROGRESS' },
    { id: 'review', name: 'REVIEW' },
    { id: 'done', name: 'DONE' }
  ],
  defaultStatus,
  buckets = [],
  defaultGroup,
  staffMembers,
  kras = [],
  kpis = []
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<string>('todo');
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]); // State for comments
  const [newCommentText, setNewCommentText] = useState(''); // State for new comment input
  const [assignee, setAssignee] = useState<string | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<string>('none');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [selectedKraId, setSelectedKraId] = useState<string | undefined>(undefined);
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
      setStatus(initialData.status || defaultStatus || statuses[0]?.id || 'todo');
      setGroupId(initialData.projectId || defaultGroup);
      setAssignee(initialData.assignee);
      setRecurrence(initialData.recurrence || 'none');
      setSubtasks(initialData.subtasks || []);
      setSelectedKraId(initialData.kra_id);
      setSelectedKpiId(initialData.kpi_id);
      
      // Set date range if both start and end dates exist
      if (initialData.startDate) {
        setDateRange({
          from: new Date(initialData.startDate),
          to: initialData.dueDate ? new Date(initialData.dueDate) : undefined
        });
      } else {
        setDateRange(undefined);
      }
      
      setComments([]);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus(defaultStatus || statuses[0]?.id || 'todo'); 
      setGroupId(defaultGroup);
      setDateRange(undefined);
      setComments([]);
      setAssignee(undefined);
      setRecurrence('none');
      setSubtasks([]);
      setSelectedKraId(undefined);
      setSelectedKpiId(undefined);
    }
    setNewCommentText('');
    setNewSubtaskText('');
  }, [initialData, isOpen, defaultStatus, defaultGroup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Partial<Task> = {
      id: initialData?.id,
      title,
      description,
      priority,
      status: status as Task['status'],
      projectId: groupId,
      startDate: dateRange?.from || undefined,
      dueDate: dateRange?.to?.toISOString() || '',
      assignee: assignee,
      recurrence: recurrence,
      subtasks: subtasks,
      kra_id: selectedKraId,
      kpi_id: selectedKpiId,
    };
    onSubmit(taskData);
  };

  // Function to handle adding a new comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const currentUser = { name: "Current User", avatarFallback: "CU" }; 
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: currentUser.name,
      authorAvatarFallback: currentUser.avatarFallback,
      timestamp: new Date(),
      text: newCommentText,
    };
    setComments(prevComments => [...prevComments, newComment]);
    setNewCommentText('');
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      text: newSubtaskText,
      completed: false,
    };
    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => 
      prev.map(subtask => 
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
      )
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
          <DialogTitle className="text-2xl font-semibold">{initialData ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of the task.' : 'Fill in the details for the new task.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto px-6 pt-4">
          <form onSubmit={handleSubmit} id="task-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 pb-4">
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="title">Title*</Label>
                <Input 
                  id="title" 
                  placeholder="Enter task title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="py-3 px-4 rounded-lg" 
                  required 
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Add a detailed description..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="py-3 px-4 rounded-lg" 
                  rows={4}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="group">Group/Column</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger id="group" className="py-3 px-4 rounded-lg">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {buckets.map((bucket) => (
                      <SelectItem key={bucket.id} value={bucket.id}>
                        {bucket.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="py-3 px-4 rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((statusOption) => (
                      <SelectItem key={statusOption.id} value={statusOption.id}>
                        {statusOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                  <SelectTrigger id="priority" className="py-3 px-4 rounded-lg">
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
              <div className="space-y-1">
                <Label htmlFor="dateRange">Date Range</Label>
                <DateRangePicker
                  id="dateRange"
                  selectedRange={dateRange}
                  onSelectRange={setDateRange}
                  placeholder="Pick a date range"
                  numberOfMonths={2}
                  className="py-3 px-4 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recurrence">Repeat</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger id="recurrence" className="py-3 px-4 rounded-lg">
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1"> 
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={assignee} onValueChange={setAssignee}>
                   <SelectTrigger className="py-3 px-4 rounded-lg">
                      <SelectValue placeholder="Assign to team member" />
                   </SelectTrigger>
                   <SelectContent>
                      {staffMembers.map(member => (
                        <SelectItem key={member.id} value={member.email}>{member.name}</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="kra">Link to KRA</Label>
                <Select value={selectedKraId} onValueChange={setSelectedKraId}>
                  <SelectTrigger id="kra" className="py-3 px-4 rounded-lg">
                    <SelectValue placeholder="Select a KRA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {kras.map((kra) => (
                      <SelectItem key={kra.id} value={kra.id.toString()}>
                        {kra.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="kpi">Link to KPI</Label>
                <Select value={selectedKpiId} onValueChange={setSelectedKpiId} disabled={!selectedKraId || selectedKraId === 'none'}>
                  <SelectTrigger id="kpi" className="py-3 px-4 rounded-lg">
                    <SelectValue placeholder="Select a KPI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {kpis
                      .filter((kpi) => kpi.kra_id?.toString() === selectedKraId)
                      .map((kpi) => (
                      <SelectItem key={kpi.id} value={kpi.id.toString()}>
                        {kpi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50 dark:bg-gray-800/30">
                    <Button type="button" variant="outline" size="sm">
                        <PaperclipIcon className="h-4 w-4 mr-1" /> Add File
                    </Button>
                     <Button type="button" variant="outline" size="sm">
                        <LinkIcon className="h-4 w-4 mr-1" /> Add Link
                    </Button>
                </div>
              </div>
            </div>
          </form>

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700/50">
            <h3 className="text-lg font-medium mb-3">Checklist</h3>
            <div className="space-y-2 mb-4">
              {subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={subtask.completed} 
                    onChange={() => handleToggleSubtask(subtask.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className={cn("flex-grow", subtask.completed && "line-through text-muted-foreground")}>
                    {subtask.text}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveSubtask(subtask.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Add a checklist item"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <Button type="button" onClick={handleAddSubtask}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700/50">
            <h3 className="text-lg font-medium mb-3">Comments</h3>
            <ScrollArea className="h-[150px] w-full mb-4 border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30">
               {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.authorAvatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{comment.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(comment.timestamp, "PPp")} 
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2 items-start mb-4">
              <Avatar className="h-9 w-9 mt-1">
                  <AvatarFallback>CU</AvatarFallback>
              </Avatar>
              <Textarea 
                placeholder="Add a comment..." 
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={3}
                className="flex-1 py-2 px-3 rounded-lg"
              />
              <Button 
                  type="button" 
                  size="icon" 
                  onClick={handleAddComment} 
                  disabled={!newCommentText.trim()}
                  className="mt-1"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send comment</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2 rounded-lg">Cancel</Button>
          <Button type="submit" form="task-form" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg">{initialData ? 'Save Changes' : 'Create Task'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
