import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export interface TaskFilterState {
  status: string;
  assignee: string;
  priority: string;
  dueDate: string;
}

export function useTaskState(initialTasks: Task[] = []) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  
  // Task filtering state
  const [taskFilters, setTaskFilters] = useState<TaskFilterState>({
    status: 'all',
    assignee: 'all',
    priority: 'all',
    dueDate: 'all'
  });
  
  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  
  // Apply task filter function
  const applyTaskFilters = useCallback(() => {
    const filtered = tasks.filter(task => {
      // Filter by status
      if (taskFilters.status !== 'all' && task.status !== taskFilters.status) {
        return false;
      }
      
      // Filter by assignee
      if (taskFilters.assignee !== 'all' && task.assignee !== taskFilters.assignee) {
        return false;
      }
      
      // Filter by priority
      if (taskFilters.priority !== 'all' && task.priority !== taskFilters.priority) {
        return false;
      }
      
      // Filter by due date
      if (taskFilters.dueDate !== 'all') {
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        
        if (taskFilters.dueDate === 'overdue') {
          return dueDate < today;
        } else if (taskFilters.dueDate === 'today') {
          return dueDate.toDateString() === today.toDateString();
        } else if (taskFilters.dueDate === 'thisWeek') {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
          return dueDate <= endOfWeek && dueDate >= today;
        }
      }
      
      return true;
    });
    
    setFilteredTasks(filtered);
  }, [taskFilters, tasks]);
  
  // Apply filters when tasks or filters change
  useEffect(() => {
    applyTaskFilters();
  }, [taskFilters, tasks, applyTaskFilters]);
  
  // Function to add a task
  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
    toast({
      title: "Task Added",
      description: "The task has been successfully added."
    });
  };
  
  // Function to update a task
  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    toast({
      title: "Task Updated",
      description: "The task has been successfully updated."
    });
  };
  
  // Function to delete a task
  const handleDeleteTask = () => {
    if (!deletingTask) return;
    
    const updatedTasks = tasks.filter(t => t.id !== deletingTask.id);
    setTasks(updatedTasks);
    setDeletingTask(null);
    toast({
      title: "Task Deleted",
      description: "The task has been successfully deleted."
    });
  };
  
  // Reset filters function
  const resetTaskFilters = () => {
    setTaskFilters({
      status: 'all',
      assignee: 'all',
      priority: 'all',
      dueDate: 'all'
    });
  };
  
  return {
    tasks,
    setTasks,
    filteredTasks,
    taskFilters,
    setTaskFilters,
    resetTaskFilters,
    applyTaskFilters,
    
    // Modal states
    showAddTaskModal,
    setShowAddTaskModal,
    showEditTaskModal,
    setShowEditTaskModal,
    editingTask,
    setEditingTask,
    showDeleteTaskModal,
    setShowDeleteTaskModal,
    deletingTask,
    setDeletingTask,
    
    // Handler functions
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask
  };
} 