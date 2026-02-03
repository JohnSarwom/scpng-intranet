// Import the ChecklistItem interface
import { ChecklistItem } from '@/components/ChecklistSection';

// Define Risk interface with all required properties
export interface Risk {
  id: string;
  title: string;
  description: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'resolved' | 'accepted';
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high' | 'very-high';
  category: string;
  owner: string;
  identificationDate: Date;
  mitigationPlan?: string;
  createdAt: Date;
  updatedAt: Date;
  checklist?: ChecklistItem[];
  unit_id?: string;
  division_id?: string;
}

export interface KPI {
  id: string;
  name: string;
  date: Date;
  startDate: Date;
  target: string;
  actual: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  description: string;
  notes: string;
  checklist?: ChecklistItem[];
  unit_id?: string;
  kra_id?: string | number | null;
  assignees?: User[];
  metric?: string;
  unit?: string;
  progress?: number;
  costAssociated?: number;
}

export interface KRA {
  id: string;
  name: string;
  objectiveId: string;
  objectiveName: string;
  department: string;
  responsible: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'open' | 'in-progress' | 'closed';
  kpis: KPI[];
  createdAt: string;
  updatedAt: string;
  checklist?: ChecklistItem[];
  unit_id?: string;
  title: string;
  description?: string;
  objective_id?: string | number | null;
  unit?: string | null;
  unitId?: string | number | null;
  targetDate?: string;
  unitKpis?: Kpi[];
  owner?: User | null;
  ownerId?: string | number | null;
  unitObjectives?: { title: string } | null;
  assignees?: User[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  assignedTo?: string;
  startDate?: Date;
  projectId?: string;
  projectName?: string;
  completionPercentage?: number;
  checklist?: ChecklistItem[];
  unit_id?: string;
  kra_id?: string;
  kpi_id?: string;
  completed?: boolean;
  recurrence?: string;
  tags?: string[];
  subtasks?: { id: string; text: string; completed: boolean }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  startDate: Date;
  endDate: Date;
  manager: string;
  budget: number;
  budgetSpent: number;
  progress: number;
  risks: Risk[];
  tasks: Task[];
  checklist?: ChecklistItem[];
  unit_id?: string;
}

export interface UserAsset {
  id: string;
  name: string;
  type?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  asset_id?: string;
  description?: string;
  assigned_date: string;
  assigned_to?: string;
  assigned_to_email?: string;
  unit?: string;
  division?: string;
  purchase_date?: string;
  purchase_cost?: number | null;
  depreciated_value?: number | null;
  vendor?: string;
  warranty_expiry_date?: string;
  invoice_url?: string;
  expiry_date?: string;
  life_expectancy_years?: number;
  condition?: string;
  ytd_usage?: string;
  specifications?: Record<string, any>;
  notes?: string;
  barcode_url?: string;
  image_url?: string;
  admin_comments?: string;
  last_updated?: string;
  last_updated_by?: string;
  created_at?: string;
  created_by?: string;
  deleted_at?: string;
  deleted_by?: string;
  is_deleted?: boolean;
  checklist?: ChecklistItem[];
}

export interface OrganizationUnit {
  id: string;
  name: string;
  description?: string;
  code?: string;
  manager?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Division {
  id: string;
  name: string;
  description?: string;
  code: string;
  manager?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  position?: string;
  department?: string;
  isAdmin: boolean;
  divisionId?: string;
  divisionRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitMembership {
  id: string;
  userId: string;
  unitId: string;
  role: string;
  createdAt: Date;
}

export interface DivisionMembership {
  id: string;
  userId: string;
  divisionId: string;
  role: 'director' | 'manager' | 'officer' | 'staff';
  createdAt: Date;
}

export type DivisionRole = 'director' | 'manager' | 'officer' | 'staff';

export type StatusType =
  | 'todo' | 'in-progress' | 'review' | 'done'
  | 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'resolved' | 'accepted';

export type KraItem = {
  kra: KRA;
  kpi: KPI;
  index: number;
};

// Filter types
export type FilterScope = 'All' | 'Division' | 'Unit' | 'Individual';

export interface UserContext {
  division: string;
  unit: string;
  email: string;
  name: string;
  role?: string;
}

// Filter state types
export type FilterState = {
  [key: string]: string;
};

export type TaskFilterState = FilterState & {
  status: string;
  assignee: string;
  priority: string;
  dueDate: string;
};

export type KraFilterState = FilterState & {
  kraId: string;
  department: string;
  kpiStatus: string;
  responsible: string;
};

export type ProjectFilterState = FilterState & {
  status: string;
  manager: string;
  dateRange: string;
};

export type RiskFilterState = FilterState & {
  status: string;
  impact: string;
  likelihood: string;
  category: string;
  owner: string;
};

export type AssetFilterState = FilterState & {
  type: string;
  status: string;
  department: string;
  assignedTo: string;
};

export interface User {
  id: string | number;
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface Objective {
  id: string | number;
  title: string;
  description?: string;
  // New fields for SharePoint compatibility and consolidation
  status?: string;
  progress?: number;
  year?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  goalType?: string;
  division?: string;
  unit?: string;
  owner?: string;
  ownerEmail?: string;
  parentGoalId?: string | number | null;
  parentGoalTitle?: string;
  icon?: string;
  isFeatured?: boolean;
  deliverables?: string[];
}

export type KraStatus = 'on-track' | 'at-risk' | 'off-track' | 'completed' | 'pending';
export interface Kpi {
  tempId?: string;
  id: string | number;
  kra_id?: string | number | null;
  name: string;
  description?: string;
  target: number;
  actual?: number;
  startDate?: string;
  start_date?: string;
  targetDate?: string;
  target_date?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'at-risk' | 'on-track' | 'behind';
  comments?: string;
  assignees?: User[];
  metric?: string;
  unit?: string;
  progress?: number;
  costAssociated?: number;
}
export interface Kra {
  id: string | number;
  title: string;
  objective_id?: string | number | null;
  unit?: string | null;
  unitId?: string | number | null;
  startDate?: string;
  start_date?: string;
  targetDate?: string;
  target_date?: string;
  unitKpis?: Kpi[];
  description?: string | null;
  department?: string | null;
  status?: KraStatus;
  owner?: User | null;
  ownerId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  unitObjectives?: { title: string } | null;
}

export interface IAnnouncement {
  id: string;
  title: string;
  content: string;
  category: "Announcement" | "Event" | "Update" | "Alert";
  isPinned: boolean;
  expiryDate?: Date;
  sourceEmail?: string;
  author?: string;
  createdDate: Date;
}
