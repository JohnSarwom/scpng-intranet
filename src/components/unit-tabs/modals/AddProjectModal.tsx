import React, { useState } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import ChecklistSection from '@/components/ChecklistSection';
import { Project } from '@/types';
import { StaffMember } from '@/types/staff';
import { toast } from "@/components/ui/use-toast";
import DatePicker from '@/components/DatePicker';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProject?: (project: Project) => void;
  project?: Partial<Project>;
  onProjectChange?: (project: Partial<Project>) => void;
  onSave?: () => void;
  staffMembers: StaffMember[];
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  open,
  onOpenChange,
  onAddProject,
  project,
  onProjectChange,
  onSave,
  staffMembers
}) => {
  const loading = false;
  
  const defaultProject: Partial<Project> = {
    id: `project-${Date.now()}`,
    name: '',
    description: '',
    status: 'planned',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default end date is 30 days from now
    manager: '',
    budget: 0,
    budgetSpent: 0,
    progress: 1,
    risks: [],
    tasks: [],
    checklist: []
  };

  const projectData = project || defaultProject;
  
  const handleChange = (field: string, value: any) => {
    if (onProjectChange && project) {
      onProjectChange({
        ...project,
        [field]: value
      });
    }
  };

  const handleSubmit = () => {
    if (!projectData.name) {
      toast({
        title: "Error",
        description: "Project name is required",
      });
      return;
    }

    if (!projectData.manager) {
      toast({
        title: "Error",
        description: "Project manager is required",
      });
      return;
    }

    // Use either the onSave callback or the onAddProject callback
    if (onSave) {
      onSave();
    } else if (onAddProject) {
      onAddProject(projectData as Project);
    }
    
    onOpenChange(false);
    
    toast({
      title: "Project Added",
      description: "The project has been successfully added",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project with the form below
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name <span className="text-destructive">*</span></Label>
              <Input 
                id="project-name" 
                placeholder="Project Name" 
                value={projectData.name || ''} 
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea 
                id="project-description" 
                placeholder="Project Description" 
                value={projectData.description || ''} 
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-manager">Project Manager <span className="text-destructive">*</span></Label>
                <Select 
                  value={projectData.manager || ''}
                  onValueChange={(value) => handleChange('manager', value)}
                >
                  <SelectTrigger id="project-manager" className={loading ? "opacity-50" : ""}>
                    <SelectValue placeholder="Select project manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="_loading">Loading staff members...</SelectItem>
                    ) : staffMembers && staffMembers.length > 0 ? (
                      staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.name}>
                          {staff.name} ({staff.jobTitle})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_no_staff">No staff members found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-status">Status</Label>
                <Select 
                  value={projectData.status || 'planned'}
                  onValueChange={(value: 'planned' | 'in-progress' | 'completed' | 'on-hold') => 
                    handleChange('status', value)
                  }
                >
                  <SelectTrigger id="project-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-start-date">Start Date</Label>
                <DatePicker 
                  date={projectData.startDate} 
                  setDate={(date) => handleChange('startDate', date)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-end-date">End Date</Label>
                <DatePicker 
                  date={projectData.endDate} 
                  setDate={(date) => handleChange('endDate', date)} 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-budget">Budget</Label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input 
                    id="project-budget" 
                    type="number"
                    min="0" 
                    placeholder="Budget Amount" 
                    value={projectData.budget || 0} 
                    onChange={(e) => handleChange('budget', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-progress">Progress (%)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="project-progress" 
                    type="number"
                    min="1"
                    max="100"
                    value={projectData.progress || 1} 
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      handleChange('progress', value < 1 ? 1 : value);
                    }}
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-2">
            <ChecklistSection 
              items={projectData.checklist || []}
              onChange={(items) => handleChange('checklist', items)}
            />
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
