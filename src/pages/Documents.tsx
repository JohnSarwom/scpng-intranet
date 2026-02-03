import { useState, useEffect, useMemo } from 'react';
import { useMsal } from "@azure/msal-react";
import { useMicrosoftGraph, Document } from '@/hooks/useMicrosoftGraph.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  FileText, FileSpreadsheet, Presentation, FileImage,
  File, FileArchive, FileCode, Video, Music,
  Folder, ArrowLeft, RefreshCw,
  PlusCircle, User, Users, Building, ChevronDown, ChevronRight, Globe,
  FolderOpen, Calendar, Clock, Download
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import AddDocumentModal from '@/components/custom/AddDocumentModal';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { fetchSharedDocuments, uploadSharedDocument, SharedDocument } from '@/services/sharedDocumentsService';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { getGraphClient } from '@/services/graphService';

// Define a more comprehensive interface for display purposes
interface DisplayableDocument {
  id: string; // Unique ID (from OneDrive or Supabase)
  name: string; // Display name (file name or title)
  url: string;  // URL to open (webUrl for OneDrive, sharepoint_url for Supabase link)
  lastModified: string; // Date string
  size: number; // File size in bytes
  isFolder?: boolean; // True if it's an OneDrive folder
  source: 'OneDrive' | 'SharePointLink'; // To distinguish the origin
  originalFileName?: string; // For SharePointLink, to help with getFileIcon
  description?: string; // For SharePointLink
  tags?: string; // For SharePointLink
}

interface PathItem {
  id: string;
  name: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  fileCount: number;
  totalSize: number;
  lastModified: string;
  icon?: React.ReactNode;
  category: string;
  isFolder: boolean;
  sharedWith?: UserAvatar[];
}

interface UserAvatar {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface MockDocument {
  id: string;
  name: string;
  size: string;
  lastModified: string;
  fileType: string;
  extension: string;
  icon: React.ReactNode;
  sharedWith: UserAvatar[];
  description?: string;
  tags?: string[];
  url?: string;
}

interface DocumentSection {
  id: string;
  name: string;
  description?: string;
  files: MockDocument[];
}

interface CategoryWithFiles {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fileCount: number;
  totalSize: number;
  lastModified: string;
  category: string;
  isFolder: boolean;
  sharedWith: UserAvatar[];
  recentFiles: MockDocument[];
  sections: DocumentSection[];
}

interface NavigationState {
  currentLevel: 'categories' | 'files';
  currentCategoryId: string | null;
  breadcrumbs: BreadcrumbItem[];
}

interface BreadcrumbItem {
  id: string;
  name: string;
  level: 'root' | 'category';
}

// New Primary Tab Structure
const primaryTabsConfig = [
  { id: 'my-documents', label: 'My Documents', icon: <User className="mr-2 h-4 w-4" /> },
  { id: 'company-wide', label: 'Organizational Shared Documents', icon: <Building className="mr-2 h-4 w-4" />, defaultSecondary: 'all-company' },
  { id: 'team-unit', label: 'Team / Unit Documents', icon: <Users className="mr-2 h-4 w-4" />, defaultSecondary: 'team-all' },
  { id: 'external-shared', label: 'External Shared Documents', icon: <Globe className="mr-2 h-4 w-4" />, defaultSecondary: 'all-external' },
];

// --- Data structure for Company-Wide Sub-Categories with Hierarchy ---
interface CompanyWideSubCategoryItem {
  id: string;
  label: string;
  dbSubCategoryValue?: string; // Explicit DB value for fetching, if different from a mapped label
  children?: CompanyWideSubCategoryItem[];
}

const companyWideSubCategories: CompanyWideSubCategoryItem[] = [
  { id: 'all-company', label: 'All Organisational Documents' }, // Remains the default view for all
  {
    id: 'governance-legal-parent',
    label: 'Governance & Legal',
    // This parent is for grouping; does not directly map to a single dbSubCategoryValue unless defined
    children: [
      { id: 'legal-compliance-docs', label: 'Legal & Compliance Documents', dbSubCategoryValue: 'Legal & Compliance Documents' },
      { id: 'regulatory-framework', label: 'Regulatory & Legal Framework' },
      { id: 'internal-compliance', label: 'Internal Compliance Policies & Procedures' },
      { id: 'contracts-agreements', label: 'Contracts & Agreements' },
      { id: 'data-privacy', label: 'Data Privacy & Protection' },
      { id: 'ethics-conduct', label: 'Ethics & Code of Conduct' },
      { id: 'litigation-disputes', label: 'Litigation & Dispute Resolution' },
      { id: 'compliance-audits', label: 'Compliance Audits & Assessments' },
      { id: 'licenses-permits', label: 'Licenses & Permits' },
      { id: 'corp-governance', label: 'Corporate Governance & Board Resolutions' },
      { id: 'legal-opinions', label: 'Legal Opinions & Advice' },
    ]
  },
  {
    id: 'policies-procedures-manuals',
    label: 'Policies, Procedures, Guidelines and Manuals',
    children: [
      { id: 'legal-advisory', label: 'Legal Advisory' },
      { id: 'legal-enforcement', label: 'Legal Enforcement & Compliance' },
      { id: 'licensing', label: 'Licensing' },
      { id: 'supervision', label: 'Supervision' },
      { id: 'investigations', label: 'Investigations' },
      { id: 'research', label: 'Research' },
      { id: 'media-publication', label: 'Media & Publication' },
      { id: 'market-data', label: 'Market Data' },
      { id: 'finance', label: 'Finance' },
      { id: 'hr', label: 'HR' },
      { id: 'investments', label: 'Investments' },
      { id: 'it', label: 'IT' }
    ]
  },
  {
    id: 'comms-branding-parent',
    label: 'Communication & Branding',
    children: [
      { id: 'branding-comms', label: 'Branding & Communications', dbSubCategoryValue: 'Branding & Communications' },
      { id: 'forms', label: 'Forms & Templates', dbSubCategoryValue: 'Forms' },
    ]
  },
  {
    id: 'training-hr-parent',
    label: 'Training & Human Resources',
    children: [
      { id: 'training-dev', label: 'Training & Development Resources', dbSubCategoryValue: 'Training & Development Resources' }
    ]
  },
  {
    id: 'it-systems-parent',
    label: 'IT & Systems',
    children: [
      { id: 'it-system-docs', label: 'IT & System Documentation', dbSubCategoryValue: 'IT & System Documentation' }
    ]
  },
  {
    id: 'strategy-management-parent',
    label: 'Organisational Strategy & Management',
    children: [
      { id: 'corporate-plan', label: 'Corporate & Strategic', dbSubCategoryValue: 'Corporate Plan Documents' },
      { id: 'reports', label: 'Reports', dbSubCategoryValue: 'Reports' },
      { id: 'policies', label: 'Policies & Procedures', dbSubCategoryValue: 'Policies' },
      { id: 'guidelines-procedures', label: 'Guidelines & Procedures', dbSubCategoryValue: 'Guidelines & Procedures' }, // No longer a parent of Training & Dev
    ]
  },
];

// Create a map of Category Label -> SubCategory Labels for the Modal
const companyWideSubCategoryMap: Record<string, string[]> = {};
companyWideSubCategories.forEach(cat => {
  if (cat.id !== 'all-company' && cat.children) {
    companyWideSubCategoryMap[cat.label] = cat.children.map(c => c.label);
  }
});

// Map old scpngSharedSubCategories labels (used in DB) to new IDs if needed for complex cases,
// but dbSubCategoryValue on items is now preferred.
// This map is mainly for ensuring `initialSubCategory` in AddDocumentModal can work if it needs an old label.
const oldLabelToNewIdMap: Record<string, string> = {
  'Policies': 'policies',
  'Forms': 'forms',
  'Corporate Plan Documents': 'corporate-plan',
  'Reports': 'reports',
  'Branding & Communications': 'branding-comms',
  'Guidelines & Procedures': 'guidelines-procedures-parent', // Parent now represents this
  'Training & Development Resources': 'training-dev',
  'IT & System Documentation': 'it-system-docs',
  'Legal & Compliance Documents': 'legal-compliance-parent', // Parent now represents this
  'Historical & Archives': 'historical-archives',
};
// And the reverse (primarily for `AddDocumentModal` if it expects an old sub-category label based on active ID)
const newIdToOldLabelMap: Record<string, string> = Object.fromEntries(
  companyWideSubCategories.flatMap(item => {
    const entries: [string, string][] = [];
    if (item.dbSubCategoryValue) {
      entries.push([item.id, item.dbSubCategoryValue]);
    }
    if (item.children) {
      item.children.forEach(child => {
        if (child.dbSubCategoryValue) {
          entries.push([child.id, child.dbSubCategoryValue]);
        }
      });
    }
    return entries;
  }).filter(([id, label]) => id && label) // Filter out any undefined due to missing dbSubCategoryValue
);


// Define secondary navigation items based on primary tab
// Note: companyWideSubCategories is now the source for 'company-wide'
const secondaryNavConfig: Record<string, { id: string; label: string; sourceCategory?: string; children?: any[] }[]> = {
  'my-documents': [],
  'company-wide': companyWideSubCategories, // Use the new hierarchical structure
  'team-unit': [
    { id: 'team-all', label: 'All Team/Unit Documents' },
    { id: 'division-shared', label: 'Division Shared', sourceCategory: 'Unit Shared' },
  ],
  'external-shared': [
    { id: 'all-external', label: 'All External Documents' },
  ],
};

// For AddDocumentModal, these are the Supabase `shared_category` values
const shareableCategoriesForModal = ['SCPNG Shared Documents', 'Unit Shared'];

// Mock user data for sharing avatars
const mockUsers: UserAvatar[] = [
  { id: '1', name: 'Sarah Mitchell', initials: 'SM', color: 'bg-red-500' },
  { id: '2', name: 'John Davis', initials: 'JD', color: 'bg-blue-500' },
  { id: '3', name: 'Emily Chen', initials: 'EC', color: 'bg-green-500' },
  { id: '4', name: 'Michael Brown', initials: 'MB', color: 'bg-purple-500' },
  { id: '5', name: 'Lisa Anderson', initials: 'LA', color: 'bg-yellow-500' },
  { id: '6', name: 'David Wilson', initials: 'DW', color: 'bg-pink-500' },
  { id: '7', name: 'Rachel Green', initials: 'RG', color: 'bg-indigo-500' },
  { id: '8', name: 'Tom Parker', initials: 'TP', color: 'bg-teal-500' },
];

// Helper function to get random users for sharing
const getRandomSharedUsers = (count: number = 2): UserAvatar[] => {
  const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to create mock documents
const createMockDocument = (name: string, extension: string, sizeInMB: number, daysAgo: number, description?: string, tags?: string[]): MockDocument => {
  const getFileIcon = (ext: string) => {
    switch (ext) {
      case 'docx': case 'doc': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xlsx': case 'xls': return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case 'pptx': case 'ppt': return <Presentation className="h-8 w-8 text-red-500" />;
      case 'pdf': return <File className="h-8 w-8 text-red-600" />;
      case 'png': case 'jpg': case 'jpeg': return <FileImage className="h-8 w-8 text-purple-500" />;
      case 'zip': case 'rar': return <FileArchive className="h-8 w-8 text-yellow-500" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return {
    id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random()}`,
    name: `${name}.${extension}`,
    size: `${sizeInMB} MB`,
    lastModified: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString(),
    fileType: extension.toUpperCase(),
    extension,
    icon: getFileIcon(extension),
    sharedWith: getRandomSharedUsers(Math.floor(Math.random() * 4) + 2),
    description,
    tags
  };
};

// Comprehensive mock data for categories with files
const mockCategoriesWithFiles: Record<string, CategoryWithFiles> = {
  'governance-legal-parent': {
    id: 'governance-legal-parent',
    name: 'Governance & Legal',
    description: '11 subcategories',
    icon: <File className="h-12 w-12 text-red-600" />,
    fileCount: 87,
    totalSize: 342 * 1024 * 1024,
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'company-category',
    isFolder: true,
    sharedWith: getRandomSharedUsers(4),
    recentFiles: [
      createMockDocument('Board Resolution 2024-03', 'pdf', 2.4, 1, 'Latest board meeting resolutions'),
      createMockDocument('Compliance Checklist Q1', 'xlsx', 1.8, 3, 'Quarterly compliance review'),
      createMockDocument('Legal Opinion Securities', 'docx', 3.2, 5, 'Securities law legal opinion'),
      createMockDocument('Regulatory Update March', 'pdf', 1.5, 7, 'Monthly regulatory updates')
    ],
    sections: [
      {
        id: 'board-resolutions',
        name: 'Board Resolutions',
        description: 'Official board meeting minutes and resolutions',
        files: [
          createMockDocument('Board Resolution 2024-03', 'pdf', 2.4, 1, 'March board meeting resolutions', ['board', 'resolution', '2024']),
          createMockDocument('Board Resolution 2024-02', 'pdf', 2.1, 32, 'February board meeting resolutions', ['board', 'resolution', '2024']),
          createMockDocument('Annual Board Meeting 2024', 'docx', 4.2, 45, 'Annual general meeting minutes', ['agm', 'annual', 'minutes']),
          createMockDocument('Emergency Board Resolution', 'pdf', 1.8, 15, 'Emergency meeting resolution', ['emergency', 'urgent']),
          createMockDocument('Quarterly Review Resolution', 'pdf', 2.6, 60, 'Q4 2023 quarterly review', ['quarterly', 'review']),
          createMockDocument('Strategic Planning Resolution', 'pdf', 3.1, 75, 'Strategic planning decisions', ['strategy', 'planning'])
        ]
      },
      {
        id: 'compliance-documents',
        name: 'Compliance Documents',
        description: 'Regulatory compliance and audit materials',
        files: [
          createMockDocument('Compliance Checklist Q1', 'xlsx', 1.8, 3, 'Q1 2024 compliance checklist', ['compliance', 'checklist', 'Q1']),
          createMockDocument('Audit Report 2024', 'pdf', 5.4, 20, 'Annual external audit report', ['audit', 'annual', '2024']),
          createMockDocument('Risk Assessment Matrix', 'xlsx', 2.3, 10, 'Current risk assessment matrix', ['risk', 'assessment']),
          createMockDocument('Compliance Training Manual', 'docx', 6.7, 45, 'Staff compliance training guide', ['training', 'manual']),
          createMockDocument('Internal Controls Review', 'pdf', 3.9, 25, 'Internal controls assessment', ['controls', 'internal']),
          createMockDocument('Regulatory Correspondence', 'pdf', 2.1, 12, 'Communication with regulators', ['regulatory', 'correspondence'])
        ]
      },
      {
        id: 'legal-opinions',
        name: 'Legal Opinions & Advice',
        description: 'External legal counsel opinions and advice',
        files: [
          createMockDocument('Legal Opinion Securities', 'docx', 3.2, 5, 'Securities regulation legal opinion', ['legal', 'securities', 'opinion']),
          createMockDocument('Contract Review Analysis', 'pdf', 2.8, 18, 'Major contract legal review', ['contract', 'review']),
          createMockDocument('Merger Legal Assessment', 'docx', 4.1, 90, 'M&A legal due diligence', ['merger', 'legal', 'due-diligence']),
          createMockDocument('Litigation Risk Analysis', 'pdf', 3.6, 35, 'Potential litigation assessment', ['litigation', 'risk']),
          createMockDocument('Intellectual Property Review', 'docx', 2.9, 55, 'IP portfolio legal review', ['ip', 'intellectual-property'])
        ]
      },
      {
        id: 'corporate-governance',
        name: 'Corporate Governance',
        description: 'Corporate governance policies and procedures',
        files: [
          createMockDocument('Corporate Governance Policy', 'pdf', 4.5, 8, 'Updated corporate governance framework', ['governance', 'policy']),
          createMockDocument('Code of Conduct', 'pdf', 3.2, 120, 'Employee code of conduct', ['code', 'conduct', 'ethics']),
          createMockDocument('Director Independence Policy', 'docx', 2.1, 180, 'Board director independence guidelines', ['director', 'independence']),
          createMockDocument('Whistleblower Policy', 'pdf', 1.9, 90, 'Whistleblower protection procedures', ['whistleblower', 'protection'])
        ]
      }
    ]
  },

  'strategy-management-parent': {
    id: 'strategy-management-parent',
    name: 'Company Strategy & Management',
    description: '4 subcategories',
    icon: <Building className="h-12 w-12 text-blue-600" />,
    fileCount: 65,
    totalSize: 289 * 1024 * 1024,
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'company-category',
    isFolder: true,
    sharedWith: getRandomSharedUsers(5),
    recentFiles: [
      createMockDocument('Strategic Plan 2024-2026', 'pptx', 8.5, 2, 'Three-year strategic roadmap'),
      createMockDocument('Q1 Performance Dashboard', 'xlsx', 3.4, 4, 'Quarterly performance metrics'),
      createMockDocument('Market Analysis Report', 'pdf', 5.2, 6, 'Current market conditions analysis'),
      createMockDocument('Budget Allocation 2024', 'xlsx', 4.1, 8, 'Annual budget distribution')
    ],
    sections: [
      {
        id: 'strategic-plans',
        name: 'Strategic Plans',
        description: 'Long-term strategic planning documents',
        files: [
          createMockDocument('Strategic Plan 2024-2026', 'pptx', 8.5, 2, 'Three-year strategic roadmap', ['strategy', 'planning', '2024-2026']),
          createMockDocument('Digital Transformation Strategy', 'pdf', 6.2, 25, 'Digital transformation roadmap', ['digital', 'transformation']),
          createMockDocument('Market Expansion Plan', 'docx', 4.8, 40, 'New market entry strategy', ['market', 'expansion']),
          createMockDocument('Innovation Strategy 2024', 'pptx', 5.9, 60, 'Innovation and R&D strategy', ['innovation', 'r&d']),
          createMockDocument('Competitive Strategy Analysis', 'pdf', 3.7, 35, 'Competitive landscape analysis', ['competitive', 'analysis'])
        ]
      },
      {
        id: 'performance-reports',
        name: 'Performance Reports',
        description: 'KPI tracking and performance analysis',
        files: [
          createMockDocument('Q1 Performance Dashboard', 'xlsx', 3.4, 4, 'Q1 2024 KPI dashboard', ['performance', 'KPI', 'Q1']),
          createMockDocument('Annual Performance Review 2023', 'pdf', 7.1, 120, '2023 full year performance', ['annual', 'performance', '2023']),
          createMockDocument('Monthly Metrics February', 'xlsx', 2.1, 45, 'February 2024 monthly metrics', ['monthly', 'metrics']),
          createMockDocument('Departmental Performance Analysis', 'pptx', 4.6, 30, 'Department-wise performance review', ['departmental', 'analysis']),
          createMockDocument('Benchmark Comparison Report', 'pdf', 3.8, 20, 'Industry benchmark analysis', ['benchmark', 'industry'])
        ]
      },
      {
        id: 'budget-planning',
        name: 'Budget & Financial Planning',
        description: 'Budget allocations and financial planning',
        files: [
          createMockDocument('Budget Allocation 2024', 'xlsx', 4.1, 8, 'Annual budget distribution', ['budget', '2024', 'allocation']),
          createMockDocument('Capital Expenditure Plan', 'xlsx', 3.5, 15, 'CapEx planning for 2024', ['capex', 'planning']),
          createMockDocument('Financial Forecast 2024-2025', 'pdf', 5.3, 22, 'Two-year financial projections', ['forecast', 'financial']),
          createMockDocument('Cost Optimization Analysis', 'xlsx', 2.8, 35, 'Cost reduction opportunities', ['cost', 'optimization'])
        ]
      },
      {
        id: 'management-reports',
        name: 'Management Reports',
        description: 'Executive and management reporting',
        files: [
          createMockDocument('Executive Summary March', 'pdf', 2.9, 5, 'March 2024 executive briefing', ['executive', 'summary']),
          createMockDocument('Management Committee Minutes', 'docx', 1.8, 12, 'Latest management meeting minutes', ['management', 'minutes']),
          createMockDocument('Risk Management Report', 'pdf', 4.2, 18, 'Enterprise risk management update', ['risk', 'management']),
          createMockDocument('Operational Review Q1', 'pptx', 6.1, 25, 'Q1 operational performance review', ['operational', 'review'])
        ]
      }
    ]
  },

  'comms-branding-parent': {
    id: 'comms-branding-parent',
    name: 'Communication & Branding',
    description: '2 subcategories',
    icon: <FileImage className="h-12 w-12 text-purple-600" />,
    fileCount: 43,
    totalSize: 156 * 1024 * 1024,
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'company-category',
    isFolder: true,
    sharedWith: getRandomSharedUsers(3),
    recentFiles: [
      createMockDocument('Brand Guidelines 2024', 'pdf', 12.3, 1, 'Updated brand identity guidelines'),
      createMockDocument('Press Release Template', 'docx', 1.2, 5, 'Standard press release format'),
      createMockDocument('Marketing Campaign Assets', 'zip', 45.6, 7, 'Q1 marketing campaign materials'),
      createMockDocument('Social Media Style Guide', 'pdf', 3.8, 10, 'Social media branding guidelines')
    ],
    sections: [
      {
        id: 'brand-assets',
        name: 'Brand Assets',
        description: 'Logos, guidelines, and brand materials',
        files: [
          createMockDocument('Brand Guidelines 2024', 'pdf', 12.3, 1, 'Complete brand identity guide', ['brand', 'guidelines']),
          createMockDocument('Logo Package', 'zip', 25.4, 15, 'All logo variations and formats', ['logo', 'assets']),
          createMockDocument('Color Palette Guide', 'pdf', 2.1, 30, 'Official brand color specifications', ['color', 'palette']),
          createMockDocument('Typography Standards', 'pdf', 1.8, 45, 'Brand typography guidelines', ['typography', 'fonts']),
          createMockDocument('Photography Style Guide', 'pdf', 8.9, 60, 'Brand photography standards', ['photography', 'style'])
        ]
      },
      {
        id: 'communications',
        name: 'Communications Materials',
        description: 'Templates, campaigns, and communication assets',
        files: [
          createMockDocument('Press Release Template', 'docx', 1.2, 5, 'Standard PR template', ['press', 'template']),
          createMockDocument('Newsletter Template', 'docx', 2.3, 20, 'Internal newsletter format', ['newsletter', 'template']),
          createMockDocument('Presentation Template', 'pptx', 4.5, 25, 'Standard presentation deck', ['presentation', 'template']),
          createMockDocument('Email Signature Guidelines', 'pdf', 1.1, 40, 'Email signature standards', ['email', 'signature']),
          createMockDocument('Crisis Communication Plan', 'docx', 3.7, 90, 'Crisis communication procedures', ['crisis', 'communication'])
        ]
      }
    ]
  }
};

// Helper function to get appropriate icon for file types
const getFileTypeIcon = (typeName: string) => {
  switch (typeName) {
    case 'Documents':
      return <FileText className="h-12 w-12 text-blue-500" />;
    case 'Spreadsheets':
      return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
    case 'Presentations':
      return <Presentation className="h-12 w-12 text-red-500" />;
    case 'Images':
      return <FileImage className="h-12 w-12 text-purple-500" />;
    default:
      return <File className="h-12 w-12 text-gray-500" />;
  }
};

// Helper function to get category icons
const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'governance-legal-parent': <File className="h-12 w-12 text-red-600" />,
    'strategy-management-parent': <Building className="h-12 w-12 text-blue-600" />,
    'comms-branding-parent': <FileImage className="h-12 w-12 text-purple-600" />,
    'training-hr-parent': <Users className="h-12 w-12 text-green-600" />,
    'it-systems-parent': <FileCode className="h-12 w-12 text-indigo-600" />,
    'records-archives-parent': <FileArchive className="h-12 w-12 text-yellow-600" />
  };

  return iconMap[categoryId] || <Folder className="h-12 w-12 text-gray-500" />;
};

// Helper function to get file icon based on document
const getFileIconForDocument = (doc: DisplayableDocument) => {
  const fileName = doc.source === 'SharePointLink' ? doc.originalFileName : doc.name;
  if (!fileName) return <FileText className="h-12 w-12 text-gray-400" />;

  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'doc': case 'docx': return <FileText className="h-12 w-12 text-blue-500" />;
    case 'xls': case 'xlsx': return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
    case 'ppt': case 'pptx': return <Presentation className="h-12 w-12 text-red-500" />;
    case 'jpg': case 'jpeg': case 'png': case 'gif': return <FileImage className="h-12 w-12 text-purple-500" />;
    case 'pdf': return <File className="h-12 w-12 text-red-600" />;
    case 'zip': case 'rar': return <FileArchive className="h-12 w-12 text-yellow-500" />;
    case 'txt': case 'md': return <FileText className="h-12 w-12 text-gray-500" />;
    case 'js': case 'ts': case 'html': case 'css': return <FileCode className="h-12 w-12 text-indigo-500" />;
    case 'mp4': case 'mov': case 'avi': return <Video className="h-12 w-12 text-pink-500" />;
    case 'mp3': case 'wav': case 'aac': return <Music className="h-12 w-12 text-teal-500" />;
    default: return <FileText className="h-12 w-12 text-gray-400" />;
  }
};

// Mock data generator for visual folder representation
const getDocumentFolders = (activePrimaryTab: string, activeSecondaryNav: string, documents: DisplayableDocument[]): DocumentFolder[] => {
  if (activePrimaryTab === 'my-documents') {
    // For My Documents, show OneDrive folders as visual cards
    const folders = documents.filter(doc => doc.isFolder);
    const files = documents.filter(doc => !doc.isFolder);

    const folderCards: DocumentFolder[] = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: 'OneDrive folder',
      fileCount: 0, // We don't know the count without fetching contents
      totalSize: 0,
      lastModified: folder.lastModified,
      icon: <FolderOpen className="h-12 w-12 text-blue-500" />,
      category: 'folder',
      isFolder: true
    }));

    // Group files by type for better visualization
    if (files.length > 0) {
      const fileTypes = {
        'Documents': files.filter(f => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ['doc', 'docx', 'pdf', 'txt', 'md'].includes(ext || '');
        }),
        'Spreadsheets': files.filter(f => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ['xls', 'xlsx', 'csv'].includes(ext || '');
        }),
        'Presentations': files.filter(f => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ['ppt', 'pptx'].includes(ext || '');
        }),
        'Images': files.filter(f => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '');
        }),
        'Other Files': files.filter(f => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return !['doc', 'docx', 'pdf', 'txt', 'md', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '');
        })
      };

      Object.entries(fileTypes).forEach(([typeName, typeFiles]) => {
        if (typeFiles.length > 0) {
          const totalSize = typeFiles.reduce((sum, f) => sum + (f.size || 0), 0);
          const latestModified = typeFiles.reduce((latest, f) => {
            return new Date(f.lastModified) > new Date(latest) ? f.lastModified : latest;
          }, typeFiles[0].lastModified);

          folderCards.push({
            id: typeName.toLowerCase().replace(/\s+/g, '-'),
            name: typeName,
            description: `${typeFiles.length} ${typeFiles.length === 1 ? 'file' : 'files'}`,
            fileCount: typeFiles.length,
            totalSize,
            lastModified: latestModified,
            icon: getFileTypeIcon(typeName),
            category: 'file-group',
            isFolder: false
          });
        }
      });
    }

    return folderCards;
  }

  if (activePrimaryTab === 'company-wide') {
    // Always show all company-wide categories as cards (no more sidebar navigation)
    return companyWideSubCategories.filter(cat => cat.id !== 'all-company').map(category => {
      // Calculate real stats from documents if available
      const categoryDocs = documents.filter(doc => doc.category === category.label);
      const fileCount = categoryDocs.length;
      const totalSize = categoryDocs.reduce((acc, doc) => acc + (doc.size || 0), 0);

      return {
        id: category.id,
        name: category.label,
        description: category.children ? `${category.children.length} subcategories` : 'Document category',
        fileCount: fileCount,
        totalSize: totalSize,
        lastModified: new Date().toISOString(), // Could find latest doc date
        icon: getCategoryIcon(category.id),
        category: 'company-category',
        isFolder: true,
        sharedWith: []
      };
    });
  }

  if (activePrimaryTab === 'team-unit') {
    // For team/unit documents, show with prominent sharing indicators
    return [
      {
        id: 'unit-shared-docs',
        name: 'Division Shared Documents',
        description: 'Shared with division members',
        fileCount: Math.floor(Math.random() * 30) + 15,
        totalSize: Math.floor(Math.random() * 200) * 1024 * 1024,
        lastModified: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        icon: <Users className="h-12 w-12 text-blue-600" />,
        category: 'unit-category',
        isFolder: true,
        sharedWith: getRandomSharedUsers(5) // Show more users for unit documents
      },
      {
        id: 'team-projects',
        name: 'Team Projects',
        description: 'Collaborative project files',
        fileCount: Math.floor(Math.random() * 20) + 8,
        totalSize: Math.floor(Math.random() * 150) * 1024 * 1024,
        lastModified: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        icon: <FolderOpen className="h-12 w-12 text-green-600" />,
        category: 'team-category',
        isFolder: true,
        sharedWith: getRandomSharedUsers(4)
      },
      {
        id: 'department-resources',
        name: 'Department Resources',
        description: 'Resources shared across department',
        fileCount: Math.floor(Math.random() * 25) + 12,
        totalSize: Math.floor(Math.random() * 100) * 1024 * 1024,
        lastModified: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
        icon: <Building className="h-12 w-12 text-purple-600" />,
        category: 'department-category',
        isFolder: true,
        sharedWith: getRandomSharedUsers(6) // Show more sharing for department level
      },
      {
        id: 'policies-procedures-manuals',
        name: 'Policies, Procedures, Guidelines and Manuals',
        description: '12 subcategories',
        fileCount: 0,
        totalSize: 0,
        lastModified: new Date('2026-01-12').toISOString(),
        icon: <FileText className="h-12 w-12 text-yellow-600" />,
        category: 'company-category',
        isFolder: true,
        sharedWith: []
      }
    ];
  }

  // Default fallback for other tabs
  return documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    description: doc.description || 'Document',
    fileCount: doc.isFolder ? 0 : 1,
    totalSize: doc.size || 0,
    lastModified: doc.lastModified,
    icon: doc.isFolder ? <FolderOpen className="h-12 w-12 text-blue-500" /> : getFileIconForDocument(doc),
    category: doc.isFolder ? 'folder' : 'document',
    isFolder: doc.isFolder || false
  }));
};


export default function Documents() {
  const {
    getOneDriveDocuments,
    getFolderContents,
    isLoading: isOneDriveLoading,
    handleLogin,
    uploadBinaryFileToSharePoint
  } = useMicrosoftGraph();
  const { instance } = useMsal();
  const { user } = useSupabaseAuth();
  const { isAdmin, isSuperAdmin } = useRoleBasedAuth();
  const canAddDocument = isAdmin || isSuperAdmin;

  const [documents, setDocuments] = useState<DisplayableDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DisplayableDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState(false);
  const [currentPath, setCurrentPath] = useState<PathItem[]>([]);

  const [activePrimaryTab, setActivePrimaryTab] = useState<string>(primaryTabsConfig[1].id);
  const [activeSecondaryNav, setActiveSecondaryNav] = useState<string>(primaryTabsConfig[1].defaultSecondary);
  const [expandedCompanyWideItems, setExpandedCompanyWideItems] = useState<Record<string, boolean>>({});

  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Navigation state for drill-down functionality
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentLevel: 'categories',
    currentCategoryId: null,
    breadcrumbs: []
  });

  // console.log("Documents component. Primary:", activePrimaryTab, "Secondary:", activeSecondaryNav, "isLoading:", isLoading, "Expanded:", expandedCompanyWideItems);

  const currentSharePointCategoriesForModal = useMemo(() => {
    if (activePrimaryTab === 'company-wide') return ['SCPNG Shared Documents'];
    if (activePrimaryTab === 'team-unit') {
      // Since 'General Shared' is removed as a distinct UI choice,
      // 'Unit Shared' (representing Division Shared) is the main category here.
      return ['Unit Shared'];
    }
    return [];
  }, [activePrimaryTab, activeSecondaryNav]);

  const currentSubCategoriesForModal = useMemo(() => {
    // Provides a flat list of all possible DB sub-category *labels* for the modal
    // when 'SCPNG Shared Documents' is the target.
    if (activePrimaryTab === 'company-wide') {
      return companyWideSubCategories
        .flatMap(item => item.dbSubCategoryValue ? [item.dbSubCategoryValue] : (item.children?.map(c => c.dbSubCategoryValue).filter(Boolean) || []))
        .filter(Boolean) as string[]; // Ensure only defined strings
    }
    return undefined; // Or an empty array if preferred for other primary tabs
  }, [activePrimaryTab]);

  const modalAvailableCategories = useMemo(() =>
    companyWideSubCategories.filter(c => c.id !== 'all-company').map(c => c.label),
    []
  );


  const fetchPersonalDocumentsRoot = async () => {
    setAuthError(false);
    setCurrentPath([]);
    setDocuments([]);
    setIsLoading(true);
    try {
      const odDocs = await getOneDriveDocuments();
      const mappedDocs: DisplayableDocument[] = (odDocs || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item.url || item.webUrl, // Use .url as useMicrosoftGraph returns .url, fallback to webUrl just in case
        lastModified: item.lastModifiedDateTime || item.lastModified,
        size: item.size,
        isFolder: !!item.folder,
        source: 'OneDrive',
        originalFileName: item.name,
      }));
      mappedDocs.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      setDocuments(mappedDocs);
    } catch (error: any) {
      console.error('fetchPersonalDocumentsRoot Error:', error);
      if (error.message?.includes('No account') || error.message?.includes('Authentication') || error.code === 'UserLoginRequired') {
        setAuthError(true);
        toast.error('Authentication Error for My Documents. Please re-authenticate.');
      } else {
        toast.error(`Failed to fetch My Documents: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const findCategoryById = (id: string, categories: CompanyWideSubCategoryItem[]): CompanyWideSubCategoryItem | null => {
    for (const category of categories) {
      if (category.id === id) return category;
      if (category.children) {
        const foundInChildren = findCategoryById(id, category.children);
        if (foundInChildren) return foundInChildren;
      }
    }
    return null;
  };

  const loadData = async () => {
    console.log(`Loading data for Primary: ${activePrimaryTab}, Secondary: ${activeSecondaryNav}`);
    setSearchQuery('');
    setDocuments([]);
    setCurrentPath([]);
    setAuthError(false);
    setIsLoading(true);

    if (activePrimaryTab === 'my-documents') {
      await fetchPersonalDocumentsRoot();
    } else if (activePrimaryTab === 'company-wide') {
      setIsLoading(true);
      try {
        const client = await getGraphClient(instance);
        if (!client) { setIsLoading(false); return; }

        const sharedDocs = await fetchSharedDocuments(client);

        // Filter based on activeSecondaryNav
        // If secondary nav points to a category or subcategory, filter appropriately
        // However, company-wide tab logic usually wants ALL docs loaded so we can filter locally for speed, 
        // OR if the list is huge, we filter server side. For now, fetch all, filter local.

        let filtered = sharedDocs;

        // Logic to filter if we wanted to restrict what's in 'documents' state based on sidebar.
        // But documents state usually drives the view.
        // If activeSecondaryNav is 'all-company', we show all. 
        // If it's something else, we might filter. 

        const docs: DisplayableDocument[] = sharedDocs.map(d => ({
          id: d.id,
          name: d.name,
          url: d.webUrl,
          lastModified: d.createdDateTime,
          size: d.size,
          isFolder: false,
          source: 'SharePointLink',
          originalFileName: d.name,
          description: d.description,
          tags: d.tags,
          // Store additional metadata for grouping
          category: d.category,
          // @ts-ignore
          subCategory: d.subCategory
        }));

        setDocuments(docs);
      } catch (e: any) {
        console.error("Failed to fetch shared documents", e);
        toast.error("Failed to load organizational documents.");
        setDocuments([]);
      }
    } else if (activePrimaryTab === 'team-unit') {
      try {
        let query = supabase
          .from('company_documents')
          .select('id, title, description, tags, sharepoint_url, file_name, file_type, file_size, created_at, sub_category, shared_category')
          .eq('is_archived', false);

        // Updated logic for 'team-unit' data fetching
        if (activeSecondaryNav === 'team-all' || activeSecondaryNav === 'division-shared') {
          query = query.eq('shared_category', 'Unit Shared');
        } else {
          // Fallback or if more specific team/unit types were added and not handled yet
          console.warn(`Unknown or unhandled secondary nav for team-unit: ${activeSecondaryNav}. Loading no documents.`);
          setDocuments([]);
          setIsLoading(false); return;
        }

        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        const fetchedDocs: DisplayableDocument[] = data.map((doc: any) => ({
          id: doc.id, name: doc.title, url: doc.sharepoint_url, lastModified: doc.created_at,
          size: doc.file_size, isFolder: false, source: 'SharePointLink',
          originalFileName: doc.file_name, description: doc.description, tags: doc.tags,
        }));
        setDocuments(fetchedDocs);
      } catch (error: any) {
        console.error(`Error fetching Team/Unit docs for ${activeSecondaryNav}:`, error);
        toast.error(`Failed to load documents: ${error.message}`);
        setDocuments([]);
      }
    } else if (activePrimaryTab === 'external-shared') {
      // No specific logic for 'external-shared' yet, will show no documents
      console.warn(`Data fetching not implemented for primary tab: ${activePrimaryTab}.`);
      setDocuments([]);
    } else {
      console.warn(`Data fetching not implemented for primary tab: ${activePrimaryTab}.`);
      setDocuments([]);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [activePrimaryTab, activeSecondaryNav]);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = documents.filter(doc =>
      doc.name.toLowerCase().includes(lowerCaseQuery) ||
      (doc.description && doc.description.toLowerCase().includes(lowerCaseQuery)) ||
      (doc.tags && doc.tags.toLowerCase().includes(lowerCaseQuery)) ||
      (doc.originalFileName && doc.originalFileName.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  const handleReauthenticate = async () => {
    if (activePrimaryTab === 'my-documents' && authError) {
      setAuthError(false);
      await handleLogin();
    } else {
      loadData();
    }
  };

  const navigateToFolder = async (folder: DisplayableDocument) => {
    if (!folder.isFolder || activePrimaryTab !== 'my-documents' || !folder.id) return;
    setIsLoading(true);
    try {
      const folderContentsResult = await getFolderContents(folder.id);
      const mappedContents: DisplayableDocument[] = (folderContentsResult || []).map((item: any) => ({
        id: item.id, name: item.name, url: item.webUrl, lastModified: item.lastModifiedDateTime,
        size: item.size, isFolder: !!item.folder, source: 'OneDrive', originalFileName: item.name,
      }));
      mappedContents.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1; if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      setDocuments(mappedContents);
      setCurrentPath(prevPath => [...prevPath, { id: folder.id!, name: folder.name }]);
      setSearchQuery('');
    } catch (error: any) {
      toast.error(`Failed to load folder contents: ${error.message}`);
      if (error.message?.includes('Authentication') || error.code === 'UserLoginRequired') setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateUp = async () => {
    if (currentPath.length === 0 || activePrimaryTab !== 'my-documents') return;
    setIsLoading(true);
    const newPath = [...currentPath]; newPath.pop();
    try {
      if (newPath.length === 0) {
        await fetchPersonalDocumentsRoot();
      } else {
        const parentFolder = newPath[newPath.length - 1];
        const folderContentsResult = await getFolderContents(parentFolder.id);
        const mappedContents: DisplayableDocument[] = (folderContentsResult || []).map((item: any) => ({
          id: item.id, name: item.name, url: item.webUrl, lastModified: item.lastModifiedDateTime,
          size: item.size, isFolder: !!item.folder, source: 'OneDrive', originalFileName: item.name,
        }));
        mappedContents.sort((a, b) => {
          if (a.isFolder && !b.isFolder) return -1; if (!a.isFolder && b.isFolder) return 1;
          return a.name.localeCompare(b.name);
        });
        setDocuments(mappedContents);
        setCurrentPath(newPath);
        setSearchQuery('');
      }
    } catch (error: any) {
      toast.error(`Failed to load parent folder: ${error.message}`);
      if (error.message?.includes('Authentication') || error.code === 'UserLoginRequired') setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (doc: DisplayableDocument) => {
    const fileName = doc.source === 'SharePointLink' ? doc.originalFileName : doc.name;
    if (!fileName) return <FileText className="h-10 w-10 text-gray-400" />;
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'doc': case 'docx': return <FileText className="h-10 w-10 text-blue-500" />;
      case 'xls': case 'xlsx': return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'ppt': case 'pptx': return <Presentation className="h-10 w-10 text-red-500" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <FileImage className="h-10 w-10 text-purple-500" />;
      case 'pdf': return <File className="h-10 w-10 text-red-600" />;
      case 'zip': case 'rar': return <FileArchive className="h-10 w-10 text-yellow-500" />;
      case 'txt': case 'md': return <FileText className="h-10 w-10 text-gray-500" />;
      case 'js': case 'ts': case 'html': case 'css': return <FileCode className="h-10 w-10 text-indigo-500" />;
      case 'mp4': case 'mov': case 'avi': return <Video className="h-10 w-10 text-pink-500" />;
      case 'mp3': case 'wav': case 'aac': return <Music className="h-10 w-10 text-teal-500" />;
      default: return <FileText className="h-10 w-10 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (bytes === undefined || bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handlePrimaryTabChange = (tabId: string) => {
    if (isUploading || isLoading) return;
    setActivePrimaryTab(tabId);
    const tabConfig = primaryTabsConfig.find(t => t.id === tabId);
    setActiveSecondaryNav(tabConfig?.defaultSecondary || secondaryNavConfig[tabId]?.[0]?.id || '');
    setExpandedCompanyWideItems({}); // Collapse all on primary tab change

    // Reset navigation state when changing primary tabs
    setNavigationState({
      currentLevel: 'categories',
      currentCategoryId: null,
      breadcrumbs: []
    });
  };

  const handleSecondaryNavChange = (navId: string, isParentToggle: boolean = false) => {
    if (isUploading || isLoading) return;

    const item = findCategoryById(navId, companyWideSubCategories);

    if (item && item.children && item.children.length > 0) { // It's a parent item
      setExpandedCompanyWideItems(prev => ({ ...prev, [navId]: !prev[navId] }));
      // If only toggling, don't change activeSecondaryNav unless it's explicitly set or no child is active
      // For now, clicking a parent always makes it active.
    }
    // Always set the clicked item (parent or child) as active
    setActiveSecondaryNav(navId);
  };


  const handleShareDocument = async (documentData: { title: string; description: string; tags?: string; file?: File | null; category: string; subCategory?: string | null; }) => {
    const activeAccount = instance.getActiveAccount();
    if (!documentData.file || !activeAccount) {
      toast.error(activeAccount ? 'No file selected.' : 'User not authenticated with Microsoft 365.'); return;
    }

    setIsUploading(true);
    toast.loading('Uploading document...');

    try {
      const client = await getGraphClient(instance);
      if (!client) throw new Error("Could not initialize Graph Client");

      await uploadSharedDocument(client, documentData.file, {
        category: documentData.category,
        subCategory: documentData.subCategory || undefined,
        description: documentData.description,
        tags: documentData.tags
      });

      toast.dismiss();
      toast.success('Document shared successfully!');
      setIsAddDocumentModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast.dismiss();
      toast.error(`Failed to share document: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const currentPrimaryTabConfig = primaryTabsConfig.find(t => t.id === activePrimaryTab);
  const searchPlaceholder = currentPrimaryTabConfig ? `Search in ${currentPrimaryTabConfig.label}...` : 'Search documents...';

  const renderCompanyWideNav = (items: CompanyWideSubCategoryItem[], level = 0) => {
    return items.map(navItem => (
      <div key={navItem.id}>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleSecondaryNavChange(navItem.id)}
                disabled={isLoading || isUploading}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                            ${activeSecondaryNav === navItem.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                            ${level > 0 ? 'pl-9' : ''} group`}
              >
                {navItem.children && navItem.children.length > 0 && (
                  expandedCompanyWideItems[navItem.id] ?
                    <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0 transform group-hover:text-foreground" /> :
                    <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0 transform group-hover:text-foreground" />
                )}
                <span className="truncate flex-1 text-left">{navItem.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="start">
              <p>{navItem.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {navItem.children && expandedCompanyWideItems[navItem.id] && (
          <div className="mt-1 space-y-1">
            {renderCompanyWideNav(navItem.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Breadcrumb component
  const BreadcrumbNavigation = ({ breadcrumbs, onBreadcrumbClick }: {
    breadcrumbs: BreadcrumbItem[];
    onBreadcrumbClick: (breadcrumb: BreadcrumbItem) => void
  }) => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.id} className="flex items-center gap-2">
          <button
            onClick={() => onBreadcrumbClick(breadcrumb)}
            className="text-primary hover:text-primary/80 hover:underline font-medium"
          >
            {breadcrumb.name}
          </button>
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );

  // File card component for individual documents
  const FileCard = ({ file, onClick }: { file: MockDocument; onClick: (file: MockDocument) => void }) => (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white border border-gray-200"
      onClick={() => onClick(file)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-shrink-0 mr-3">
            {file.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1" title={file.name}>
              {file.name}
            </h4>
            {file.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{file.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-center justify-between">
            <span>{file.size}</span>
            <span>{file.lastModified}</span>
          </div>
        </div>

        {/* File tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {file.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
            {file.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{file.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Shared with avatars */}
        {file.sharedWith && file.sharedWith.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Shared with:</span>
            <div className="flex -space-x-1">
              {file.sharedWith.slice(0, 3).map((user, index) => (
                <div
                  key={user.id}
                  className={`w-5 h-5 rounded-full ${user.color} text-white text-xs font-medium flex items-center justify-center border border-white relative`}
                  title={user.name}
                  style={{ zIndex: 10 - index }}
                >
                  {user.initials}
                </div>
              ))}
              {file.sharedWith.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-gray-400 text-white text-xs font-medium flex items-center justify-center border border-white">
                  +{file.sharedWith.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // New component for visual document/folder cards
  const DocumentFolderCard = ({ folder, onClick }: { folder: DocumentFolder; onClick: (folder: DocumentFolder) => void }) => (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60"
      onClick={() => onClick(folder)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-shrink-0 mr-4">
            {folder.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate mb-1" title={folder.name}>
              {folder.name}
            </h3>
            {folder.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{folder.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          {folder.fileCount > 0 && (
            <div className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span>{folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}</span>
            </div>
          )}

          {folder.totalSize > 0 && (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>{formatFileSize(folder.totalSize)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDate(folder.lastModified)}</span>
          </div>
        </div>

        {/* Shared with avatars */}
        {folder.sharedWith && folder.sharedWith.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Shared with:</span>
              <div className="flex -space-x-2">
                {folder.sharedWith.slice(0, 3).map((user, index) => (
                  <div
                    key={user.id}
                    className={`w-6 h-6 rounded-full ${user.color} text-white text-xs font-medium flex items-center justify-center border-2 border-white relative z-${10 - index}`}
                    title={user.name}
                  >
                    {user.initials}
                  </div>
                ))}
                {folder.sharedWith.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-medium flex items-center justify-center border-2 border-white">
                    +{folder.sharedWith.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {folder.category === 'company-category' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Building className="h-3 w-3" />
              <span>Organisational Wide</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const handleFolderClick = (folder: DocumentFolder) => {
    if (activePrimaryTab === 'my-documents' && folder.isFolder) {
      // Handle OneDrive folder navigation (existing functionality)
      const doc = documents.find(d => d.id === folder.id);
      if (doc) {
        navigateToFolder(doc);
      }
    } else if (folder.category === 'company-category') {
      // Drill down into category files
      // Set state to files view
      setNavigationState({
        currentLevel: 'files',
        currentCategoryId: folder.id,
        breadcrumbs: [
          { id: 'root', name: 'Document Categories', level: 'root' },
          { id: folder.id, name: folder.name, level: 'category' }
        ]
      });
    } else if (folder.category === 'document') {
      // Open the document
      const doc = documents.find(d => d.id === folder.id);
      if (doc) {
        window.open(doc.url, '_blank');
      }
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (breadcrumb: BreadcrumbItem) => {
    if (breadcrumb.level === 'root') {
      // Navigate back to categories
      setNavigationState({
        currentLevel: 'categories',
        currentCategoryId: null,
        breadcrumbs: []
      });
    }
  };

  // Handle file click (open document)
  // Handle file click (open document)
  const handleFileClick = (file: MockDocument | any) => {
    const fileUrl = file.url || file.webUrl;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast.error('Cannot open file: URL not found.');
      console.error('File missing URL:', file);
    }
  };

  // Generate folder representation of current data
  const documentFolders = useMemo(() => {
    // If we're in file view, don't use the folder generator
    if (navigationState.currentLevel === 'files' && navigationState.currentCategoryId) {
      return []; // Files will be handled separately
    }
    return getDocumentFolders(activePrimaryTab, activeSecondaryNav, filteredDocuments);
  }, [activePrimaryTab, activeSecondaryNav, filteredDocuments, navigationState]);

  // Get current category data for file view
  // Dynamic generation of view data based on real documents and selected category
  const currentCategoryData = useMemo(() => {
    if (navigationState.currentLevel === 'files' && navigationState.currentCategoryId) {
      const categoryId = navigationState.currentCategoryId;
      const categoryDef = companyWideSubCategories.find(c => c.id === categoryId);
      if (!categoryDef) return null;

      // Filter documents belonging to this category
      // categoryDef.label should match the 'Category' column in SharePoint
      const categoryDocuments = documents.filter(doc => (doc as any).category === categoryDef.label);

      // Group by subCategory to form sections
      const sectionsMap = new Map<string, DisplayableDocument[]>();
      const unassigned: DisplayableDocument[] = [];

      categoryDocuments.forEach(doc => {
        const subCat = (doc as any).subCategory;
        if (subCat) {
          if (!sectionsMap.has(subCat)) sectionsMap.set(subCat, []);
          sectionsMap.get(subCat)?.push(doc);
        } else {
          unassigned.push(doc);
        }
      });

      const sections: DocumentSection[] = [];
      sectionsMap.forEach((docs, subCatName) => {
        sections.push({
          id: subCatName,
          name: subCatName,
          description: '',
          files: docs.map(d => ({
            id: d.id, name: d.name, size: formatFileSize(d.size), lastModified: formatDate(d.lastModified),
            fileType: d.name.split('.').pop()?.toUpperCase() || '', extension: d.name.split('.').pop() || '',
            icon: getFileIconForDocument(d), sharedWith: [], description: d.description, tags: d.tags ? d.tags.split(',') : [], url: d.url
          }))
        });
      });

      if (unassigned.length > 0) {
        sections.push({
          id: 'general', name: 'General', description: 'Uncategorized documents',
          files: unassigned.map(d => ({
            id: d.id, name: d.name, size: formatFileSize(d.size), lastModified: formatDate(d.lastModified),
            fileType: d.name.split('.').pop()?.toUpperCase() || '', extension: d.name.split('.').pop() || '',
            icon: getFileIconForDocument(d), sharedWith: [], description: d.description, tags: d.tags ? d.tags.split(',') : [], url: d.url
          }))
        });
      }

      return {
        id: categoryDef.id,
        name: categoryDef.label,
        description: `Documents in ${categoryDef.label}`,
        icon: getCategoryIcon(categoryDef.id),
        fileCount: categoryDocuments.length,
        totalSize: categoryDocuments.reduce((a, b) => a + (b.size || 0), 0),
        lastModified: '',
        category: 'company-category',
        isFolder: true,
        sharedWith: [],
        recentFiles: [], // Could implement recent files logic here
        sections: sections
      };

    }
    return null;
  }, [navigationState, documents]);


  return (
    <PageLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Document Management System</h1>
        <p className="text-gray-500">Access and manage organisational and personal documents</p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <Input
          placeholder={searchPlaceholder} value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-[400px]" disabled={isUploading || isLoading}
        />
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" disabled={isUploading || isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {/* Show Add Document button if not on 'My Documents' or 'External Shared' tab */}
          {activePrimaryTab !== 'my-documents' && activePrimaryTab !== 'external-shared' && canAddDocument && (
            <Button onClick={() => setIsAddDocumentModalOpen(true)} variant="default" disabled={isUploading || isLoading}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Document
            </Button>
          )}
        </div>
      </div>

      <nav className="mb-6 border-b border-gray-300">
        <ul className="flex flex-wrap -mb-px">
          {primaryTabsConfig.map(tab => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => handlePrimaryTabChange(tab.id)}
                disabled={isLoading || isUploading}
                className={`inline-flex items-center justify-center p-4 border-b-2 group
                            ${activePrimaryTab === tab.id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500'}`}
              > {tab.icon} {tab.label} </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="w-full">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-4 text-lg text-muted-foreground">Loading Documents...</p>
          </div>
        )}

        {!isLoading && authError && activePrimaryTab === 'my-documents' && (
          <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-lg mt-4">
            <p className="text-destructive mb-4 text-center">Authentication error for My Documents. Please re-authenticate.</p>
            <Button onClick={handleReauthenticate} variant="default" disabled={isLoading || isUploading}>
              Re-authenticate
            </Button>
          </div>
        )}

        {!isLoading && !authError && activePrimaryTab === 'my-documents' && currentPath.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap">
            <Button variant="ghost" size="sm" onClick={navigateUp} disabled={isLoading || isUploading} className="flex items-center text-primary hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button> <span>/</span>
            <Button variant="link" size="sm" className="text-primary px-1 h-auto py-0"
              onClick={async () => { setIsLoading(true); await fetchPersonalDocumentsRoot(); setIsLoading(false); }}
              disabled={isLoading || isUploading}> OneDrive Root </Button> <span>/</span>
            {currentPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-1">
                {index < currentPath.length - 1 ? (
                  <Button variant="link" size="sm" className="text-primary px-1 h-auto py-0"
                    onClick={async () => {
                      if (isLoading || isUploading) return; setIsLoading(true);
                      const pathSlice = currentPath.slice(0, index + 1);
                      const targetFolder = pathSlice[pathSlice.length - 1];
                      try {
                        const contentsResult = await getFolderContents(targetFolder.id);
                        const contents: DisplayableDocument[] = (contentsResult || []).map((item: any) => ({
                          id: item.id, name: item.name, url: item.webUrl, lastModified: item.lastModifiedDateTime, size: item.size, isFolder: !!item.folder, source: 'OneDrive', originalFileName: item.name
                        }));
                        contents.sort((a, b) => { if (a.isFolder && !b.isFolder) return -1; if (!a.isFolder && b.isFolder) return 1; return a.name.localeCompare(b.name); });
                        setDocuments(contents); setCurrentPath(pathSlice);
                      } catch (error: any) {
                        toast.error(`Failed to load folder: ${error.message}`);
                        if (error.message?.includes('Authentication') || error.code === 'UserLoginRequired') setAuthError(true);
                      } finally { setIsLoading(false); }
                    }}
                    disabled={isLoading || isUploading} > {folder.name} </Button>
                ) : (<span className="text-foreground font-medium px-1">{folder.name}</span>)}
                {index < currentPath.length - 1 && <span className="text-gray-400">/</span>}
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!authError || activePrimaryTab !== 'my-documents') && (
          <div className="space-y-8">
            {/* Breadcrumb Navigation */}
            {navigationState.breadcrumbs.length > 0 && (
              <BreadcrumbNavigation
                breadcrumbs={navigationState.breadcrumbs}
                onBreadcrumbClick={handleBreadcrumbClick}
              />
            )}

            {/* Category View - Show categories and recently opened */}
            {navigationState.currentLevel === 'categories' && (
              <>
                {/* Recently Opened Section (like in reference image) */}
                {activePrimaryTab === 'company-wide' && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-primary mb-1">Recently opened</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                      {/* Recently opened files - smaller cards */}
                      {[
                        { name: 'Annual Report 2024.docx', size: '4 MB', date: '2/1/2024', icon: <FileText className="h-8 w-8 text-blue-500" /> },
                        { name: 'Budget Forecast.xlsx', size: '2.3 MB', date: '1/30/2024', icon: <FileSpreadsheet className="h-8 w-8 text-green-500" /> },
                        { name: 'Team Overview.pptx', size: '5.1 MB', date: '1/28/2024', icon: <Presentation className="h-8 w-8 text-red-500" /> },
                        { name: 'Compliance Guide.pdf', size: '1.8 MB', date: '1/25/2024', icon: <File className="h-8 w-8 text-red-600" /> },
                      ].map((file, index) => (
                        <Card key={index} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex flex-col items-center text-center">
                            {file.icon}
                            <h4 className="text-sm font-medium text-gray-900 mt-2 line-clamp-2">{file.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{file.date}</p>
                            <p className="text-xs text-gray-400">{file.size}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Document Categories Section */}
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-primary mb-1">
                      {activePrimaryTab === 'company-wide' && 'Document Categories'}
                      {activePrimaryTab === 'my-documents' && 'My Files'}
                      {activePrimaryTab === 'team-unit' && 'Team Documents'}
                      {activePrimaryTab === 'external-shared' && 'External Documents'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activePrimaryTab === 'company-wide' && 'Browse documents by organizational category'}
                      {activePrimaryTab === 'my-documents' && 'Your personal files and folders'}
                      {activePrimaryTab === 'team-unit' && 'Shared team and division documents'}
                      {activePrimaryTab === 'external-shared' && 'Documents shared with external parties'}
                    </p>
                  </div>

                  {activePrimaryTab === 'my-documents' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => {
                          if (doc.isFolder) {
                            const folderData: DocumentFolder = {
                              id: doc.id,
                              name: doc.name,
                              description: 'Folder',
                              fileCount: 0, // Not available in simple view
                              totalSize: doc.size || 0,
                              lastModified: doc.lastModified,
                              icon: <FolderOpen className="h-12 w-12 text-blue-500" />,
                              category: 'folder',
                              isFolder: true,
                              sharedWith: []
                            };
                            return (
                              <DocumentFolderCard
                                key={doc.id}
                                folder={folderData}
                                onClick={handleFolderClick}
                              />
                            );
                          } else {
                            // Map DisplayableDocument to MockDocument for FileCard
                            const fileData: MockDocument = {
                              id: doc.id,
                              name: doc.name,
                              size: formatFileSize(doc.size),
                              lastModified: formatDate(doc.lastModified),
                              fileType: doc.name.split('.').pop()?.toUpperCase() || 'FILE',
                              extension: doc.name.split('.').pop() || '',
                              icon: getFileIconForDocument(doc),
                              sharedWith: [], // Personal files usually not shared in this view context or data not avail
                              description: doc.description,
                              tags: doc.tags ? doc.tags.split(',') : []
                            };
                            return (
                              <FileCard
                                key={doc.id}
                                file={fileData}
                                onClick={() => handleFileClick(doc)} // Use original doc for onClick to get URL
                              />
                            );
                          }
                        })
                      ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                          <p className="text-lg mb-2"> {searchQuery ? 'No documents match your search.' : 'No documents found.'} </p>
                          <p className="text-sm">You have no documents in this OneDrive folder.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {documentFolders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {documentFolders.map((folder) => (
                            <DocumentFolderCard
                              key={folder.id}
                              folder={folder}
                              onClick={handleFolderClick}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                          <p className="text-lg mb-2"> {searchQuery ? 'No documents match your search.' : 'No documents found.'} </p>
                          <p className="text-sm">
                            {searchQuery ? 'Try a different search term.' :
                              (activePrimaryTab === 'company-wide' ? 'No organisational documents found in this category.' :
                                activePrimaryTab === 'team-unit' ? 'No documents found for your team/unit.' :
                                  'Check back later for new documents.')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* File View - Show files within a category */}
            {navigationState.currentLevel === 'files' && currentCategoryData && (
              <div className="space-y-8">
                {/* Recently opened files in this category */}
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-primary mb-1">Recently opened</h2>
                    <p className="text-sm text-gray-600">From {currentCategoryData.name}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {currentCategoryData.recentFiles.map((file, index) => (
                      <Card key={index} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleFileClick(file)}>
                        <div className="flex flex-col items-center text-center">
                          {file.icon}
                          <h4 className="text-sm font-medium text-gray-900 mt-2 line-clamp-2">{file.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{file.lastModified}</p>
                          <p className="text-xs text-gray-400">{file.size}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* File sections */}
                {currentCategoryData.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{section.name}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {section.files.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          onClick={handleFileClick}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <AddDocumentModal
        isOpen={isAddDocumentModalOpen}
        onOpenChange={setIsAddDocumentModalOpen}
        onShare={handleShareDocument}
        availableCategories={modalAvailableCategories}
        subCategoryMap={companyWideSubCategoryMap}
        initialCategory={companyWideSubCategories[1].label}
      />
    </PageLayout>
  );
}
