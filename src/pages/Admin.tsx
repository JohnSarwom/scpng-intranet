
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Users,
    Shield,
    Palette,
    Target,
    Activity,
    Globe,
    LayoutDashboard
} from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import RoleManagement from '@/components/admin/RoleManagement';
import ThemeCustomization from '@/components/admin/ThemeCustomization';

import ApiManagement from '@/components/admin/ApiManagement';
import { ViewSettingsTab } from '@/components/admin/ViewSettingsTab';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { UserSharePointService, UserRole, PermissionGroup } from '@/services/userSharePointService';
import { toast } from 'sonner';

const Admin = () => {
    const { hasPermission, isAdmin } = useRoleBasedAuth();
    const [activeTab, setActiveTab] = useState('users');
    const { instance } = useMsal();

    // SharePoint Data State
    const [users, setUsers] = useState<UserRole[]>([]);
    const [groups, setGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize Service
    const getService = async () => {
        const client = await getGraphClient(instance);
        if (!client) throw new Error("Failed to initialize Graph Client");
        return new UserSharePointService(client);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const service = await getService();
            const [fetchedUsers, fetchedGroups] = await Promise.all([
                service.getUsers(),
                service.getGroups()
            ]);
            setUsers(fetchedUsers);
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast.error("Failed to load admin data from SharePoint");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin || hasPermission('admin', 'access')) {
            fetchData();
        }
    }, [isAdmin]);

    // User Handlers
    const handleAddUser = async (user: Partial<UserRole>) => {
        const service = await getService();
        await service.addUser(user);
        await fetchData(); // Refresh list
    };

    const handleUpdateUser = async (email: string, updates: Partial<UserRole>) => {
        const service = await getService();
        await service.updateUser(email, updates);
        await fetchData();
    };

    const handleDeleteUser = async (email: string) => {
        const service = await getService();
        await service.deleteUser(email);
        await fetchData();
    };

    // Group Handlers
    const handleCreateGroup = async (group: PermissionGroup) => {
        const service = await getService();
        await service.createGroup(group);
        await fetchData();
    };

    const handleUpdateGroup = async (group: PermissionGroup) => {
        const service = await getService();
        await service.updateGroup(group);
        await fetchData();
    };

    const handleDeleteGroup = async (groupId: string) => {
        const service = await getService();
        await service.deleteGroup(groupId);
        await fetchData();
    };


    // Simple permission check - in a real app this would be more granular per tab
    if (!isAdmin && !hasPermission('admin', 'access')) {
        return (
            <PageLayout>
                <div className="p-6">
                    <Alert variant="destructive">
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            You do not have permission to access the admin dashboard.
                        </AlertDescription>
                    </Alert>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage users, roles, system settings, and organizational strategy.
                        </p>
                    </div>
                    {/* Refresh Button or Status Indicator could go here */}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
                        <TabsTrigger value="users" className="py-2">
                            <Users className="mr-2 h-4 w-4" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="py-2">
                            <Shield className="mr-2 h-4 w-4" />
                            Roles & Groups
                        </TabsTrigger>
                        <TabsTrigger value="theme" className="py-2">
                            <Palette className="mr-2 h-4 w-4" />
                            Theme
                        </TabsTrigger>

                        <TabsTrigger value="api" className="py-2">
                            <Activity className="mr-2 h-4 w-4" />
                            API & Integrations
                        </TabsTrigger>
                        <TabsTrigger value="view-settings" className="py-2">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            View Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <UserManagement
                            users={users}
                            availableGroups={groups}
                            onAddUser={handleAddUser}
                            onUpdateUser={handleUpdateUser}
                            onDeleteUser={handleDeleteUser}
                            // Password/Email config not supported by SharePoint list directly, optional or unimplemented
                            onGeneratePassword={() => toast.info("Password management is handled via Entra ID/Active Directory")}
                            onConfigureEmail={() => toast.info("Email checks depend on Entra ID")}
                        />
                    </TabsContent>

                    <TabsContent value="roles" className="space-y-4">
                        <RoleManagement
                            groups={groups}
                            onCreateGroup={handleCreateGroup}
                            onUpdateGroup={handleUpdateGroup}
                            onDeleteGroup={handleDeleteGroup}
                        />
                    </TabsContent>

                    <TabsContent value="theme" className="space-y-4">
                        <ThemeCustomization />
                    </TabsContent>



                    <TabsContent value="api" className="space-y-4">
                        <ApiManagement />
                    </TabsContent>

                    <TabsContent value="view-settings" className="space-y-4">
                        <ViewSettingsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
};

export default Admin;
