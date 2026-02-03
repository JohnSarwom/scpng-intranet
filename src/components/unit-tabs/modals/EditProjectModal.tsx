import React, { useEffect, useState } from 'react';
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

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onProjectChange: (project: Project) => void;
  onSave?: (project: Project) => void;
  staffMembers: StaffMember[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  open,
  onOpenChange,
  project,
  onProjectChange,
  onSave,
  staffMembers
}) => {
  const staffLoading = false;

  const [editedProject, setEditedProject] = useState<Project | null>(project);

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  if (!editedProject) {
    return null;
  }
  
  const handleSave = () => {
    if (!editedProject.name) {
      toast({
        title: "Error",
        description: "Project name is required",
      });
      return;
    }

    if (!editedProject.manager) {
      toast({
        title: "Error",
        description: "Project manager is required",
      });
      return;
    }

    if (onSave) {
      onSave(editedProject);
    }
    
    toast({
      title: "Success",
      description: "Project updated successfully",
    });
    
    onOpenChange(false);
  };

  const handleChange = (field: string, value: any) => {
    setEditedProject(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
  <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
    <DialogTitle>Edit Project</DialogTitle>
    <DialogDescription>
      Update project details using the form below
    </DialogDescription>
  </DialogHeader>
  <ScrollArea className="flex-grow p-6">
    <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="project-title">Project Name <span className="text-destructive">*</span></Label>
            <Input 
              id="project-title" 
              placeholder="Project Name" 
              value={editedProject.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea 
              id="project-description" 
              placeholder="Project Description" 
              value={editedProject.description || ''} 
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-manager">Manager <span className="text-destructive">*</span></Label>
              <Select 
                value={editedProject.manager || ''}
                onValueChange={(value) => handleChange('manager', value)}
              >
                <SelectTrigger id="project-manager" className={staffLoading ? "opacity-50" : ""}>
                  <SelectValue placeholder="Select manager">
                    {editedProject.manager || "Select manager"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {staffLoading ? (
                    <SelectItem value="_loading" disabled>Loading staff members...</SelectItem>
                  ) : staffMembers && staffMembers.length > 0 ? (
                    staffMembers.map((staff) => (
<SelectItem key={staff.id} value={staff.name}> 
  {staff.name} ({staff.jobTitle})
</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_no_staff" disabled>No staff members found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-status">Status</Label>
              <Select 
                value={editedProject.status || 'planned'}
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
                date={editedProject.startDate} 
                setDate={(date) => handleChange('startDate', date)} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-end-date">End Date</Label>
              <DatePicker 
                date={editedProject.endDate} 
                setDate={(date) => handleChange('endDate', date)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-budget">Budget</Label>
              <Input 
                id="project-budget" 
                placeholder="Total Budget" 
                type="number"
                value={editedProject.budget || ''} 
                onChange={(e) => handleChange('budget', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-budget-spent">Amount Spent</Label>
              <Input 
                id="project-budget-spent" 
                placeholder="Amount Spent" 
                type="number"
                value={editedProject.budgetSpent || ''}
                onChange={(e) => handleChange('budgetSpent', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-progress">Progress (%)</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="project-progress" 
                type="number"
                min="1"
                max="100"
                value={editedProject.progress || 1} 
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  handleChange('progress', value < 1 ? 1 : value);
                }}
              />
              <span>%</span>
            </div>
          </div>
        </div>
        
  <div className="border-t pt-4 mt-2">
    <ChecklistSection 
      items={editedProject.checklist || []}
      onChange={(items) => handleChange('checklist', items)}
    />
  </div>
</ScrollArea>

<DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
  <Button onClick={handleSave}>Save Changes</Button>
</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
