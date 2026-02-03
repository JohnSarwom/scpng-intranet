
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Plus, Trash2, Check, Lock, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGroup } from '@/services/userSharePointService';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface RoleManagementProps {
  groups: PermissionGroup[];
  onCreateGroup: (group: PermissionGroup) => Promise<void>;
  onUpdateGroup: (group: PermissionGroup) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
}

const SYSTEM_RESOURCES = [
  { id: 'home', label: 'Home Page' },
  { id: 'news', label: 'News' },
  { id: 'documents', label: 'Documents' },
  { id: 'forms', label: 'Forms & Templates' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contacts', label: 'Employee Directory' },
  { id: 'settings', label: 'Settings' },
  { id: 'admin', label: 'Admin Dashboard' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'ai', label: 'AI & Chat' },
  { id: 'market_data', label: 'Market Data' },
  { id: 'apps', label: 'Apps & Tools' },
  { id: 'units', label: 'Unit Page' },
  { id: 'organization', label: 'Organization Chart' },
  { id: 'hr', label: 'HR Profiles' },
  { id: 'reports', label: 'Reports' },
  { id: 'tickets', label: 'IT Tickets' },
  { id: 'licenses', label: 'Licensing Registry' },
  { id: 'assets', label: 'Asset Management' },
  { id: 'payments', label: 'Payments' },
];

const RoleManagement: React.FC<RoleManagementProps> = ({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup
}) => {
  const [newGroup, setNewGroup] = useState<Partial<PermissionGroup> | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateGroup = () => {
    setNewGroup({
      title: '',
      description: '',
      permissions: {},
    });
    setEditingGroupId(null);
  };

  const handleEditGroup = (group: PermissionGroup) => {
    setNewGroup({
      ...group
    });
    setEditingGroupId(group.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveNewGroup = async () => {
    if (newGroup?.title) {
      setIsProcessing(true);
      try {
        if (editingGroupId && newGroup) {
          const updatedGroup = { ...newGroup, id: editingGroupId } as PermissionGroup;
          await onUpdateGroup(updatedGroup);
          toast.success('Group updated successfully');
        } else {
          await onCreateGroup(newGroup as PermissionGroup);
          toast.success('Group created successfully');
        }
        setNewGroup(null);
        setEditingGroupId(null);
      } catch (error) {
        toast.error(editingGroupId ? 'Failed to update group' : 'Failed to create group');
      } finally {
        setIsProcessing(false);
      }
    } else {
      toast.error('Group title is required');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this permission group?')) {
      setIsProcessing(true);
      try {
        await onDeleteGroup(groupId);
        toast.success('Group deleted successfully');
      } catch (error) {
        toast.error('Failed to delete group');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const togglePermission = (resourceId: string) => {
    if (!newGroup) return;

    const currentPermissions = { ...(newGroup.permissions || {}) };
    const resourcePerms = currentPermissions[resourceId] || [];

    if (resourcePerms.includes('read')) {
      // Remove read (and thus access)
      delete currentPermissions[resourceId];
    } else {
      // Add read
      currentPermissions[resourceId] = ['read'];
    }

    setNewGroup({ ...newGroup, permissions: currentPermissions });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Permission Groups</h2>
          <p className="text-muted-foreground">Manage permission groups and their access rights.</p>
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {newGroup && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>{editingGroupId ? 'Edit Permission Group' : 'Create New Permission Group'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Group Title</Label>
                <Input
                  value={newGroup.title}
                  onChange={e => setNewGroup({ ...newGroup, title: e.target.value })}
                  placeholder="e.g. IT Group"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newGroup.description}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Description of the group"
                />
              </div>
            </div>

            <div>
              <Label className="mb-4 block text-base">Page Access Permissions</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {SYSTEM_RESOURCES.map(resource => {
                  const isChecked = newGroup.permissions?.[resource.id]?.includes('read');
                  return (
                    <div
                      key={resource.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-primary/10 border-primary' : 'bg-transparent border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      onClick={() => togglePermission(resource.id)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => togglePermission(resource.id)}
                        id={`perm-${resource.id}`}
                      />
                      <Label htmlFor={`perm-${resource.id}`} className="cursor-pointer font-medium">
                        {resource.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setNewGroup(null); setEditingGroupId(null); }}>Cancel</Button>
              <Button onClick={saveNewGroup} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : (editingGroupId ? 'Save Changes' : 'Create Group')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Card key={group.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  {group.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {group.description || "No description provided"}
                </p>
              </div>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 mt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Access Rights</Label>
                <div className="flex flex-wrap gap-1.5 h-32 content-start overflow-y-auto pr-1 scrollbar-thin">
                  {Object.keys(group.permissions || {}).length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No specific permissions configured.</span>
                  ) : (
                    Object.keys(group.permissions || {}).map(resourceKey => {
                      const resourceLabel = SYSTEM_RESOURCES.find(r => r.id === resourceKey)?.label || resourceKey;
                      return (
                        <Badge key={resourceKey} variant="secondary" className="text-xs font-normal">
                          {resourceLabel}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                <Button size="sm" variant="ghost" onClick={() => handleEditGroup(group)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteGroup(group.id as string)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;