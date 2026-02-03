import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FolderItem } from '../types';

interface DeleteFolderModalProps {
  folder: FolderItem | null;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  folder,
  isLoading,
  onCancel,
  onConfirm
}) => {
  if (!folder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Delete Folder</h3>
        <p className="mb-4">
          Are you sure you want to delete the folder "{folder.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal; 