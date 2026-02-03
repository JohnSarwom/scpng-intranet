// Mock data for the Unit dashboard

// Mock tasks
export const mockTasks = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Update all project documentation with latest changes',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2023-12-15',
    projectId: '1',
    projectName: 'Website Redesign',
    completionPercentage: 60
  },
  {
    id: '2',
    title: 'Review code changes',
    description: 'Review and approve code changes for the new feature',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jane Smith',
    dueDate: '2023-12-10',
    projectId: '2',
    projectName: 'Mobile App Development',
    completionPercentage: 0
  },
  {
    id: '3',
    title: 'Client meeting preparation',
    description: 'Prepare presentation for client meeting',
    status: 'done',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2023-12-05',
    projectId: '1',
    projectName: 'Website Redesign',
    completionPercentage: 100
  },
  {
    id: '4',
    title: 'Bug fixes',
    description: 'Fix reported bugs in the application',
    status: 'review',
    priority: 'urgent',
    assignee: 'Jane Smith',
    dueDate: '2023-12-08',
    projectId: '2',
    projectName: 'Mobile App Development',
    completionPercentage: 80
  }
];

// Mock projects
export const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of the company website',
    status: 'in-progress',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-12-31'),
    manager: 'John Doe',
    budget: 50000,
    budgetSpent: 35000,
    progress: 70,
    risks: [],
    tasks: []
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Development of a new mobile application',
    status: 'in-progress',
    startDate: new Date('2023-11-01'),
    endDate: new Date('2024-02-28'),
    manager: 'Jane Smith',
    budget: 75000,
    budgetSpent: 25000,
    progress: 30,
    risks: [],
    tasks: []
  }
];

// Mock risks
export const mockRisks = [
  {
    id: '1',
    title: 'Schedule delay',
    description: 'Risk of project schedule delay due to resource constraints',
    impact: 'high',
    likelihood: 'medium',
    status: 'identified',
    category: 'Schedule',
    projectId: '1',
    projectName: 'Website Redesign',
    owner: 'John Doe',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-15')
  },
  {
    id: '2',
    title: 'Budget overrun',
    description: 'Risk of exceeding project budget',
    impact: 'high',
    likelihood: 'low',
    status: 'monitoring',
    category: 'Financial',
    projectId: '2',
    projectName: 'Mobile App Development',
    owner: 'Jane Smith',
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2023-11-10')
  }
];

// Mock assets
export const mockAssets = [
  {
    id: '1',
    name: 'MacBook Pro',
    type: 'laptop',
    serialNumber: 'MBP2023-12345',
    assignedTo: 'John Doe',
    department: 'Development',
    purchaseDate: new Date('2023-01-15'),
    warrantyExpiry: new Date('2025-01-15'),
    status: 'active',
    notes: '16-inch, M2 Pro'
  },
  {
    id: '2',
    name: 'iPhone 14 Pro',
    type: 'mobile',
    serialNumber: 'IPH2023-67890',
    assignedTo: 'Jane Smith',
    department: 'Design',
    purchaseDate: new Date('2023-03-20'),
    warrantyExpiry: new Date('2025-03-20'),
    status: 'active',
    notes: '256GB, Space Gray'
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    type: 'software',
    serialNumber: 'ACC2023-54321',
    assignedTo: 'Jane Smith',
    department: 'Design',
    purchaseDate: new Date('2023-02-01'),
    warrantyExpiry: new Date('2024-02-01'),
    status: 'active',
    notes: 'Annual subscription'
  }
]; 