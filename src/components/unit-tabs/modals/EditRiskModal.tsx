import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Risk, Project } from '@/types';
import { StaffMember } from '@/types/staff';
import { ChecklistItem } from '@/components/ChecklistSection';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditRiskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk | null;
  projects?: Project[];
  onEdit?: (updatedRisk: Risk) => void;
  onSave?: (updatedRisk: Partial<Risk>) => void;
  staffMembers: StaffMember[];
}

// Internal type for the form state with string dates
interface RiskFormState {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  status: Risk['status'];
  impact: Risk['impact'];
  likelihood: Risk['likelihood'];
  identificationDate: string;
  mitigationPlan: string;
  createdAt: string;
  updatedAt: string;
  checklist: ChecklistItem[];
  project_name?: string;
}

const emptyFormState: RiskFormState = {
  id: '',
  title: '',
  description: '',
  owner: '',
  category: '',
  status: 'identified',
  impact: 'medium',
  likelihood: 'low',
  identificationDate: new Date().toISOString(),
  mitigationPlan: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  checklist: [],
  project_name: undefined
};

const EditRiskModal: React.FC<EditRiskModalProps> = ({
  open,
  onOpenChange,
  risk,
  projects = [],
  onEdit,
  onSave,
  staffMembers
}) => {
  const [formState, setFormState] = useState<RiskFormState>({ ...emptyFormState });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const loading = false;
  
  // Calculate checklist completion percentage
  const calculateCompletionPercentage = (): number => {
    if (formState.checklist.length === 0) return 0;
    const checkedItems = formState.checklist.filter(item => item.checked).length;
    return Math.round((checkedItems / formState.checklist.length) * 100);
  };
  
  const completionPercentage = calculateCompletionPercentage();

  // Update the form state when the risk prop changes
  useEffect(() => {
    if (risk) {
      // Helper to safely get ISO string from Date or string
      const getDateString = (dateValue: Date | string | undefined | null): string => {
        if (!dateValue) return new Date().toISOString();
        if (typeof dateValue === 'string') return dateValue; // Already a string
        if (dateValue instanceof Date) return dateValue.toISOString(); // Convert Date object
        return new Date().toISOString(); // Fallback
      };

      // Find the project name from the projects list based on risk.project_id
      const associatedProjectName = projects.find(p => p.id === risk.project_id)?.name;

      setFormState({
        id: risk.id || '',
        title: risk.title || '',
        description: risk.description || '',
        owner: risk.owner || '',
        category: risk.category || '',
        status: risk.status || 'identified',
        impact: risk.impact || 'medium',
        likelihood: risk.likelihood || 'low',
        identificationDate: getDateString(risk.identificationDate),
        mitigationPlan: risk.mitigationPlan || '',
        createdAt: getDateString(risk.createdAt),
        updatedAt: new Date().toISOString(), // Keep this as current time for update
        checklist: risk.checklist || [],
        project_name: associatedProjectName || undefined
      });
    }
  }, [risk, projects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormState(prev => ({ 
      ...prev, 
      identificationDate: date ? date.toISOString() : new Date().toISOString()
    }));
    
    if (errors['identificationDate']) {
      setErrors(prev => ({ ...prev, identificationDate: '' }));
    }
  };

  const handleChecklistChange = (key: string, checked: boolean) => {
    if (checked) {
      // For radio buttons, we should clear all other selections first
      const predefinedKeys = ['riskAssessment', 'stakeholderReview', 'mitigationStrategy', 'contingencyPlan'];
      
      // Keep any custom checklist items
      const customItems = formState.checklist.filter(item => !predefinedKeys.includes(item.id));
      
      const newChecklist = [
        {
          id: key,
          text: getChecklistText(key),
          checked: true
        },
        ...customItems
      ];
      
      setFormState(prev => ({ 
        ...prev, 
        checklist: newChecklist 
      }));
    }
  };
  
  // Helper function to get text based on checklist key
  const getChecklistText = (key: string): string => {
    switch (key) {
      case 'riskAssessment': return 'Risk assessment completed';
      case 'stakeholderReview': return 'Stakeholder review conducted';
      case 'mitigationStrategy': return 'Mitigation strategy defined';
      case 'contingencyPlan': return 'Contingency plan established';
      default: return key;
    }
  };
  
  // Helper function to check if checklist item exists and is checked
  const isChecklistItemChecked = (key: string): boolean => {
    const item = formState.checklist.find(item => item.id === key);
    return item ? item.checked : false;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formState.owner?.trim()) {
      newErrors.owner = 'Owner is required';
    }
    
    if (!formState.category?.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formState.status?.trim()) {
      newErrors.status = 'Status is required';
    }
    
    // Validate likelihood to ensure it meets the database constraint
    const validLikelihoods = ['low', 'medium', 'high', 'very-high'];
    if (!validLikelihoods.includes(formState.likelihood)) {
      newErrors.likelihood = 'Invalid likelihood value';
      // Fallback to a safe value
      setFormState(prev => ({ ...prev, likelihood: 'low' }));
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    // Convert RiskFormState back to Partial<Risk> for saving
    const riskToSave: Partial<Risk> = {
      // Only include fields that are part of the Risk type
      id: formState.id,
      title: formState.title,
      description: formState.description,
      owner: formState.owner,
      category: formState.category,
      status: formState.status,
      impact: formState.impact,
      likelihood: formState.likelihood,
      identificationDate: new Date(formState.identificationDate),
      mitigationPlan: formState.mitigationPlan,
      // Don't include createdAt, let the DB handle it or keep original
      updatedAt: new Date(), // Set updatedAt to now
      checklist: formState.checklist,
      // Map project name back to project_id for saving
      project_id: projects.find(p => p.name === formState.project_name)?.id || null, 
    };
    
    // Use onSave callback 
    if (onSave) {
      onSave(riskToSave);
    } else if (onEdit) {
      // If using onEdit, ensure it can handle Partial<Risk> or cast carefully
      onEdit(riskToSave as Risk);
    }
    
    toast({
      title: "Risk Updated",
      description: "The risk details have been successfully updated.",
    });
    onOpenChange(false);
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim() === '') return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem,
      checked: false
    };

    setFormState(prev => ({
      ...prev,
      checklist: [...prev.checklist, newItem]
    }));

    setNewChecklistItem('');
  };

  // Don't render anything if no risk is provided
  if (!risk) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Risk</DialogTitle>
          <DialogDescription>
            Update risk details and tracking information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title" className="mb-2">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formState.title || ''}
                onChange={handleChange}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description" className="mb-2">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="risk-owner">Owner <span className="text-destructive">*</span></Label>
              <Select 
                name="owner" 
                value={formState.owner}
                onValueChange={(value) => handleSelectChange('owner', value)}
              >
                <SelectTrigger id="risk-owner" className={loading ? "opacity-50" : ""}>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="_loading" disabled>Loading staff...</SelectItem>
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
              {errors.owner && <p className="text-sm text-destructive mt-1">{errors.owner}</p>}
            </div>
            
            <div>
              <Label htmlFor="category" className="mb-2">Category <span className="text-destructive">*</span></Label>
              <Select
                value={formState.category || ''}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="reputational">Reputational</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
            </div>
            
            <div>
              <Label htmlFor="status" className="mb-2">Status <span className="text-destructive">*</span></Label>
              <Select
                value={formState.status || ''}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="analyzing">Analyzing</SelectItem>
                  <SelectItem value="mitigating">Mitigating</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
            </div>
            
            <div>
              <Label htmlFor="identificationDate" className="mb-2">Identification Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formState.identificationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.identificationDate ? format(new Date(formState.identificationDate), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.identificationDate ? new Date(formState.identificationDate) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="impact" className="mb-2">Impact Level</Label>
              <Select
                value={formState.impact || ''}
                onValueChange={(value) => handleSelectChange('impact', value)}
              >
                <SelectTrigger id="impact">
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="likelihood" className="mb-2">Likelihood</Label>
              <Select
                value={formState.likelihood}
                onValueChange={(value) => handleSelectChange('likelihood', value)}
              >
                <SelectTrigger id="likelihood">
                  <SelectValue placeholder="Select likelihood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very-high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="mitigationPlan" className="mb-2">Mitigation Plan</Label>
              <Textarea
                id="mitigationPlan"
                name="mitigationPlan"
                value={formState.mitigationPlan || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="col-span-2">
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Checklist</h3>
                  <span className="text-sm text-muted-foreground">
                    {completionPercentage}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Add new checklist item" 
                    className="flex-1"
                    id="new-checklist-item"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handleAddChecklistItem}
                  >
                    Add
                  </Button>
                </div>

                {formState.checklist.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formState.checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={item.id} 
                          checked={item.checked}
                          onCheckedChange={(checked) => {
                            const updatedChecklist = formState.checklist.map(i => 
                              i.id === item.id ? { ...i, checked: checked as boolean } : i
                            );
                            setFormState(prev => ({ ...prev, checklist: updatedChecklist }));
                          }}
                        />
                        <Label htmlFor={item.id}>{item.text}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="risk-project">Related Project (Optional)</Label>
              <Select 
                name="project_name"
                value={formState.project_name || ''} 
                onValueChange={(value) => handleSelectChange('project_name', value)}
              >
                <SelectTrigger id="risk-project">
                  <SelectValue placeholder="Select related project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}> 
                        {project.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_no_projects" disabled>No projects available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRiskModal; 