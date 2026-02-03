// Utility functions for the Setup Wizard

/**
 * Generate a unique ID for database entities
 */
export const generateId = (): string => 
  `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Format file size for human-readable display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Add global CSS animation style for folder highlighting
 */
export const addGlobalFolderHighlightStyle = (): void => {
  if (typeof document !== 'undefined') {
    // Check if style already exists to avoid duplicates
    if (!document.getElementById('folder-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'folder-highlight-style';
      style.innerHTML = `
        @keyframes highlightFolder {
          0% { background-color: rgba(59, 130, 246, 0.1); }
          50% { background-color: rgba(59, 130, 246, 0.3); }
          100% { background-color: rgba(59, 130, 246, 0.1); }
        }
        .highlight-folder {
          animation: highlightFolder 2s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * Get icon for file type based on extension
 */
export const getFileIconName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'pdf':
      return 'file-text-red';
    case 'doc':
    case 'docx':
      return 'file-text-blue';
    case 'xls':
    case 'xlsx':
      return 'file-text-green';
    case 'ppt':
    case 'pptx':
      return 'file-text-orange';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return 'image';
    case 'csv':
      return 'file-text-green';
    default:
      return 'file';
  }
};

/**
 * Clean up local storage related to setup wizard
 */
export const clearSetupLocalStorage = (): void => {
  // Clear specific keys
  localStorage.removeItem('unitopia_objectives');
  localStorage.removeItem('unitopia_kras');
  localStorage.removeItem('unitopia_kpis');
  localStorage.removeItem('unitopia_storage_type');
  
  // Clear CSV-related storage
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('unitopia_csv_')) {
      localStorage.removeItem(key);
    }
  }
  
  // Clear any sessionStorage that might affect CSV operations
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith('csv_') || key.includes('unitopia')) {
      sessionStorage.removeItem(key);
    }
  }
};

/**
 * Update object with timestamps (created/updated)
 */
export const addTimestamps = <T extends object>(obj: T, isNew = false): T => {
  const currentTimestamp = new Date().toISOString();
  
  return {
    ...obj,
    updatedAt: currentTimestamp,
    createdAt: isNew ? currentTimestamp : (obj as any).createdAt || currentTimestamp
  };
}; 