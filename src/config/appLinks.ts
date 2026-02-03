import { AppLink } from '@/types/apps';

export const microsoft365Apps: AppLink[] = [
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Email, schedule, and set tasks.',
    icon: '📧',
    url: 'https://outlook.office.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'word',
    name: 'Word',
    description: 'Create and edit documents.',
    icon: '📝',
    url: 'https://office.com/launch/word',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'excel',
    name: 'Excel',
    description: 'Create and edit spreadsheets.',
    icon: '📊',
    url: 'https://office.com/launch/excel',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'powerpoint',
    name: 'PowerPoint',
    description: 'Create presentations.',
    icon: '📽️',
    url: 'https://office.com/launch/powerpoint',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'onenote',
    name: 'OneNote',
    description: 'Digital note-taking app.',
    icon: '📓',
    url: 'https://www.onenote.com/notebooks',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Cloud storage and file sharing.',
    icon: '☁️',
    url: 'https://onedrive.live.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'teams',
    name: 'Teams',
    description: 'Chat, meetings, and collaboration.',
    icon: '👥',
    url: 'https://teams.microsoft.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Team sites and content management.',
    icon: '🔷',
    url: 'https://www.office.com/launch/sharepoint',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'planner',
    name: 'Planner',
    description: 'Create plans, organize and assign tasks.',
    icon: '📋',
    url: 'https://tasks.office.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'forms',
    name: 'Forms',
    description: 'Customize surveys and quizzes.',
    icon: '📝',
    url: 'https://forms.office.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'powerbi',
    name: 'Power BI',
    description: 'Create actionable, dynamic dashboards.',
    icon: '📈',
    url: 'https://app.powerbi.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'yammer',
    name: 'Yammer',
    description: 'Connect and engage across your organization.',
    icon: '💬',
    url: 'https://www.yammer.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'stream',
    name: 'Stream',
    description: 'Share videos of meetings and presentations.',
    icon: '🎬',
    url: 'https://stream.office.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'sway',
    name: 'Sway',
    description: 'Create interactive reports and presentations.',
    icon: '📰',
    url: 'https://sway.office.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'todo',
    name: 'To Do',
    description: 'List and manage your tasks.',
    icon: '✓',
    url: 'https://to-do.office.com',
    category: 'microsoft365',
    isExternal: true
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    description: 'Ideate and collaborate on a freeform canvas.',
    icon: '🖍️',
    url: 'https://whiteboard.office.com',
    category: 'microsoft365',
    isExternal: true
  }
];

export const customApps: AppLink[] = [
  // Add your custom internal apps here
];

export const allApps = [...microsoft365Apps, ...customApps];
