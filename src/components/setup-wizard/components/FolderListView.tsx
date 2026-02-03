import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { FolderItem } from '../types';
import { Folder, FolderOpen, Trash2, ChevronLeft, Home, RefreshCw, AlertCircle } from 'lucide-react';

interface FolderListViewProps {
  folders: FolderItem[];
  currentFolderId: string | null;
  folderPath: Array<{ id: string; name: string }>;
  isLoading: boolean;
  selectedFolder: FolderItem | null;
  folderError: string | null;
  handleRetryFolderFetch: () => void;
  handleSelectFolder: (folder: FolderItem) => void;
  navigateToFolder: (folder: FolderItem) => void;
  handleDeleteFolder: (folder: FolderItem) => void;
  fetchOneDriveFolders: (folderId?: string) => Promise<void>;
  navigateUp: () => void;
  navigateToPathItem: (index: number) => void;
}

const FolderListView: React.FC<FolderListViewProps> = ({
  folders,
  currentFolderId,
  folderPath,
  isLoading,
  selectedFolder,
  folderError,
  handleRetryFolderFetch,
  handleSelectFolder,
  navigateToFolder,
  handleDeleteFolder,
  fetchOneDriveFolders,
  navigateUp,
  navigateToPathItem
}) => {
  // Ensure folders is an array before proceeding
  if (!folders || !Array.isArray(folders)) {
    return (
      <div className="text-center p-6 border rounded-lg bg-red-50">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
        <p className="text-red-600 font-medium">Invalid folder data</p>
        <p className="text-sm text-red-500 mt-1">There was a problem loading folder data</p>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryFolderFetch}
            className="mx-auto flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <Folder className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No folders found in {folderPath.length > 0 ? 'this folder' : 'your OneDrive'}</p>
        <p className="text-sm text-gray-400 mt-1">Create a new folder to continue</p>
        
        {folderError && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryFolderFetch}
              className="mx-auto flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render the folder path
  const renderFolderPath = () => {
    return (
      <div className="mb-2 flex items-center text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 mr-1"
          onClick={() => fetchOneDriveFolders()}
          title="Go to root folder"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <span>/</span>
        
        {folderPath.map((folder, index) => (
          <Fragment key={folder.id}>
            <Button
              variant="link"
              size="sm"
              className="px-1 py-0 h-auto text-blue-600"
              onClick={() => navigateToPathItem(index)}
            >
              {folder.name}
            </Button>
            {index < folderPath.length - 1 && <span>/</span>}
          </Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          {folderPath.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="mr-2 p-1"
              onClick={navigateUp}
              title="Go up one level"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h5 className="font-medium text-sm">
            {folderPath.length > 0
              ? `${folderPath[folderPath.length - 1].name}`
              : 'OneDrive Root'}
          </h5>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fetchOneDriveFolders(currentFolderId || undefined)}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {folderPath.length > 0 && renderFolderPath()}
      
      <div className="max-h-[220px] overflow-y-auto">
        {folders.map((folder) => folder && (
          <div
            key={folder.id || `folder-${Math.random()}`}
            id={`folder-${folder.id}`}
            className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedFolder?.id === folder.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => handleSelectFolder(folder)}
            onDoubleClick={() => {
              // Double click to either navigate into the folder or select and continue
              if (folderPath.length < 3) {
                navigateToFolder(folder);
              } else {
                // If we're already deep in the folder structure, just select this folder
                handleSelectFolder(folder);
              }
            }}
          >
            <div className="flex items-center">
              <Folder className="h-5 w-5 mr-2 text-blue-500" />
              <span>{folder.name || 'Unnamed Folder'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFolder(folder);
                }}
                title="Select and continue with this folder"
                className="text-xs px-2 py-1 h-7"
              >
                Select
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToFolder(folder);
                }}
                title="Open folder"
              >
                <FolderOpen className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder);
                }}
                title="Delete folder"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderListView; 