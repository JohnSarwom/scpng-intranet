import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FolderPlus, Loader2 } from 'lucide-react';

interface CreateFolderProps {
  onCreateFolder: (folderName: string) => Promise<void>;
  isLoading: boolean;
  currentPath: string;
}

const CreateFolder: React.FC<CreateFolderProps> = ({
  onCreateFolder,
  isLoading,
  currentPath
}) => {
  const [newFolderName, setNewFolderName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
    }
  };

  return (
    <Card className="p-6">
      <h4 className="font-semibold mb-4">Create New Folder</h4>
      <div className="space-y-4">
        <form 
          onSubmit={handleSubmit}
          className="flex gap-2"
        >
          <div className="flex-1">
            <Input
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              disabled={isLoading}
              className="w-full"
              autoFocus
            />
            <div className="text-xs text-muted-foreground mt-1">
              {currentPath
                ? `Creating in: ${currentPath}`
                : 'Creating folder will automatically select it and continue'}
            </div>
          </div>
          <Button
            type="submit"
            disabled={!newFolderName.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FolderPlus className="h-4 w-4 mr-2" />}
            Create & Continue
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default CreateFolder; 