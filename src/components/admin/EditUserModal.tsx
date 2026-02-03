import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserSharePointService, UserRole, PermissionGroup } from '@/services/userSharePointService';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';

const ROLES = [
  { id: 'staff_member', name: 'Staff Member' },
  { id: 'admin', name: 'Admin' },
  { id: 'super_admin', name: 'Super Admin' },
  { id: 'division_manager', name: 'Division Manager' },
];

interface EditUserModalProps {
  user: UserRole;
  fetchUsers: () => void;
}

const EditUserModal = ({ user, fetchUsers }: EditUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.user_name || '');
  const [email, setEmail] = useState(user.user_email);
  const [division, setDivision] = useState(user.division_name || '');
  const [unit, setUnit] = useState(user.unit_name || '');
  const [selectedRole, setSelectedRole] = useState(user.role_name || '');
  const [availableGroups, setAvailableGroups] = useState<PermissionGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(user.groups || []);
  const { instance } = useMsal();

  const fetchGroups = async () => {
    try {
      const graphClient = await getGraphClient(instance);
      if (graphClient) {
        const userService = new UserSharePointService(graphClient);
        const groups = await userService.getGroups();
        setAvailableGroups(groups);
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName(user.user_name || '');
    setEmail(user.user_email);
    setDivision(user.division_name || '');
    setUnit(user.unit_name || '');
    setSelectedRole(user.role_name || '');
    setSelectedGroups(user.groups || []);
  };

  useEffect(() => {
    resetForm();
  }, [user]);

  const handleGroupToggle = (groupName: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const handleSave = async () => {
    if (!name || !selectedRole) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const graphClient = await getGraphClient(instance);
      if (!graphClient) {
        toast.error('Failed to initialize Graph Client');
        return;
      }

      const userService = new UserSharePointService(graphClient);

      await userService.updateUser(email, {
        user_name: name,
        role_name: selectedRole,
        division_name: division,
        unit_name: unit,
        is_admin: selectedRole === 'super_admin',
        groups: selectedGroups
      });

      toast.success('User updated successfully!');
      fetchUsers();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const graphClient = await getGraphClient(instance);
      if (!graphClient) {
        toast.error('Failed to initialize Graph Client');
        return;
      }

      const userService = new UserSharePointService(graphClient);
      await userService.deleteUser(email);

      toast.success('User deleted successfully!');
      fetchUsers();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="division" className="text-right">
              Division
            </Label>
            <Input id="division" value={division} onChange={(e) => setDivision(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Groups Selection */}
          <div className="grid grid-cols-4 gap-4 border-t pt-4">
            <Label className="text-right pt-2">
              Groups
            </Label>
            <div className="col-span-3 space-y-2 max-h-40 overflow-y-auto border rounded p-2">
              {availableGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No groups available.</p>
              ) : (
                availableGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedGroups.includes(group.title)}
                      onCheckedChange={() => handleGroupToggle(group.title)}
                    />
                    <Label htmlFor={`group-${group.id}`} className="text-sm font-normal cursor-pointer">
                      {group.title}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete User</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user
                  and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
