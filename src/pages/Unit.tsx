import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarIcon, ChevronDownIcon, Inbox, LayoutGrid, Loader2,
  Mail, MoreVertical, Settings, MoreHorizontal,
  AlertTriangle, CheckCircle, Clock, Target, Calendar, BarChart2,
  Flag, Briefcase, Download, ArrowUp, ArrowDown, Upload, Play, ArrowRight,
  Edit, Eye, FileText, Filter, Plus, Trash2, User as UserIcon,
  Kanban,
  List
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import KRATimeline from '@/components/KRATimeline';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  Cell,
  ResponsiveContainer,
  Line,
  PieChart as RechartsPieChart,
  BarChart,
  LineChart
} from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import KRATimelineTab from '@/components/KRATimelineTab';
import KRAInsightsTab from '@/components/KRAInsightsTab';

// Import unit-tabs components
import { KRAsTab } from '@/components/unit-tabs/KRAsTab';

// Import modal components
import DailyLogModal from '@/components/unit-tabs/modals/DailyLogModal';
import AddTaskModal from '@/components/unit-tabs/modals/AddTaskModal';
import EditTaskModal from '@/components/unit-tabs/modals/EditTaskModal';
import DeleteModal from '@/components/unit-tabs/modals/DeleteModal';
import AddProjectModal from '@/components/unit-tabs/modals/AddProjectModal';
import EditProjectModal from '@/components/unit-tabs/modals/EditProjectModal';
import AddRiskModal from '@/components/unit-tabs/modals/AddRiskModal';
import EditRiskModal from '@/components/unit-tabs/modals/EditRiskModal';

import {
  useSharePointKRAs,
  useSharePointKPIs,
  useSharePointProjects,
  useSharePointTasks,
  useSharePointObjectives
} from '@/hooks/useSharePointOps';

import { OrganizationUnit, Objective, Kra, Kpi, KRA, Task } from '@/types';
import { useStaffByDepartment } from '@/hooks/useStaffByDepartment';
import { StaffMember } from '@/types/staff';

import DivisionStaffMap from '@/utils/divisionStaffMap';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useGraphProfile } from '@/hooks/useGraphProfile';

// Import tab components
import TaskDialog from '@/components/unit-tabs/TaskDialog';
import { TasksTab } from '@/components/unit-tabs/TasksTab';
import { ProjectsTab } from '@/components/unit-tabs/ProjectsTab';
import { OverviewTab } from '@/components/unit-tabs/OverviewTab';
import { ReportsTab } from '@/components/unit-tabs/ReportsTab';


import { SharePointListSetupService } from '@/services/sharePointListSetupService';
import { getGraphClient } from '@/services/graphService';
import { useMsal } from '@azure/msal-react';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';


// Define status options for dropdowns
const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' }
];

type ViewMode = 'board' | 'grid' | 'list';

// Define structure for unit data (now representing departments)
interface UnitData {
  id: string; // Use department name as ID
  name: string;
}

interface IdentifiableWithStringId {
  id?: string; // Ensure id is always string for this hook context
  assigned_to_email?: string | null;
}

// Type assertion helper if needed, but often casting directly is fine
function ensureStringId<T extends { id?: string | number }>(item: T): T & { id?: string } {
  return { ...item, id: item.id?.toString() };
}

// StatusDropdown Component
const StatusDropdown: React.FC<{
  currentStatus: string,
  onStatusChange: (newStatus: string) => void,
  options?: Array<{ value: string, label: string }>,
}> = ({
  currentStatus,
  onStatusChange,
  options = statusOptions,
}) => {
    return (
      <Select defaultValue={currentStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

// Define the main Unit component
const Unit = () => {
  const { user } = useSupabaseAuth();
  const { staffMembers, currentUserDepartment } = useStaffByDepartment();
  const { toast } = useToast();

  // Determine effective department for filtering
  // Use a default or the logged-in user's department
  // If no department found, it fetches all (good for Admin) or none. 
  // For now let's default to fetching all if undefined, or pass what we have.
  const targetDepartment = currentUserDepartment || user?.user_metadata?.divisionName;
  // console.log('🔍 [Unit.tsx] targetDepartment:', targetDepartment);

  // Read view settings
  const [viewSettings, setViewSettings] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('unitopia_view_settings');
    if (saved) {
      try { setViewSettings(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const getScopeForComponent = (componentName: string, defaultScope: 'Division' | 'Unit' = 'Division') => {
    const config = viewSettings.find(c => c.component === componentName);
    return config ? config.scope : defaultScope;
  };

  // USE GRAPH PROFILE for Context (Matches Settings Page)
  const { profile: graphProfile } = useGraphProfile();

  // Move roleUser hook BEFORE userContext to avoid reference error
  const { user: roleUser } = useRoleBasedAuth();

  const userContext = useMemo(() => ({
    // Prioritize Graph Profile (matches 'User Information' page), fallback to Supabase
    division: graphProfile?.officeLocation || user?.user_metadata?.divisionName || 'General',
    unit: graphProfile?.department || user?.user_metadata?.unitName || 'General',
    email: graphProfile?.mail || user?.email || '',
    name: graphProfile?.displayName || user?.user_metadata?.full_name || user?.email || '',
    role: roleUser?.role_name
  }), [user, graphProfile, roleUser]);

  // Initialize data states first
  // Switched to SharePoint Hooks
  const taskState = useSharePointTasks(targetDepartment, getScopeForComponent('Tasks', 'Unit'), userContext);
  const projectState = useSharePointProjects(targetDepartment, getScopeForComponent('Projects', 'Unit'), userContext);
  const kraState = useSharePointKRAs(targetDepartment, getScopeForComponent('KRAs', 'Division'), userContext);
  const kpiState = useSharePointKPIs(targetDepartment, userContext);


  // SharePoint List Setup
  const { instance: msalInstance } = useMsal();

  const [isSettingUpLists, setIsSettingUpLists] = useState(false);

  // Active Tab State for the main page sections
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [kraSectionTab, setKraSectionTab] = useState<string>("kpis"); // Renamed from kraSectionTab
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  const objectivesState = useSharePointObjectives(targetDepartment, getScopeForComponent('Objectives', 'Division'), userContext);
  const objectivesData = objectivesState.data;
  const objectivesLoading = objectivesState.loading;
  const objectivesError = objectivesState.error;

  // --- Wrapper for refreshing all data ---
  const handleRefreshAllData = useCallback(() => {
    objectivesState.refresh();
    kraState.refresh?.();
    kpiState.refresh?.();
    taskState.refresh?.();
    projectState.refresh?.();
  }, [objectivesState, kraState, kpiState, taskState, projectState]);

  // --- Modified Objective Handlers (Moved Down) ---
  const handleSaveObjective = useCallback(async (objective: Objective) => {
    try {
      if (objective.id) {
        await objectivesState.update(String(objective.id), objective);
      } else {
        await objectivesState.add(objective);
      }
      toast({ title: "Success", description: "Objective saved to SharePoint." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save objective", variant: "destructive" });
      throw e;
    }
  }, [objectivesState]);

  const handleDeleteObjective = useCallback(async (objectiveId: string | number) => {
    try {
      await objectivesState.remove(String(objectiveId));
      toast({ title: "Success", description: "Objective deleted from SharePoint." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to delete objective", variant: "destructive" });
      throw e;
    }
  }, [objectivesState]);

  const handleSaveKra = useCallback(async (kra: Partial<Kra>) => {
    try {
      let result;
      if (kra.id) {
        result = await kraState.update(String(kra.id), kra);
      } else {
        result = await kraState.add(kra);
      }
      toast({ title: "Success", description: "KRA saved to SharePoint." });
      return result;
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save KRA", variant: "destructive" });
      throw e;
    }
  }, [kraState]);

  const handleDeleteKra = useCallback(async (kraId: string | number) => {
    try {
      await kraState.remove(String(kraId));
      toast({ title: "Success", description: "KRA deleted from SharePoint." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to delete KRA", variant: "destructive" });
      throw e;
    }
  }, [kraState]);

  const handleSaveKpi = useCallback(async (kpi: Partial<Kpi>) => {
    try {
      // Logic to distinguish add/update: check if it has a real ID (SharePoint IDs are usually integers as strings)
      // If it's a new temporary item, it won't have a numeric ID from SP yet.
      // Assuming if ID is present and not matching 'temp', it's update.
      if (kpi.id && String(kpi.id).length < 10 && !String(kpi.id).startsWith('temp')) {
        await kpiState.update(String(kpi.id), kpi);
      } else {
        // Remove temp ID before sending if present? SP doesn't care about extra fields usually but clean is better
        const { id, ...kpiData } = kpi;
        await kpiState.add(kpiData);
      }
      toast({ title: "Success", description: "KPI saved to SharePoint." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save KPI", variant: "destructive" });
      throw e;
    }
  }, [kpiState]);

  const handleDeleteKpi = useCallback(async (kpiId: string | number) => {
    try {
      await kpiState.remove(String(kpiId));
      toast({ title: "Success", description: "KPI deleted from SharePoint." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to delete KPI", variant: "destructive" });
      throw e;
    }
  }, [kpiState]);

  // Create/Task Handlers
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleTaskSubmit = (taskData: Partial<Task>) => {
    if (editingTask) {
      // Safe to ignore id mismatch for now as we deal with mocked writes
      // @ts-ignore
      taskState.update(editingTask.id, taskData);
    } else {
      // @ts-ignore
      taskState.add(taskData as Omit<Task, 'id'>);
    }
    setIsDialogOpen(false);
  };

  // SharePoint List Setup Handler
  const handleSetupStrategyLists = async () => {
    // Check if user is admin (SharePoint uses is_admin, not role_level)
    if (!roleUser?.is_admin) {
      toast({
        title: "Permission Denied",
        description: "Only admins can create SharePoint lists",
        variant: "destructive"
      });
      return;
    }

    setIsSettingUpLists(true);

    try {
      toast({
        title: "Creating SharePoint Lists",
        description: "This may take a minute...",
      });

      // Get Graph client
      const graphClient = await getGraphClient(msalInstance);
      if (!graphClient) {
        throw new Error('Failed to get Graph client');
      }

      // Get site ID
      const site = await graphClient
        .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
        .get();

      // Create setup service
      const setupService = new SharePointListSetupService(graphClient, site.id);

      // Check if lists already exist
      const { exists, lists } = await setupService.checkExistingLists();

      if (exists) {
        toast({
          title: "Lists Already Exist",
          description: `Found existing lists: ${lists.join(', ')}`,
          variant: "destructive"
        });
        setIsSettingUpLists(false);
        return;
      }

      // Create all lists
      const result = await setupService.createAllLists();

      if (result.success) {
        toast({
          title: "✅ Success!",
          description: "All Strategy lists created successfully with sample data",
        });
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      console.error('Failed to setup lists:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create SharePoint lists",
        variant: "destructive"
      });
    } finally {
      setIsSettingUpLists(false);
    }
  };

  // --- Derive Departments from DivisionStaffMap ---
  const derivedUnits = useMemo((): UnitData[] => {
    try {
      const allStaff = DivisionStaffMap.getAllStaff();
      // Safely access department with type check
      const departmentNames = allStaff
        .map(staff => ('department' in staff ? staff.department : null))
        .filter(Boolean) as string[];
      const uniqueDepartmentNames = Array.from(new Set(departmentNames));
      return uniqueDepartmentNames.map(name => ({ id: name, name: name }));
    } catch (error) {
      console.error("Error deriving units from DivisionStaffMap:", error);
      return [];
    }
  }, []);

  // --- Effect to load data on mount ---
  useEffect(() => {
    // Objectives are handled by the hook
    taskState.refresh?.();
    projectState.refresh?.();
    kraState.refresh?.();
    kpiState.refresh?.();
  }, [taskState.refresh, projectState.refresh, kraState.refresh, kpiState.refresh]);

  // --- Combine KRAs and KPIs --- 
  const combinedKrasForTabs = useMemo(() => {
    const kras = kraState.data || [];
    const kpis = kpiState.data || [];

    const kpisByKraId = kpis.reduce((acc, kpi) => {
      const kraId = kpi.kra_id;
      if (kraId) {
        if (!acc[kraId]) {
          acc[kraId] = [];
        }
        acc[kraId].push(kpi);
      }
      return acc;
    }, {} as Record<string | number, Kpi[]>);

    return kras.map((kra): Kra => {
      const kpisForKra: Kpi[] = kpisByKraId[kra.id] || [];
      return {
        ...kra,
        unitKpis: kpisForKra,
      };
    });
  }, [kraState.data, kpiState.data]);

  const combinedKrasForOverview = useMemo(() => {
    return (kraState.data || []).map((kra): KRA => {
      const objective = objectivesData.find(o => String(o.id) === String(kra.objective_id));
      return {
        id: kra.id.toString(),
        name: kra.title,
        objectiveId: kra.objective_id?.toString() ?? '',
        objectiveName: objective?.title ?? 'N/A',
        department: kra.department ?? 'N/A',
        responsible: kra.owner?.name ?? 'N/A',
        startDate: kra.startDate ? new Date(kra.startDate) : new Date(),
        endDate: kra.targetDate ? new Date(kra.targetDate) : new Date(),
        progress: 0, // Default value
        status: 'open', // Default value
        kpis: [], // Default value
        createdAt: kra.createdAt ?? new Date().toISOString(),
        updatedAt: kra.updatedAt ?? new Date().toISOString(),
        title: kra.title,
        objective_id: kra.objective_id,
        unit: kra.unit,
        unitId: kra.unitId,
        targetDate: kra.targetDate,
        unitKpis: [],
        owner: kra.owner,
        ownerId: kra.ownerId,
        unitObjectives: kra.unitObjectives,
      };
    });
  }, [kraState.data, objectivesData]);

  // Determine if data loading is complete
  const isDataLoading = objectivesLoading || taskState.loading || projectState.loading || kraState.loading || kpiState.loading;
  // Determine if there was an error
  const hasDataLoadingError = objectivesError || taskState.error || projectState.error || kraState.error || kpiState.error;

  // Main content rendering
  return (
    <PageLayout>
      {user && (user.user_metadata?.unitName || user.user_metadata?.divisionName) && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {/* Display user's actual department if available from hook */}
            Unit/Department: {currentUserDepartment || user.user_metadata?.unitName || user.user_metadata?.divisionName || 'N/A'}
          </div>

          {/* Admin Setup Button */}
          {roleUser?.is_admin && (
            <Button
              onClick={handleSetupStrategyLists}
              disabled={isSettingUpLists}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isSettingUpLists ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Lists...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Setup Strategy Lists
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {isDataLoading && (
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> Loading Unit & Strategy Data...</div>
      )}
      {hasDataLoadingError && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Data Loading Error</CardTitle>
            <CardDescription className="text-destructive">
              There was an error loading some unit data. Please check the data sources or try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {objectivesError && <p>Objectives Error: {objectivesError.message}</p>}
            {taskState.error && <p>Tasks Error: {taskState.error.message}</p>}
            {projectState.error && <p>Projects Error: {projectState.error.message}</p>}
            {kraState.error && <p>KRAs Error: {kraState.error.message}</p>}
            {kpiState.error && <p>KPIs Error: {kpiState.error.message}</p>}
          </CardContent>
        </Card>
      )}

      {!isDataLoading && !hasDataLoadingError && (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>

              <TabsTrigger value="tasks">Tasks/Daily Operations</TabsTrigger>
              <TabsTrigger value="kras-objectives">KRAs & Objectives</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              {/* User Context Badge for Verification */}
              <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 border rounded-md text-sm text-muted-foreground whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{userContext.name || 'Guest'}</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">Div</Badge>
                  <span>{userContext.division}</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">Unit</Badge>
                  <span>{userContext.unit}</span>
                </div>
              </div>

              {activeTab === 'tasks' && (
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <div className="flex items-center gap-2">
                    {/* Task view buttons shortened for space */}
                    <Button variant={viewMode === 'board' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('board')} title="Board View"><Kanban className="h-4 w-4" /></Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')} title="List View"><List className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsDailyLogOpen(true)}>
                    <Clock className="mr-2 h-3.5 w-3.5" /> Check-in
                  </Button>
                  <Button size="sm" onClick={handleCreateTask}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Task
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <OverviewTab
              projects={projectState.data}
              tasks={taskState.data}
              // kras={combinedKrasForOverview} // Pass raw KRAs for debugging
              kras={combinedKrasForOverview} // Pass the combined data structure
              objectives={objectivesData}
            />
          </TabsContent>



          {/* Tasks/Daily Operations Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <TasksTab
              tasks={taskState.data.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()))}
              addTask={taskState.add}
              editTask={taskState.update}
              deleteTask={taskState.remove}
              error={taskState.error}
              onRetry={taskState.refresh}
              staffMembers={staffMembers}
              objectives={objectivesData}
              setEditingTask={setEditingTask}
              setIsDialogOpen={setIsDialogOpen}
              viewMode={viewMode}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <ProjectsTab
              projects={projectState.data}
              addProject={projectState.add}
              editProject={projectState.update}
              deleteProject={projectState.remove}
              error={projectState.error}
              onRetry={projectState.refresh}
              staffMembers={staffMembers}
              objectives={objectivesData}
            />
          </TabsContent>



          {/* KRAs & Objectives Tab */}
          <TabsContent value="kras-objectives" className="space-y-6">
            <KRAsTab
              kras={combinedKrasForTabs}
              tasks={taskState.data}
              objectivesData={objectivesData}
              onSaveObjective={handleSaveObjective}
              onDeleteObjective={handleDeleteObjective}
              units={derivedUnits}
              staffMembers={staffMembers}
              onDataRefresh={handleRefreshAllData}
              activeTab={kraSectionTab}
              onTabChange={setKraSectionTab}
              userContext={userContext}
              onSaveKra={handleSaveKra}
              onDeleteKra={handleDeleteKra}
              onSaveKpi={handleSaveKpi}
              onDeleteKpi={handleDeleteKpi}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsTab
              tasks={taskState.data}
              kras={combinedKrasForTabs}
              projects={projectState.data}
              objectives={objectivesData}
            />
          </TabsContent>
        </Tabs>
      )}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        staffMembers={staffMembers}
        buckets={[]}
        kras={combinedKrasForTabs}
        kpis={kpiState.data}
      />

      <DailyLogModal
        isOpen={isDailyLogOpen}
        onClose={() => setIsDailyLogOpen(false)}
      />
    </PageLayout>
  );
};

export default Unit;
