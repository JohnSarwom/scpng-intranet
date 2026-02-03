export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  manager: string;
  budget: number;
  budgetSpent: number;
  progress: number;
  risks: string[];
  tasks: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: string;
  likelihood: string;
  status: string;
  category: string;
  projectId: string;
  projectName: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignedTo: string;
  department: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: string;
  notes: string;
}

export const mockTasks: Task[];
export const mockProjects: Project[];
export const mockRisks: Risk[];
export const mockAssets: Asset[]; 