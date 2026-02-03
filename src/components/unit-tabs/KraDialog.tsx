import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Kra } from '@/types';
import { StaffMember } from '@/types/staff';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (kraData: Partial<Kra>) => void;
  initialData?: Partial<Kra> | null;
  staffMembers: StaffMember[];
}

const KraDialog: React.FC<KraDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  staffMembers,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setOwnerId(initialData.ownerId?.toString());
    } else {
      setTitle('');
      setDescription('');
      setOwnerId(undefined);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kraData: Partial<Kra> = {
      id: initialData?.id,
      title,
      description,
      ownerId: ownerId ? parseInt(ownerId, 10) : undefined,
    };
    onSubmit(kraData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit KRA' : 'Create New KRA'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of the KRA.' : 'Fill in the details for the new KRA.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="kra-form" className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="owner">Owner</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="kra-form">
            {initialData ? 'Save Changes' : 'Create KRA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KraDialog;
