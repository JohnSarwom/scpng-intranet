import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  LayoutGrid, 
  Filter, 
  Search,
  Trash2,
  Kanban,
  List,
  CalendarIcon,
} from 'lucide-react';
import TaskCard from '@/components/unit-tabs/TaskCard';
import TaskDialog from '@/components/unit-tabs/TaskDialog';
import { StaffMember } from '@/types/staff';
import { Objective, Kra, Task } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { addDays, addWeeks, addMonths } from 'date-fns';

interface BoardData {
  [key: string]: Task[]; 
}

interface Bucket {
  id: string;
  title: string;
}

interface ItemToDelete {
  type: 'task' | 'group';
  id: string;
  name?: string;
}

type BoardColumnId = string;
type ViewMode = 'board' | 'grid' | 'list';

const initialBuckets = [
  { id: 'todo', title: 'TO DO' },
  { id: 'in-progress', title: 'IN PROGRESS' },
  { id: 'review', title: 'REVIEW' },
  { id: 'done', title: 'DONE' }
];

const BoardLane = ({ 
  id, 
  title,
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onDeleteGroup,
  onEdit,
  isOver = false,
  onRenameGroup,
  onToggleComplete,
  onPriorityChange,
  onAssigneeChange,
  onStatusChange,
  dropTargetInfo,
  staffMembers
}: { 
  id: string; 
  title: string; 
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEdit: (id: string) => void;
  isOver?: boolean;
  onRenameGroup: (groupId: string, newTitle: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPriorityChange: (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onAssigneeChange: (id: string, assignee: StaffMember) => void;
  onStatusChange: (id: string, status: string) => void;
  dropTargetInfo: {
    columnId: string | null;
    overItemId: string | null;
    isBottomHalf: boolean;
  };
  staffMembers: StaffMember[];
}) => {
  const { setNodeRef } = useDroppable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-muted/30 dark:bg-muted/20 rounded-lg overflow-hidden">
      <div className="p-3 font-medium flex items-center justify-between bg-muted/50 dark:bg-muted/30">
        <h3>{title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="ml-2">{tasks.length}</Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => onEdit(id)}>
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onAddTask}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => onDeleteGroup(id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div ref={setNodeRef} className="p-2 flex-grow overflow-y-auto min-h-[200px] space-y-3">
        <SortableContext items={incompleteTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {incompleteTasks.map((task) => {
            const assignee = staffMembers.find(s => s.email === task.assignee);
            return (
            <TaskCard
              key={task.id}
              {...task}
              assignee={assignee}
              onEdit={() => onEditTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onComplete={onToggleComplete}
              onPriorityChange={onPriorityChange}
              onAssigneeChange={onAssigneeChange}
              onStatusChange={onStatusChange}
            />
          )})}
        </SortableContext>
        {completedTasks.length > 0 && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setShowCompleted(!showCompleted)}>
              Completed ({completedTasks.length})
            </Button>
            {showCompleted && (
              <div className="mt-2 space-y-3">
                {completedTasks.map((task) => {
                  const assignee = staffMembers.find(s => s.email === task.assignee);
                  return (
                    <TaskCard
                      key={task.id}
                      {...task}
                      assignee={assignee}
                      onEdit={() => onEditTask(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                      onComplete={onToggleComplete}
                      onPriorityChange={onPriorityChange}
                      onAssigneeChange={onAssigneeChange}
                      onStatusChange={onStatusChange}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskGridView: React.FC<{
  tasks: BoardData;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPriorityChange: (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onAssigneeChange: (id: string, assignee: StaffMember) => void;
  onStatusChange: (id: string, status: string) => void;
  staffMembers: StaffMember[];
}> = ({ tasks, onEditTask, onDeleteTask, onToggleComplete, onPriorityChange, onAssigneeChange, onStatusChange, staffMembers }) => {
  const allTasks = useMemo(() => {
    const flattened: Task[] = [];
    Object.values(tasks).forEach(columnTasks => {
      flattened.push(...columnTasks);
    });
    return flattened;
  }, [tasks]);

  if (allTasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allTasks.map((task) => {
        const assignee = staffMembers.find(s => s.email === task.assignee);
        return (
          <TaskCard
            key={task.id}
            {...task}
            assignee={assignee}
            onEdit={() => onEditTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onComplete={onToggleComplete}
            onPriorityChange={onPriorityChange}
            onAssigneeChange={onAssigneeChange}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
};

const TaskListView: React.FC<{
  tasks: BoardData;
  buckets: Bucket[];
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPriorityChange: (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onAssigneeChange: (id: string, assignee: StaffMember) => void;
  onStatusChange: (id: string, status: string) => void;
  staffMembers: StaffMember[];
}> = ({ tasks, buckets, onEditTask, onDeleteTask, onToggleComplete, onPriorityChange, onAssigneeChange, onStatusChange, staffMembers }) => {
  const allTasks = useMemo(() => {
    const flattened: (Task & { columnId: string, columnTitle: string })[] = [];
    Object.entries(tasks).forEach(([columnId, columnTasks]) => {
      const bucketTitle = buckets.find(b => b.id === columnId)?.title || columnId;
      
      columnTasks.forEach(task => {
        flattened.push({
          ...task,
          columnId,
          columnTitle: bucketTitle,
        });
      });
    });
    return flattened.sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || buckets.findIndex(bucket => bucket.id === a.columnId) - buckets.findIndex(bucket => bucket.id === b.columnId));
  }, [tasks, buckets]);

  if (allTasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-xs font-medium text-left p-3 text-muted-foreground w-10"></th>
            <th className="text-xs font-medium text-left p-3 text-muted-foreground">Tasks/Operations</th>
            <th className="text-xs font-medium text-left p-3 text-muted-foreground">Group</th>
            <th className="text-xs font-medium text-left p-3 text-muted-foreground">Priority</th>
            <th className="text-xs font-medium text-left p-3 text-muted-foreground">Due Date</th>
            <th className="text-xs font-medium text-left p-3 text-muted-foreground">Assignee</th>
            <th className="text-xs font-medium text-left p-3 text-muted-foreground w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allTasks.map((task) => {
            const assignee = staffMembers.find(s => s.email === task.assignee);
            return (
              <tr key={task.id} className={cn("border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50", task.completed && "bg-gray-50 dark:bg-gray-800/50")}>
                <td className="p-3 text-center">
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground hover:text-primary" onClick={() => onToggleComplete(task.id, !task.completed)}>
                    {task.completed ? <Kanban className="h-4 w-4 text-green-600" /> : <List className="h-4 w-4" />}
                  </Button>
                </td>
                <td className="p-3">
                  <div className={cn("font-medium text-sm", task.completed && "line-through text-muted-foreground")}>{task.title}</div>
                  {task.description && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</div>}
                </td>
                <td className="p-3"><Badge variant="outline">{task.columnTitle}</Badge></td>
                <td className="p-3"><Badge variant={task.priority === 'high' || task.priority === 'urgent' ? 'destructive' : 'outline'}>{task.priority}</Badge></td>
                <td className="p-3">{task.dueDate}</td>
                <td className="p-3">{assignee?.name || 'Unassigned'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => onEditTask(task.id)}><List className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600" onClick={() => onDeleteTask(task.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface NewTasksTabProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  editTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  error?: Error | null;
  onRetry?: () => void;
  staffMembers: StaffMember[];
  objectives?: Objective[];
  setEditingTask: (task: Task | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  viewMode: ViewMode;
}

export const TasksTab: React.FC<NewTasksTabProps> = ({ 
  tasks, 
  addTask, 
  editTask, 
  deleteTask,
  staffMembers,
  objectives,
  setEditingTask,
  setIsDialogOpen,
  viewMode
}) => {
  const [boardData, setBoardData] = useState<BoardData>({});
  const [taskBuckets, setTaskBuckets] = useState(initialBuckets);
  const [activeDragItem, setActiveDragItem] = useState<Task | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const { toast } = useToast();
  const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');

  useEffect(() => {
    // Initialize board data structure
    const newBoardData: BoardData = {};

    // Populate tasks
    initialBuckets.forEach(bucket => {
      newBoardData[bucket.id] = tasks.filter(task => task.status === bucket.id);
    });
    
    setBoardData(newBoardData);
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;
      const activeTask = tasks.find(t => t.id === activeId);
      if (activeTask) {
        editTask(activeId, { status: overId as Task['status'] });
      }
    }
    setActiveDragItem(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveDragItem(task);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setItemToDelete({ type: 'task', id: taskId, name: task.title });
    }
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'task') {
        deleteTask(itemToDelete.id);
      } else if (itemToDelete.type === 'group') {
        const groupId = itemToDelete.id;
        setTaskBuckets(prev => prev.filter(b => b.id !== groupId));
        setBoardData(prev => {
          const newBoardData = { ...prev };
          delete newBoardData[groupId];
          return newBoardData;
        });
      }
      setItemToDelete(null);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = taskBuckets.find(b => b.id === groupId);
    if (group) {
      setItemToDelete({ type: 'group', id: groupId, name: group.title });
    }
  };

  const handleSaveNewGroup = () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;

    const newBucketId = `bucket-${Date.now()}`;
    const newBucket: Bucket = { id: newBucketId, title: trimmedName };

    setTaskBuckets(prev => [...prev, newBucket]);
    setBoardData(prev => ({ ...prev, [newBucketId]: [] }));

    setIsAddingGroup(false);
    setNewGroupName('');
  };

  const handleCancelAddGroup = () => {
    setIsAddingGroup(false);
    setNewGroupName('');
  };

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && completed && task.recurrence && task.recurrence !== 'none') {
      const now = new Date();
      let newStartDate: Date | undefined;
      let newDueDate: string | undefined;

      if (task.startDate) {
        const startDate = new Date(task.startDate);
        switch (task.recurrence) {
          case 'daily':
            newStartDate = addDays(startDate, 1);
            break;
          case 'weekly':
            newStartDate = addWeeks(startDate, 1);
            break;
          case 'monthly':
            newStartDate = addMonths(startDate, 1);
            break;
        }
      }

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        switch (task.recurrence) {
          case 'daily':
            newDueDate = addDays(dueDate, 1).toISOString();
            break;
          case 'weekly':
            newDueDate = addWeeks(dueDate, 1).toISOString();
            break;
          case 'monthly':
            newDueDate = addMonths(dueDate, 1).toISOString();
            break;
        }
      }

      if (newStartDate) {
        const newTask: Omit<Task, 'id'> = {
          ...task,
          startDate: newStartDate,
          dueDate: newDueDate || '',
          completed: false,
        };
        addTask(newTask);
      }
    }
    editTask(taskId, { completed });
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col overflow-hidden">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex-1 p-4 overflow-auto max-h-[calc(100vh-220px)]">
            {viewMode === 'board' ? (
              <div className="flex gap-8 h-full">
                {/* Tasks/Operations Section */}
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold tracking-tight mb-4 shrink-0">Tasks/Operations</h2>
                  <div className="flex items-start space-x-4">
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                      {taskBuckets.map(bucket => (
                        <BoardLane
                          key={bucket.id}
                          id={bucket.id}
                          title={bucket.title}
                          tasks={boardData[bucket.id] || []}
                          staffMembers={staffMembers}
                          onAddTask={handleCreateTask}
                          onEditTask={handleEditTask}
                          onEdit={() => {}}
                          onDeleteTask={handleDeleteTask}
                          onDeleteGroup={handleDeleteGroup}
                          onRenameGroup={() => {}}
                          onToggleComplete={() => {}}
                          onPriorityChange={() => {}}
                          onAssigneeChange={() => {}}
                          onStatusChange={() => {}}
                          dropTargetInfo={{ columnId: null, overItemId: null, isBottomHalf: false }}
                        />
                      ))}
                    </div>
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
                        onClick={() => setIsAddingGroup(true)}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add New Group
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            ) : viewMode === 'grid' ? (
              <TaskGridView
                tasks={boardData}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onPriorityChange={() => {}}
                onAssigneeChange={() => {}}
                onStatusChange={() => {}}
                staffMembers={staffMembers}
              />
            ) : (
              <TaskListView
                tasks={boardData}
                buckets={taskBuckets}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onPriorityChange={() => {}}
                onAssigneeChange={() => {}}
                onStatusChange={() => {}}
                staffMembers={staffMembers}
              />
            )}
          </div>
          <DragOverlay>
            {activeDragItem ? <TaskCard {...activeDragItem} assignee={staffMembers.find(s => s.email === activeDragItem.assignee)} isDragOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'task'
                ? `This will permanently delete the task "${itemToDelete?.name}".`
                : `This will permanently delete the group "${itemToDelete?.name}" and all its tasks.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksTab;
