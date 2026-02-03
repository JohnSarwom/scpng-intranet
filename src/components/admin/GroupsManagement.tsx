import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { UserSharePointService, PermissionGroup } from '@/services/userSharePointService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import PermissionMatrix from './PermissionMatrix';

const GroupsManagement = () => {
    const { instance } = useMsal();
    const [groups, setGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<PermissionGroup | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<PermissionGroup>>({
        title: '',
        description: '',
        permissions: {}
    });

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const graphClient = await getGraphClient(instance);
            if (!graphClient) throw new Error("Failed to init Graph Client");

            const userService = new UserSharePointService(graphClient);
            const fetchedGroups = await userService.getGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error("Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [instance]);

    const handleOpenModal = (group?: PermissionGroup) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                title: group.title,
                description: group.description,
                permissions: group.permissions || {}
            });
        } else {
            setEditingGroup(null);
            setFormData({
                title: '',
                description: '',
                permissions: {}
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            toast.error("Group Name is required");
            return;
        }

        try {
            const graphClient = await getGraphClient(instance);
            if (!graphClient) throw new Error("Failed to init Graph Client");
            const userService = new UserSharePointService(graphClient);

            if (editingGroup && editingGroup.id) {
                // Update
                await userService.updateGroup({
                    ...editingGroup,
                    title: formData.title!,
                    description: formData.description,
                    permissions: formData.permissions
                });
                toast.success("Group updated successfully");
            } else {
                // Create
                await userService.createGroup({
                    title: formData.title!,
                    description: formData.description,
                    permissions: formData.permissions
                });
                toast.success("Group created successfully");
            }

            setIsModalOpen(false);
            fetchGroups();
        } catch (error) {
            console.error("Error saving group:", error);
            toast.error("Failed to save group");
        }
    };

    const handleDelete = async (groupId: string) => {
        if (!confirm("Are you sure you want to delete this group? Users assigned to this group will lose these permissions.")) return;

        try {
            const graphClient = await getGraphClient(instance);
            if (!graphClient) throw new Error("Failed to init Graph Client");
            const userService = new UserSharePointService(graphClient);

            await userService.deleteGroup(groupId);
            toast.success("Group deleted");
            fetchGroups();
        } catch (error) {
            console.error("Error deleting group:", error);
            toast.error("Failed to delete group");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Permission Groups</h2>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Create Group
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Permissions Count</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">Loading groups...</TableCell>
                            </TableRow>
                        ) : groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No groups found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        {group.title}
                                    </TableCell>
                                    <TableCell>{group.description || '-'}</TableCell>
                                    <TableCell>
                                        {Object.keys(group.permissions || {}).length} Resources
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(group)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => group.id && handleDelete(group.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
                        <DialogDescription>
                            Define the permissions for this group. Users assigned to this group will inherit these permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Group Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g., Asset Managers"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="mt-4">
                            <Label className="mb-2 block">Permission Matrix</Label>
                            <PermissionMatrix
                                permissions={formData.permissions}
                                onChange={(newPerms) => setFormData({ ...formData, permissions: newPerms })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Group</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GroupsManagement;
