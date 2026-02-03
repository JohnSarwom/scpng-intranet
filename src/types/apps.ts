export interface AppLink {
  id: string;
  name: string;
  description: string;
  icon: string; // URL to icon image or emoji
  url: string;
  category: string; // Changed to string to support dynamic categories from SharePoint
  isExternal?: boolean;
  displayOrder?: number; // For sorting apps
}

export interface AppCategory {
  id: string;
  name: string;
  apps: AppLink[];
}

// Type for apps coming from SharePoint
export interface SharePointAppItem {
  id: string;
  appId: string;
  title: string;
  description?: string;
  icon?: string;
  appUrl: string;
  category: string;
  isExternal?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}
