import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { galleryService, type GalleryPhoto } from '@/integrations/supabase/galleryService';
import { toast } from 'sonner';

interface EditPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: GalleryPhoto | null;
  onPhotoUpdated: (updatedPhoto: GalleryPhoto) => void;
}

const EditPhotoModal: React.FC<EditPhotoModalProps> = ({ isOpen, onClose, photo, onPhotoUpdated }) => {
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || '');
    }
  }, [photo]);

  const handleSave = async () => {
    if (!photo) return;

    setIsSaving(true);
    try {
      const updatedPhoto = await galleryService.updatePhoto(photo.id, { caption });
      toast.success('Photo details updated successfully!');
      onPhotoUpdated(updatedPhoto);
      onClose();
    } catch (error) {
      console.error('Failed to update photo:', error);
      toast.error('Failed to update photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Photo Details</DialogTitle>
          <DialogDescription>Update the caption for this photo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <img src={photo.image_url} alt="Selected" className="w-full h-full object-cover" />
          </div>
          <Textarea
            id="caption"
            placeholder="Enter a caption for the photo"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPhotoModal;
