
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash, UserPlus, Save, X, Bell, Settings as SettingsIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole, PermissionGroup } from '@/services/userSharePointService';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Mock business units data - can be replaced with DB fetch later
const mockUnits = [
  { id: 'finance', name: 'Finance Department' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'it', name: 'IT Department' },
  { id: 'operations', name: 'Operations' },
];

interface UserManagementProps {
  users: UserRole[];
  availableGroups: PermissionGroup[];
  // setUsers is removed in favor of direct add/update callbacks which refresh the list in parent
  onAddUser: (user: Partial<UserRole>) => Promise<void>;
  onUpdateUser: (email: string, updates: Partial<UserRole>) => Promise<void>;
  onDeleteUser: (email: string) => Promise<void>;
  onGeneratePassword?: (user: UserRole) => void;
  onConfigureEmail?: (user: UserRole) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  availableGroups,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onGeneratePassword,
  onConfigureEmail
}) => {
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);
  const [newUser, setNewUser] = useState<Partial<UserRole> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to toggle groups in edit/add mode
  const toggleGroup = (groupTitle: string, isEditing: boolean) => {
    if (isEditing && editingUser) {
      const currentGroups = editingUser.groups || [];
      let newGroups;
      if (currentGroups.includes(groupTitle)) {
        newGroups = currentGroups.filter(g => g !== groupTitle);
      } else {
        newGroups = [...currentGroups, groupTitle];
      }
      setEditingUser({ ...editingUser, groups: newGroups });
    } else if (!isEditing && newUser) {
      const currentGroups = newUser.groups || [];
      let newGroups;
      if (currentGroups.includes(groupTitle)) {
        newGroups = currentGroups.filter(g => g !== groupTitle);
      } else {
        newGroups = [...currentGroups, groupTitle];
      }
      setNewUser({ ...newUser, groups: newGroups });
    }
  };

  const handleEditUser = (user: UserRole) => {
    setEditingUser({ ...user });
  };

  const saveUserChanges = async () => {
    if (editingUser) {
      setIsProcessing(true);
      try {
        await onUpdateUser(editingUser.user_email, {
          role_name: editingUser.role_name,
          division_name: editingUser.division_name,
          unit_name: editingUser.unit_name,
          groups: editingUser.groups
        });
        setEditingUser(null);
        toast.success('User updated successfully');
      } catch (error) {
        toast.error('Failed to update user');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setIsProcessing(true);
      try {
        await onDeleteUser(email);
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const startAddingUser = () => {
    setNewUser({
      user_email: '',
      user_name: '',
      role_name: 'staff_member',
      groups: []
    });
  };

  const saveNewUser = async () => {
    if (newUser?.user_email && newUser.user_name) {
      setIsProcessing(true);
      try {
        await onAddUser(newUser);
        setNewUser(null);
        toast.success('User added successfully');
      } catch (error) {
        toast.error('Failed to add user');
      } finally {
        setIsProcessing(false);
      }
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setNewUser(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Users</span>
          <Button onClick={startAddingUser} size="sm" className="flex items-center gap-1">
            <UserPlus size={16} />
            <span>Add User</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Manage user accounts and permissions via SharePoint UserRoles list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {newUser && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-3">Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={newUser.user_name}
                  onChange={e => setNewUser({ ...newUser, user_name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={newUser.user_email}
                  onChange={e => setNewUser({ ...newUser, user_email: e.target.value })}
                  placeholder="email@scpng.gov.pg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newUser.role_name}
                  onChange={e => setNewUser({ ...newUser, role_name: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="staff_member">Staff Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Unit</label>
                <select
                  value={newUser.unit_name || ''}
                  onChange={e => {
                    setNewUser({ ...newUser, unit_name: e.target.value });
                  }}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Unit</option>
                  {mockUnits.map(unit => (
                    <option key={unit.id} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Security Groups</label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white dark:bg-gray-900">
                  {availableGroups.map(group => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-grp-${group.id}`}
                        checked={(newUser.groups || []).includes(group.title)}
                        onCheckedChange={() => toggleGroup(group.title, false)}
                      />
                      <Label htmlFor={`new-grp-${group.id}`}>{group.title}</Label>
                    </div>
                  ))}
                  {availableGroups.length === 0 && <span className="text-sm text-gray-500">No groups available. Create one in 'Roles & Groups'.</span>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEdit} className="flex items-center gap-1">
                <X size={16} />
                <span>Cancel</span>
              </Button>
              <Button onClick={saveNewUser} disabled={isProcessing} className="flex items-center gap-1">
                <Save size={16} />
                <span>{isProcessing ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Groups</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user.id || user.user_email}>
                  {editingUser && editingUser.id === user.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          value={editingUser.user_name}
                          onChange={e => setEditingUser({ ...editingUser, user_name: e.target.value })}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          value={editingUser.user_email}
                          disabled // Email usually shouldn't be changed as it's the key
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={editingUser.role_name}
                          onChange={e => setEditingUser({ ...editingUser, role_name: e.target.value })}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="staff_member">Staff Member</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={editingUser.unit_name || ''}
                          onChange={e => setEditingUser({ ...editingUser, unit_name: e.target.value })}
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="">Select Unit</option>
                          {mockUnits.map(unit => (
                            <option key={unit.id} value={unit.name}>{unit.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              {editingUser.groups?.length ? `${editingUser.groups.length} Groups` : 'Select Groups'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-60">
                            <div className="space-y-2">
                              {availableGroups.map(group => (
                                <div key={group.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-grp-${user.id}-${group.id}`}
                                    checked={(editingUser.groups || []).includes(group.title)}
                                    onCheckedChange={() => toggleGroup(group.title, true)}
                                  />
                                  <Label htmlFor={`edit-grp-${user.id}-${group.id}`}>{group.title}</Label>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={saveUserChanges} disabled={isProcessing} size="sm" variant="ghost" className="text-green-600 dark:text-green-400 mr-2">
                          <Save size={16} />
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="ghost" className="text-gray-600 dark:text-gray-400">
                          <X size={16} />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">{user.user_name || user.user_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.user_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={`
                          ${user.role_name === 'super_admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            user.role_name === 'admin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              user.role_name === 'manager' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-green-100 text-green-800 border-green-200'}`}>
                          {user.role_name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.unit_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.groups && user.groups.length > 0 ? (
                            user.groups.map(g => (
                              <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button onClick={() => handleEditUser(user)} size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                            <Pencil size={16} />
                          </Button>
                          {onGeneratePassword && (
                            <Button onClick={() => onGeneratePassword(user)} size="sm" variant="ghost" className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                              <SettingsIcon size={16} />
                            </Button>
                          )}
                          {onConfigureEmail && (
                            <Button onClick={() => onConfigureEmail(user)} size="sm" variant="ghost" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <Bell size={16} />
                            </Button>
                          )}
                          <Button onClick={() => handleDeleteUser(user.user_email)} size="sm" variant="ghost" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash size={16} />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
