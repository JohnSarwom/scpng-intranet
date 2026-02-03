import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Edit, Plus, Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import KRATimelineTab from '@/components/KRATimelineTab';
import KRAInsightsTab from '@/components/KRAInsightsTab';
import KpiModal from '@/components/kpi/KpiModal';
import { Kra, Kpi, User, Objective, Task } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { StaffMember } from '@/types/staff';
import { getSupabaseClient } from '@/integrations/supabase/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import moment from 'moment';
import { useEmployeeLookup } from '@/hooks/useEmployeeLookup';
import DatePicker from '@/components/DatePicker';
import { Check, Loader2, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { Division } from '@/types';

// Helper function to format dates (DD MMM YYYY)
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
};

// Helper function to get quarter from date string (YYYY-MM-DD)
const getQuarter = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const month = date.getMonth(); // 0-indexed (0 = January)
    if (month <= 2) return 'Q1';
    if (month <= 5) return 'Q2';
    if (month <= 8) return 'Q3';
    return 'Q4';
  } catch {
    return '-';
  }
};

// Helper function to format currency (PNG Kina)
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  try {
    return new Intl.NumberFormat('en-PG', { style: 'currency', currency: 'PGK' }).format(value);
  } catch (e) {
    console.error("Error formatting currency:", value, e);
    return 'Invalid Amount';
  }
};

// Map KPI status to Badge variants (can reuse getStatusVariant logic if desired)
const getKpiStatusVariant = (status: Kpi['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'completed': return 'default';
    case 'at-risk': return 'destructive';
    case 'on-track': return 'default';
    case 'in-progress': return 'default';
    case 'on-hold': return 'secondary';
    case 'not-started': return 'outline';
    case 'behind': return 'destructive';
    default: return 'outline';
  }
};

// Define filters state type
interface KraFiltersState {
  department: string;
  status: string; // Filters by KPI status
}

// Updated structure for processed rows supporting two-level grouping
interface ProcessedRow {
  // Objective Info
  objectiveId: string | number | null | undefined; // Allow undefined as it might not exist
  objectiveName: string;
  isFirstRowOfObjective: boolean;
  objectiveRowSpan: number;
  // KRA Info (grouped by Title)
  kraTitle: string;
  isFirstRowOfKraTitleGroup: boolean;
  kraTitleRowSpan: number;
  // KPI Info
  kpi: Kpi;
  // Original KRA object
  originalKra: Kra;
}

// Define structure for unit data (if not already defined globally)
interface UnitData {
  id: string | number;
  name: string;
}

// Mock Divisions if not passed (or fetch them if possible, but for now we rely on simple list)
// Ideally this should come from context or props
const MOCK_DIVISIONS: Division[] = [
  { id: '1', name: 'Executive Division', code: 'EXEC', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Corporate Services Division', code: 'CSD', createdAt: new Date(), updatedAt: new Date() },
  // Add others if needed or rely on string matching
];

// Define Props for KRAsTab
// Define Props for KRAsTab
interface KRAsTabProps {
  kras: Kra[];
  tasks: Task[];
  objectivesData: Objective[];
  onSaveObjective: (objective: Objective) => Promise<void>;
  onDeleteObjective: (objectiveId: string | number) => Promise<void>;
  units: UnitData[]; // This prop now receives the full list of units from Unit.tsx
  staffMembers?: StaffMember[];
  onDataRefresh?: () => void;
  activeTab: string;
  onTabChange: (tabValue: string) => void;
  userContext?: { division: string; unit: string; name: string; email: string };
  onSaveKra: (kra: Partial<Kra>) => Promise<any>;
  onDeleteKra: (kraId: string | number) => Promise<void>;
  onSaveKpi: (kpi: Partial<Kpi>) => Promise<void>;
  onDeleteKpi: (kpiId: string | number) => Promise<void>;
}

export const KRAsTab: React.FC<KRAsTabProps> = ({
  kras: krasFromProps,
  tasks: tasksFromProps,
  objectivesData,
  onSaveObjective,
  onDeleteObjective,
  units, // Receive the full units list here
  staffMembers,
  onDataRefresh,
  activeTab,
  onTabChange,
  userContext,
  onSaveKra,
  onDeleteKra,
  onSaveKpi,
  onDeleteKpi
}) => {
  const kras = krasFromProps; // Use props directly
  const tasks = tasksFromProps || [];
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKra, setEditingKra] = useState<Kra | undefined>(undefined);
  const [editingKpiDetails, setEditingKpiDetails] = useState<{ kraId: string; kpi: Kpi } | undefined>(undefined);
  const [kraToDelete, setKraToDelete] = useState<Kra | null>(null);
  const [filters, setFilters] = useState<KraFiltersState>({
    department: 'all',
    status: 'all',
  });
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | undefined>(undefined);


  const [newObjectiveData, setNewObjectiveData] = useState<Partial<Objective>>({
    title: '',
    description: '',
    status: 'Not Started',
    progress: 0,
    year: new Date().getFullYear().toString(),
    goalType: 'Division',
    division: '',
    unit: '',
    owner: '',
    parentGoalId: ''
  });
  const [isOwnerPopoverOpen, setIsOwnerPopoverOpen] = useState(false);



  // Initialize Employee Lookup
  const { employees, isLoading: isLoadingEmployees, getEmployeeDetails } = useEmployeeLookup(MOCK_DIVISIONS);

  const { toast } = useToast();

  // Derive unique KRA titles for the Combobox
  const existingKraTitles = useMemo(() => {
    const titles = kras.map(kra => kra.title).filter(title => !!title); // Get all titles, filter out empty/null/undefined
    return Array.from(new Set(titles)); // Get unique titles
  }, [kras]);

  // Derive departments for filtering - Now use the passed units prop
  const departments = useMemo(() => units.map(u => u.name), [units]);
  const kpiStatuses: (Kpi['status'] | 'all')[] = ['all', 'not-started', 'on-track', 'in-progress', 'at-risk', 'on-hold', 'completed', 'behind'];

  const handleFilterChange = useCallback((filterName: 'department' | 'status', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      department: 'all',
      status: 'all',
    });
  }, []);

  const processedRows = useMemo((): ProcessedRow[] => {
    /* --- TEMPORARY SIMPLIFICATION FOR DEBUGGING ---
    const flatRows: ProcessedRow[] = [];
    console.log("[KRAsTab] Objectives Data for Lookup:", objectivesData); // Log objectives data
    (krasFromProps || []).forEach(kra => {
        console.log(`[KRAsTab] Processing KRA: ${kra.title}, Objective ID from KRA: ${kra.objective_id}`); // Log KRA info with correct field
        // Basic objective lookup with detailed logging
        const objective = objectivesData.find(o => {
           // Log comparison details using objective_id
           // Compare as strings for safety, handling potential null/undefined on kra.objective_id
           const isMatch = String(o.id) === String(kra.objective_id);
           console.log(`  Comparing KRA objective_id (${kra.objective_id}, type: ${typeof kra.objective_id}) with Objective ID (${o.id}, type: ${typeof o.id}) => Match: ${isMatch}`);
           return isMatch;
        });
        console.log('[KRAsTab] Found Objective:', objective); // Log the result of find
   
        // Use objective_id to determine if assigned
        const objectiveName = objective?.name || (kra.objective_id ? 'Unknown Objective' : 'Unassigned');
        const kpis = kra.unitKpis && kra.unitKpis.length > 0 ? kra.unitKpis : [{ id: `no-kpi-${kra.id}`, name: '-' } as Kpi];
   
        kpis.forEach((kpi, index) => {
            // Simple flat structure - ignoring spans and grouping for now
            flatRows.push({
                objectiveId: kra.objective_id, // Use correct field
                objectiveName: objectiveName,
                isFirstRowOfObjective: index === 0, // Simplified: first kpi is first row
                objectiveRowSpan: 1, // Simplified
                kraTitle: kra.title,
                isFirstRowOfKraTitleGroup: index === 0, // Simplified
                kraTitleRowSpan: 1, // Simplified
                kpi: kpi,
                originalKra: kra,
            });
        });
    });
   
    // Apply filters
    const filteredRows = flatRows.filter(row => {
        const departmentMatch = filters.department === 'all' || row.originalKra.unit === filters.department;
        // Use optional chaining for status as kpi might be a placeholder
        const statusMatch = filters.status === 'all' || (row.kpi?.status && row.kpi.status === filters.status);
        // If it's a placeholder KPI row, only check department
        if (row.kpi.name === '-') { 
            return departmentMatch;
        }
        return departmentMatch && statusMatch;
    });
   
    console.log("[KRAsTab] Simplified Processed rows:", filteredRows); 
    return filteredRows;
     --- END TEMPORARY SIMPLIFICATION --- */

    // --- ORIGINAL COMPLEX LOGIC (RESTORED and UPDATED) ---
    const groupedRows: ProcessedRow[] = [];
    console.log("[KRAsTab] Using complex grouping logic. Objectives:", objectivesData);
    console.log("[KRAsTab] KRAs received:", krasFromProps);

    // Filter KRAs based on department FIRST (if applicable)
    const departmentFilteredKras = filters.department === 'all'
      ? krasFromProps
      : krasFromProps.filter(kra => kra.unit === filters.department);

    console.log("[KRAsTab] KRAs after department filter:", departmentFilteredKras);

    // Group by Objective ID (using objective_id)
    const objectiveGroups = departmentFilteredKras.reduce((acc, kra) => {
      // Use objective_id, default to 'unassigned' if null/undefined
      const objIdKey = kra.objective_id ? String(kra.objective_id) : 'unassigned';

      // Log the KRA being processed and the key derived
      console.log(`[KRAsTab Reduce] Processing KRA: ${kra.title} (ID: ${kra.id}), Objective ID: ${kra.objective_id}, Derived Key: ${objIdKey}`);

      if (!acc[objIdKey]) {
        // Log before the find operation
        console.log(`[KRAsTab Reduce] Looking for Objective with ID Key: ${objIdKey}`);
        const objective = objectivesData.find(o => {
          const isMatch = String(o.id) === objIdKey;
          // Log details of each comparison within find (can be verbose)
          // console.log(`  [Find Compare] Objective ID: ${o.id} (String: ${String(o.id)}) === Key: ${objIdKey} => ${isMatch}`);
          return isMatch;
        });

        // Log the result of the find operation
        console.log(`[KRAsTab Reduce] Find result for Key ${objIdKey}:`, objective);

        acc[objIdKey] = {
          // Use found objective name or default
          name: objective?.title || (objIdKey !== 'unassigned' ? 'Unknown Objective' : 'Unassigned'),
          kras: [],
        };
        // Log the name assigned
        console.log(`[KRAsTab Reduce] Assigned Name for Key ${objIdKey}: ${acc[objIdKey].name}`);
      }
      acc[objIdKey].kras.push(kra);
      return acc;
    }, {} as Record<string, { name: string; kras: Kra[] }>);

    console.log("[KRAsTab] Grouped by Objective:", objectiveGroups);
    // Add logging here to see objectivesData right before the loop
    console.log("[KRAsTab] objectivesData available inside useMemo:", JSON.stringify(objectivesData));

    Object.entries(objectiveGroups).forEach(([objectiveIdKey, objectiveGroup]) => {
      let isFirstRowInObjective = true;
      let objectiveRows: ProcessedRow[] = []; // Collect rows for this objective group first

      // Group by KRA Title within Objective
      const kraTitleGroups = objectiveGroup.kras.reduce((acc, kra) => {
        const titleKey = kra.title || 'Untitled KRA'; // Handle untitled KRAs
        if (!acc[titleKey]) {
          acc[titleKey] = [];
        }
        acc[titleKey].push(kra);
        return acc;
      }, {} as Record<string, Kra[]>);

      Object.entries(kraTitleGroups).forEach(([kraTitle, krasWithSameTitle]) => {
        let isFirstRowInKraTitleGroup = true;
        let kraTitleRows: ProcessedRow[] = []; // Collect rows for this KRA title group

        krasWithSameTitle.forEach(kraInstance => {
          const kpis = (kraInstance.unitKpis && kraInstance.unitKpis.length > 0)
            ? kraInstance.unitKpis
            : [{ id: `no-kpi-${kraInstance.id}`, name: '-' } as Kpi]; // Placeholder if no KPIs

          kpis.forEach((kpi: Kpi) => {
            // Apply KPI status filter here
            const statusMatch = filters.status === 'all' || (kpi.status && kpi.status === filters.status);
            if (kpi.name === '-' || statusMatch) { // Always include placeholder or if status matches
              kraTitleRows.push({
                // Use objective_id from the KRA instance
                objectiveId: kraInstance.objective_id,
                objectiveName: objectiveGroup.name,
                isFirstRowOfObjective: false, // Will be set later
                objectiveRowSpan: 0, // Will be set later
                kraTitle: kraTitle,
                isFirstRowOfKraTitleGroup: false, // Will be set later
                kraTitleRowSpan: 0, // Will be set later
                kpi: kpi,
                originalKra: kraInstance,
              });
            }
          });
        });

        // Set span and first row flag for the KRA title group
        if (kraTitleRows.length > 0) {
          kraTitleRows[0].isFirstRowOfKraTitleGroup = true;
          kraTitleRows[0].kraTitleRowSpan = kraTitleRows.length;
          objectiveRows.push(...kraTitleRows); // Add rows for this title to the objective group
        }
      });

      // Set span and first row flag for the Objective group
      if (objectiveRows.length > 0) {
        objectiveRows[0].isFirstRowOfObjective = true;
        objectiveRows[0].objectiveRowSpan = objectiveRows.length;
        groupedRows.push(...objectiveRows); // Add rows for this objective to the final list
      }
    });

    console.log("[KRAsTab] Processed rows with grouping:", groupedRows);
    return groupedRows;
    // --- END ORIGINAL COMPLEX LOGIC ---

  }, [krasFromProps, objectivesData, filters.department, filters.status]); // Update dependencies

  const handleOpenAddKraModal = () => {
    setEditingKra(undefined);
    setEditingKpiDetails(undefined);
    setIsKpiModalOpen(true);
  };

  const handleOpenEditKraModal = (kra: Kra) => {
    // Ensure we find the full KRA data from the original props, including its KPIs
    const kraToEdit = krasFromProps.find(k => k.id === kra.id);
    if (kraToEdit) {
      console.log("Editing KRA:", kraToEdit); // Add log to check the data
      setEditingKra(kraToEdit); // Pass the full KRA object with KPIs
      setEditingKpiDetails(undefined); // Ensure KPI-specific edit state is cleared
      setIsKpiModalOpen(true);
    } else {
      console.error("Could not find KRA data in props to edit for ID:", kra.id);
      toast({ title: "Error", description: "Could not find the KRA data to edit.", variant: "destructive" });
    }
  };

  const handleOpenEditKpiModal = (kraId: string | number, kpi: Kpi) => {
    const kraToEdit = kras.find(k => k.id === kraId);
    if (kraToEdit) {
      setEditingKra(kraToEdit);
      setEditingKpiDetails({ kraId: String(kraId), kpi });
      setIsKpiModalOpen(true);
    } else {
      console.error("Could not find parent KRA for KPI editing:", kraId);
    }
  };

  const handleCloseKpiModal = () => {
    setIsKpiModalOpen(false);
    setEditingKra(undefined);
    setEditingKpiDetails(undefined);
  };

  const mapStatusToDbFormat = (status: string): string => {
    // Map UI status format to VALID database format based on unit_kpis_status_check constraint
    const statusMap: Record<string, string> = {
      'On Track': 'on-track',    // Valid
      'At Risk': 'at-risk',     // Valid
      'Completed': 'completed', // Valid
      // Map other UI statuses to 'behind' as it's a valid catch-all status
      'Behind': 'behind',      // Explicitly map 'Behind' if used in UI
      'Off Track': 'behind',
      'In Progress': 'behind',
      'Not Started': 'behind',
      'On Hold': 'behind'
    };
    // Default to 'behind' if no specific mapping found or if input is invalid/null
    return statusMap[status] || 'behind';
  };

  const handleKpiFormSubmit = async (formData: any) => {
    console.log("[handleKpiFormSubmit] Received form data:", JSON.stringify(formData, null, 2));
    const isEditing = !!editingKra?.id;
    let kraId = editingKra?.id;
    let operationError = false;

    // 1. Prepare KRA Payload (Map ONLY active fields from KraFormSection)
    const kraPayload: any = {
      title: formData.title || null, // Map from title input
      objective_id: formData.objectiveId || null, // Map from objective select
      unit_id: formData.unitId || null, // Map from unit select (now storing ID)
      description: formData.comments || null, // Map description FROM comments textarea
      ownerId: formData.responsibleId || formData.ownerId || null, // Map owner if present
    };

    if (isEditing) {
      kraPayload.id = kraId;
    }

    // Get current division ID from localStorage and add it
    const currentDivisionId = localStorage.getItem('current_division_id');
    if (currentDivisionId) {
      kraPayload.division_id = currentDivisionId;
    }

    console.log("[handleKpiFormSubmit] Prepared KRA Payload:", kraPayload);

    // --- KRA Save/Update --- 
    try {
      const savedKra: any = await onSaveKra(kraPayload);
      // If we just created a new KRA, we need its ID to save KPIs
      if (savedKra && savedKra.id) {
        kraId = savedKra.id;
        console.log(`[handleKpiFormSubmit] KRA saved with ID: ${kraId}`);
      }
    } catch (error) {
      console.error("[handleKpiFormSubmit] Unexpected error during KRA save/update:", error);
      operationError = true;
      return;
    }

    // --- KPI Save/Update --- 
    // Only if we have a KRA ID. If we just created one, we might not have it yet unless we fetch it.
    // Ideally, we should await onSaveKra and it should return the ID.
    // Since I can't easily change the Props return type deeply without cascading changes, 
    // I will check if we have `kraId` (Editing). 
    // If New, KPIs might stay orphaned or fail.
    // To support New KRA + KPIs, we'd need onSaveKra to return the new KRA.

    if (!operationError && kraId && formData.kpis && Array.isArray(formData.kpis)) {
      console.log(`[handleKpiFormSubmit] Processing ${formData.kpis.length} KPIs for KRA ID: ${kraId}`);

      // Loop through KPIs and save/update each
      for (const kpi of formData.kpis) {
        const kpiPayload: any = {
          kra_id: kraId, // Link to the parent KRA
          name: kpi.name,
          target: kpi.target || null,
          actual: kpi.actual || null,
          status: mapStatusToDbFormat(kpi.status || 'Not Started'),
          startDate: kpi.startDate || null,
          targetDate: kpi.targetDate || null,
          assignees: kpi.assignees || [],
          description: kpi.description || null,
          comments: kpi.comments || null,
          costAssociated: kpi.costAssociated || null
        };

        if (kpi.id) kpiPayload.id = kpi.id;

        try {
          await onSaveKpi(kpiPayload);
        } catch (err) {
          console.error("Failed to save KPI", err);
          // continue logic?
        }
      }
    }

    // --- Final Steps ---
    if (!operationError) {
      handleCloseKpiModal();
      onDataRefresh?.();
    }
  };

  const handleDeleteKra = (kraId: string | number) => {
    // --- MODIFIED --- Find the KRA object and store it
    const kra = krasFromProps.find(k => k.id === kraId);
    if (kra) {
      console.log("Requesting delete confirmation for KRA:", kra.title, kra.id);
      setKraToDelete(kra); // Store the full object
    } else {
      console.error("Could not find KRA to delete:", kraId);
      toast({ title: "Error", description: "Could not find KRA to delete.", variant: "destructive" });
    }
  };

  const confirmDeleteKra = async () => {
    // --- MODIFIED --- Check for object and ID, get ID from object
    if (!kraToDelete?.id) return;

    const idToDelete = String(kraToDelete.id);
    const kraTitle = kraToDelete.title; // Get title for messages
    console.log("Confirming deletion for KRA:", kraTitle, idToDelete);

    try {
      await onDeleteKra(idToDelete);
      console.log("[confirmDeleteKra] KRA deleted. Attempting to call onDataRefresh...");
      onDataRefresh?.();
    } catch (error: any) {
      console.error("Error deleting KRA:", error);
    } finally {
      setKraToDelete(null); // Close the dialog
    }
  };

  const handleOpenAddObjectiveModal = () => {
    setEditingObjective(undefined);
    setNewObjectiveData({ title: '', description: '' });
    setIsObjectiveModalOpen(true);
  };

  const handleOpenEditObjectiveModal = (objective: Objective) => {
    setEditingObjective(objective);
    setNewObjectiveData({
      title: objective.title,
      description: objective.description,
      status: objective.status,
      progress: objective.progress,
      year: objective.year,
      goalType: objective.goalType,
      division: objective.division,
      unit: objective.unit,
      owner: objective.owner,
      parentGoalId: objective.parentGoalId?.toString() || ''
    });
    setIsObjectiveModalOpen(true);
  };

  const handleCloseObjectiveModal = () => {
    setIsObjectiveModalOpen(false);
    setEditingObjective(undefined);
    setNewObjectiveData({
      unit: '',
      owner: '',
      parentGoalId: ''
    });
  };

  const handleObjectiveFormChange = (field: keyof Objective, value: any) => {
    setNewObjectiveData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-fill logic when Owner changes
      if (field === 'owner') {
        const details = getEmployeeDetails(value);
        if (details) {
          updated.unit = details.department || updated.unit;
          updated.division = details.divisionName || updated.division;
          updated.ownerEmail = details.email;
        }
      }
      return updated;
    });
  };

  const handleSaveObjective = async () => {
    if (!newObjectiveData.title || newObjectiveData.title.trim() === '') {
      toast({ title: "Error", description: "Objective name cannot be empty.", variant: "destructive" });
      return;
    }

    const objId = editingObjective?.id ? Number(editingObjective.id) : undefined;

    const objectivePayload: any = {
      ...(objId ? { id: objId } : {}),
      title: newObjectiveData.title,
      description: newObjectiveData.description,
      status: newObjectiveData.status,
      progress: newObjectiveData.progress,
      year: newObjectiveData.year,
      startDate: newObjectiveData.startDate,
      endDate: newObjectiveData.endDate,
      goalType: newObjectiveData.goalType,
      division: newObjectiveData.division,
      unit: newObjectiveData.unit,
      owner: newObjectiveData.owner,
      parentGoalId: newObjectiveData.parentGoalId || null
    };

    console.log('[handleSaveObjective] Attempting to save objective via parent props:', objectivePayload);

    try {
      await onSaveObjective(objectivePayload);
      handleCloseObjectiveModal();
    } catch (error) {
      console.error('[handleSaveObjective] Parent component failed to save:', error);
      // Toast is handled by parent
    }
  };

  const handleDeleteObjective = (objectiveId: string | number) => {
    if (window.confirm("Are you sure you want to delete this objective? This might affect linked KRAs.")) {
      onDeleteObjective(objectiveId);
    }
  };

  // Use activeTab prop here
  const addButtonLabel = activeTab === 'objectives' ? 'Add Objective' : 'Add KRA';
  const handleAddButtonClick = activeTab === 'objectives' ? handleOpenAddObjectiveModal : handleOpenAddKraModal;

  // --- START: Add KPI Timeline Items ---
  const kpiTimelineItems = kras.flatMap(kra =>
    (kra.unitKpis || []).map(kpi => ({
      id: `kpi-${kpi.id}`,
      title: kpi.name || 'Untitled KPI', // Assuming 'name' field exists
      group: kra.id, // Group KPI under its KRA
      start_time: moment(kpi.startDate), // Using startDate instead of start_date
      end_time: moment(kpi.targetDate), // Using targetDate instead of end_date
      itemProps: {
        style: {
          // Style based on KPI status or type - using a distinct color for now
          background: '#2196F3', // Example blue color for KPIs
          color: 'white',
          borderLeft: '3px solid #1976D2', // Add a border to distinguish
        },
      },
      details: `KPI: ${kpi.description || 'No description'}`, // Assuming 'description' field exists
    }))
  );
  // --- END: Add KPI Timeline Items ---

  // Empty arrays for timeline items to prevent errors
  const timelineItems: any[] = [];
  const kraTimelineItems: any[] = [];

  // Need groups based on objectives AND KRAs now for KPIs to group correctly
  const timelineGroups = [
    ...objectivesData.map(obj => ({
      id: obj.id,
      title: `Objective: ${obj.title}`, // Using title instead of name
    })),
    ...kras.map(kra => ({
      id: kra.id,
      title: `KRA: ${kra.title}`, // Using title instead of name
      // Optionally nest under objective: parent: kra.objective_id?.toString()
    }))
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-0.5">
              <CardTitle>KRAs / KPIs / Objectives</CardTitle>
              <CardDescription>
                Track performance, manage objectives, and view timelines.
              </CardDescription>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={handleAddButtonClick}
            >
              <Plus className="h-4 w-4" /> {addButtonLabel}
            </Button>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="kpis">KRA/KPIs</TabsTrigger>
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>


              <TabsContent value="kpis">
                <div className="overflow-x-auto border rounded-md">
                  <Table className="min-w-full table-fixed md:table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px] min-w-[150px] sticky left-0 z-30 bg-background border-r">Objective</TableHead>
                        <TableHead className="w-[200px] min-w-[200px] sticky left-[150px] z-30 bg-background border-r">KRA</TableHead>
                        <TableHead className="w-[20%] min-w-[200px]">KPI</TableHead>
                        <TableHead className="min-w-[100px]">Start Date</TableHead>
                        <TableHead className="min-w-[100px]">Target Date</TableHead>
                        <TableHead className="min-w-[80px]">Quarter</TableHead>
                        <TableHead className="min-w-[80px]">Target</TableHead>
                        <TableHead className="min-w-[80px]">Actual</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Cost</TableHead>
                        <TableHead className="min-w-[120px]">Assignees</TableHead>
                        <TableHead className="min-w-[150px]">Comments</TableHead>
                        <TableHead>Linked Tasks</TableHead>
                        <TableHead className="text-right min-w-[100px] sticky right-0 bg-background border-l z-30">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="h-24 text-center">
                            No KPIs found matching the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        processedRows.map((row, rowIndex) => {
                          const {
                            kpi,
                            originalKra,
                            isFirstRowOfObjective,
                            objectiveRowSpan,
                            objectiveName,
                            isFirstRowOfKraTitleGroup,
                            kraTitleRowSpan,
                            kraTitle
                          } = row;
                          const targetQuarter = getQuarter(kpi?.target_date || kpi?.targetDate);
                          const isFirstKpiOfOriginalKra = (originalKra as any).unitKpis?.[0]?.id === kpi.id || (!kpi.id && !(originalKra as any).unitKpis?.length);

                          const linkedTasks = tasks.filter(
                            (task) => task.kpi_id === kpi.id?.toString()
                          );

                          return (
                            <TableRow key={`${originalKra.id}-${kpi?.id || rowIndex}`}>
                              {isFirstRowOfObjective && (
                                <TableCell className="align-top border-r text-sm font-medium sticky left-0 z-20 bg-card" rowSpan={objectiveRowSpan}>
                                  {objectiveName}
                                </TableCell>
                              )}
                              {isFirstRowOfKraTitleGroup && (
                                <TableCell className="align-top border-r sticky left-[150px] z-20 bg-card" rowSpan={kraTitleRowSpan}>
                                  {kraTitle}
                                </TableCell>
                              )}
                              {/* KPI Cells */}
                              <TableCell className="align-top text-sm">{kpi?.name !== '-' ? kpi?.name : <span className="text-muted-foreground">-</span>}</TableCell>
                              <TableCell className="align-top text-sm whitespace-nowrap">{formatDate(kpi?.start_date || kpi?.startDate)}</TableCell>
                              <TableCell className="align-top text-sm whitespace-nowrap">{formatDate(kpi?.target_date || kpi?.targetDate)}</TableCell>
                              <TableCell className="align-top text-sm">{targetQuarter}</TableCell>
                              <TableCell className="align-top text-sm">{kpi?.target ?? '-'}</TableCell>
                              <TableCell className="align-top text-sm">{kpi?.actual ?? '-'}</TableCell>
                              <TableCell className="align-top whitespace-nowrap">
                                {kpi?.status ? <StatusBadge status={kpi.status} /> : <span className="text-muted-foreground">-</span>}
                              </TableCell>
                              <TableCell className="align-top text-sm whitespace-nowrap">{formatCurrency(kpi?.costAssociated)}</TableCell>
                              <TableCell className="align-top">
                                {kpi?.assignees && kpi.assignees.length > 0 ? (
                                  <div className="flex -space-x-2 overflow-hidden">
                                    {(kpi.assignees as any[]).map((assignee: any, index: number) => (
                                      <Tooltip key={assignee.id || `assignee-${index}`}>
                                        <TooltipTrigger asChild>
                                          <Avatar className="h-6 w-6 border-2 border-background">
                                            <AvatarImage src={assignee.avatarUrl} />
                                            <AvatarFallback>{assignee.initials || assignee.name?.substring(0, 2) || '?'}</AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{assignee.name || 'Unknown Assignee'}</p></TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </div>
                                ) : <span className="text-muted-foreground">-</span>}
                              </TableCell>
                              <TableCell className="align-top text-xs text-muted-foreground">{kpi?.comments || '-'}</TableCell>
                              <TableCell className="align-top">
                                {linkedTasks.length > 0 ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-auto py-1 px-2">
                                        {linkedTasks.length} {linkedTasks.length === 1 ? 'Task' : 'Tasks'}
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-2">
                                      <div className="space-y-1">
                                        <p className="font-semibold text-sm mb-1">Linked Tasks</p>
                                        {linkedTasks.map(task => (
                                          <div key={task.id} className="text-xs p-1.5 bg-muted/50 rounded-sm">
                                            {task.title}
                                          </div>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </TableCell>
                              <TableCell className="align-top text-right sticky right-0 bg-card border-l px-2 py-1 whitespace-nowrap align-middle">
                                <div className="flex justify-end items-center space-x-1">
                                  {kpi && kpi.id && kpi.name !== '-' && (
                                    <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 h-auto"
                                            onClick={() => handleOpenEditKpiModal(row.originalKra.id, row.kpi)}
                                            aria-label="Edit KPI"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="z-[100]">Edit KPI</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto mr-1"
                                          onClick={() => handleOpenEditKraModal(row.originalKra)}
                                          aria-label="Edit KRA"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="z-[100]">Edit KRA (and its KPIs)</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteKra(row.originalKra.id)}
                                          aria-label="Delete KRA"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="z-[100]">Delete KRA (and its KPIs)</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="objectives">
                <div className="overflow-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[15%]">Objective Name</TableHead>
                        <TableHead className="w-[15%]">Goal Type</TableHead>
                        <TableHead className="w-[15%]">Strategic Alignment</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right w-[10%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {objectivesData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No Objectives defined yet. Use the "Add Objective" button.
                          </TableCell>
                        </TableRow>
                      ) : (
                        objectivesData.map((objective) => (
                          <TableRow key={objective.id}>
                            <TableCell className="font-medium">{objective.title}</TableCell>
                            <TableCell>
                              <Badge
                                variant={objective.goalType === 'Org' ? 'default' : 'secondary'}
                                className={objective.goalType === 'Org' ? 'bg-intranet-primary' : ''}
                              >
                                {objective.goalType || 'Unit'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {objective.parentGoalTitle ? (
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                  {objective.parentGoalTitle}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-[10px] italic">Direct/Board</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{objective.description || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditObjectiveModal(objective)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteObjective(objective.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div>
                  <KRATimelineTab
                    kras={kras}
                    objectives={objectivesData}
                  />
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <KRAInsightsTab kras={kras} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <KpiModal
          isOpen={isKpiModalOpen}
          onClose={handleCloseKpiModal}
          kraData={editingKra}
          onSubmit={handleKpiFormSubmit}
          staffMembers={staffMembers}
          objectives={objectivesData}
          units={units}
          existingKraTitles={existingKraTitles}
          userContext={userContext}
          editingKpi={editingKpiDetails}
        />

        <Dialog open={isObjectiveModalOpen} onOpenChange={handleCloseObjectiveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingObjective ? 'Edit Objective' : 'Add New Objective'}</DialogTitle>
              <DialogDescription>
                {editingObjective ? 'Update the objective details.' : 'Define a new objective for KRAs.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              {/* Row 1: Title & Year */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="objective-name" className="text-right">Name</Label>
                <Input
                  id="objective-name"
                  value={newObjectiveData.title || ''}
                  onChange={(e) => handleObjectiveFormChange('title', e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="objective-year" className="text-right">Year</Label>
                <Input
                  id="objective-year"
                  value={newObjectiveData.year || ''}
                  onChange={(e) => handleObjectiveFormChange('year', e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. 2024"
                />
              </div>

              {/* Row 2: Owner Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Owner</Label>
                <div className="col-span-3">
                  <Popover open={isOwnerPopoverOpen} onOpenChange={setIsOwnerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOwnerPopoverOpen}
                        className="w-full justify-between"
                      >
                        {newObjectiveData.owner || "Select Owner..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search employee..." />
                        <CommandList>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {!isLoadingEmployees && employees && employees.map((employee: any) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.displayName}
                                onSelect={(currentValue) => {
                                  handleObjectiveFormChange('owner', currentValue);
                                  setIsOwnerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newObjectiveData.owner === employee.displayName ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {employee.displayName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Row 3: Division & Unit (Auto-filled) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Division</Label>
                <Input
                  value={newObjectiveData.division || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                  placeholder="Auto-filled based on Owner"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Unit</Label>
                <Input
                  value={newObjectiveData.unit || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                  placeholder="Auto-filled based on Owner"
                />
              </div>

              {/* Row 4: Status & Progress */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select
                  value={newObjectiveData.status}
                  onValueChange={(val) => handleObjectiveFormChange('status', val)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Deferred">Deferred</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Goal Type</Label>
                <Select
                  value={newObjectiveData.goalType}
                  onValueChange={(val) => handleObjectiveFormChange('goalType', val)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Goal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Org">Org (Board/Strategic)</SelectItem>
                    <SelectItem value="Division">Division</SelectItem>
                    <SelectItem value="Unit">Unit</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Start Date</Label>
                <div className="col-span-3">
                  <DatePicker
                    date={newObjectiveData.startDate ? new Date(newObjectiveData.startDate) : undefined}
                    setDate={(date) => handleObjectiveFormChange('startDate', date)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">End Date</Label>
                <div className="col-span-3">
                  <DatePicker
                    date={newObjectiveData.endDate ? new Date(newObjectiveData.endDate) : undefined}
                    setDate={(date) => handleObjectiveFormChange('endDate', date)}
                  />
                </div>
              </div>


              {/* Strategic Alignment */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right whitespace-nowrap">Strategic Alignment</Label>
                <div className="col-span-3">
                  <Select
                    value={newObjectiveData.parentGoalId?.toString() || 'none'}
                    onValueChange={(val) => handleObjectiveFormChange('parentGoalId', val === 'none' ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Align with Strategic Objective..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Standalone (No Alignment)</SelectItem>
                      {objectivesData
                        .map(obj => (
                          <SelectItem key={obj.id} value={obj.id.toString()}>
                            {obj.title}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Link this unit objective to a high-level Board/Strategic objective.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="objective-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="objective-description"
                  value={newObjectiveData.description || ''}
                  onChange={(e) => handleObjectiveFormChange('description', e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveObjective}>Save Objective</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={kraToDelete !== null} onOpenChange={(open) => !open && setKraToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the Key Result
                Area <strong>"{kraToDelete?.title}"</strong> and all of its associated KPIs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setKraToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteKra} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default KRAsTab;
