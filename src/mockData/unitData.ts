import { Task, Project, Risk, UserAsset } from '../types';

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete monthly reports',
    description: 'Prepare and submit the monthly operational reports',
    assignee: 'John Smith',
    dueDate: '2023-12-15',
    priority: 'high',
    status: 'in-progress',
    category: 'Reporting',
    relatedProject: '1'
  },
  {
    id: '2',
    title: 'Review project proposal',
    description: 'Review and provide feedback on the new project proposal',
    assignee: 'Sarah Johnson',
    dueDate: '2023-12-10',
    priority: 'medium',
    status: 'todo',
    category: 'Planning',
    relatedProject: '2'
  },
  {
    id: '3',
    title: 'Staff training session',
    description: 'Conduct training session for new staff members',
    assignee: 'John Smith',
    dueDate: '2023-12-20',
    priority: 'low',
    status: 'todo',
    category: 'Training',
  },
  {
    id: '4',
    title: 'Update department policies',
    description: 'Review and update department policies according to new regulations',
    assignee: 'Mary Wilson',
    dueDate: '2023-12-05',
    priority: 'urgent',
    status: 'done',
    completionPercentage: 100,
    category: 'Administration',
  },
  {
    id: '5',
    title: 'Equipment maintenance',
    description: 'Schedule and oversee routine maintenance for department equipment',
    assignee: 'Robert Brown',
    dueDate: '2023-12-30',
    priority: 'medium',
    status: 'in-progress',
    category: 'Maintenance',
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Department Restructuring',
    description: 'Reorganizing department structure for improved efficiency',
    manager: 'Mary Wilson',
    startDate: new Date('2023-11-01'),
    endDate: new Date('2024-02-28'),
    status: 'in-progress',
    budget: 75000,
    budgetSpent: 25000,
    progress: 35,
    risks: [],
    tasks: []
  },
  {
    id: '2',
    name: 'IT Systems Upgrade',
    description: 'Upgrading all departmental IT systems and software',
    manager: 'John Smith',
    startDate: new Date('2023-10-15'),
    endDate: new Date('2024-01-15'),
    status: 'in-progress',
    budget: 50000,
    budgetSpent: 32000,
    progress: 65,
    risks: [],
    tasks: []
  },
  {
    id: '3',
    name: 'Employee Wellness Program',
    description: 'Implementing a comprehensive employee wellness program',
    manager: 'Sarah Johnson',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2023-12-31'),
    status: 'on-hold',
    budget: 15000,
    budgetSpent: 6000,
    progress: 40,
    risks: [],
    tasks: []
  },
  {
    id: '4',
    name: 'Annual Budget Planning',
    description: 'Preparing the annual budget for the next fiscal year',
    manager: 'Robert Brown',
    startDate: new Date('2023-11-15'),
    endDate: new Date('2023-12-15'),
    status: 'planned',
    budget: 0,
    budgetSpent: 0,
    progress: 10,
    risks: [],
    tasks: []
  },
  {
    id: '5',
    name: 'Community Outreach Initiative',
    description: 'Developing and implementing community engagement activities',
    manager: 'Mary Wilson',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-11-30'),
    status: 'completed',
    budget: 20000,
    budgetSpent: 19500,
    progress: 100,
    risks: [],
    tasks: []
  }
];

// Mock Risks
export const mockRisks: Risk[] = [
  {
    id: '1',
    title: 'Budget Constraints',
    description: 'Potential funding shortfalls affecting project completion',
    status: 'identified',
    impact: 'high',
    likelihood: 'possible',
    category: 'Financial',
    owner: 'Robert Brown',
    identificationDate: new Date('2023-11-05'),
    mitigationPlan: 'Review budget allocations and identify potential cost-saving measures',
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2023-11-10')
  },
  {
    id: '2',
    title: 'Staff Shortage',
    description: 'Insufficient personnel to complete project tasks on schedule',
    status: 'mitigating',
    impact: 'medium',
    likelihood: 'likely',
    category: 'Resource',
    owner: 'Sarah Johnson',
    identificationDate: new Date('2023-10-20'),
    mitigationPlan: 'Temporary reassignment of staff from other departments',
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-11-05')
  },
  {
    id: '3',
    title: 'Software Compatibility Issues',
    description: 'Potential compatibility problems with new software systems',
    status: 'identified',
    impact: 'medium',
    likelihood: 'possible',
    category: 'Technical',
    owner: 'John Smith',
    identificationDate: new Date('2023-11-10'),
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-10')
  },
  {
    id: '4',
    title: 'Regulatory Changes',
    description: 'Potential changes in regulations affecting operational procedures',
    status: 'monitoring',
    impact: 'high',
    likelihood: 'unlikely',
    category: 'Compliance',
    owner: 'Mary Wilson',
    identificationDate: new Date('2023-09-15'),
    mitigationPlan: 'Regular monitoring of regulatory announcements',
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2023-10-20')
  },
  {
    id: '5',
    title: 'Data Security Breach',
    description: 'Risk of unauthorized access to sensitive information',
    status: 'mitigating',
    impact: 'critical',
    likelihood: 'unlikely',
    category: 'Security',
    owner: 'John Smith',
    identificationDate: new Date('2023-10-01'),
    mitigationPlan: 'Implementation of enhanced security protocols',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15')
  }
];

// Mock Assets
export const mockAssets: UserAsset[] = [
  {
    id: '1',
    name: 'Laptop - Dell XPS 15',
    type: 'laptop',
    description: 'Dell XPS 15 laptop with i7 processor, 16GB RAM',
    serialNumber: 'DXP15-789456',
    purchaseDate: new Date('2022-06-15'),
    warrantyExpiry: new Date('2025-06-15'),
    status: 'active',
    assignedTo: 'John Smith',
    department: 'IT',
    notes: 'Main work laptop for IT department lead'
  },
  {
    id: '2',
    name: 'Microsoft Office 365 License',
    type: 'software',
    description: 'Annual subscription for Office 365 Business Premium',
    serialNumber: 'O365-B-789456',
    purchaseDate: new Date('2023-01-10'),
    warrantyExpiry: new Date('2024-01-10'),
    status: 'active',
    assignedTo: 'Sarah Johnson',
    department: 'HR',
    notes: 'Business Premium license for HR department'
  },
  {
    id: '3',
    name: 'Samsung Galaxy S22',
    type: 'mobile',
    description: 'Company-issued mobile phone',
    serialNumber: 'SG22-897654',
    purchaseDate: new Date('2022-03-15'),
    warrantyExpiry: new Date('2024-03-15'),
    status: 'active',
    assignedTo: 'Mary Wilson',
    department: 'Operations',
    notes: 'Company phone with business plan'
  },
  {
    id: '4',
    name: 'iPad Pro 12.9',
    type: 'tablet',
    description: 'iPad Pro for presentations and field work',
    serialNumber: 'IPP12-456123',
    purchaseDate: new Date('2022-05-10'),
    warrantyExpiry: new Date('2024-05-10'),
    status: 'maintenance',
    assignedTo: 'Robert Brown',
    department: 'Finance',
    notes: 'Currently being repaired - screen damage'
  },
  {
    id: '5',
    name: 'Adobe Creative Cloud License',
    type: 'software',
    description: 'Full Creative Cloud suite license',
    serialNumber: 'ACC-789-456',
    purchaseDate: new Date('2023-02-01'),
    warrantyExpiry: new Date('2024-02-01'),
    status: 'active',
    assignedTo: 'John Smith',
    department: 'IT',
    notes: 'For website and graphic design work'
  }
]; 