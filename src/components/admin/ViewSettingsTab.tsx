import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { SharePointOpsService } from '@/services/sharePointOpsService';
import { SharePointListSetupService } from '@/services/sharePointListSetupService';

// Define the configuration types
export type ViewScope = 'All' | 'Division' | 'Unit' | 'Individual';

export interface ViewConfig {
    id: string;
    page: string;
    component: string;
    scope: ViewScope;
    description: string;
}

export const ViewSettingsTab = () => {
    const [configs, setConfigs] = useState<ViewConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const { toast } = useToast();
    const { instance } = useMsal();

    // Helper to get OPS Service
    const getOpsService = async () => {
        const client = await getGraphClient(instance);
        if (!client) throw new Error("Graph Client unavailable");
        const service = new SharePointOpsService(client);
        await service.initialize();
        return service;
    }

    const loadSettings = async () => {
        setLoading(true);
        try {
            const service = await getOpsService();
            const data = await service.getViewSettings();
            setConfigs(data);
        } catch (error) {
            console.error(error);
            // Don't toast error on initial load as list might not exist yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleScopeChange = (id: string, newScope: ViewScope) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, scope: newScope } : c));
    };

    const handleSave = async (id: string, component: string, newScope: string) => {
        try {
            const service = await getOpsService();
            await service.updateViewSetting(component, newScope);
            toast({ title: "Saved", description: `${component} updated to ${newScope}` });
        } catch (e) {
            toast({ title: "Error", description: "Failed to save setting.", variant: "destructive" });
        }
    };

    const handleScopeSelect = (id: string, component: string, newScope: ViewScope) => {
        handleScopeChange(id, newScope); // Update UI immediately
        handleSave(id, component, newScope); // Save to backend
    };

    const handleInitializeList = async () => {
        setInitializing(true);
        try {
            const client = await getGraphClient(instance);
            if (!client) return;
            // Need site ID
            const site = await client.api('/sites/scpng1.sharepoint.com:/sites/scpngintranet').get();
            const setup = new SharePointListSetupService(client, site.id);
            await setup.createViewSettingsList();
            toast({ title: "Success", description: "View Settings list created and populated." });
            loadSettings(); // Reload
        } catch (e: any) {
            toast({ title: "Initialization Failed", description: e.message, variant: "destructive" });
        } finally {
            setInitializing(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>View Settings & Data Filtering</CardTitle>
                        <CardDescription>
                            Configure how data is filtered for users. Define default visibility scopes.
                        </CardDescription>
                    </div>
                    <Button onClick={handleInitializeList} disabled={initializing} variant="outline" size="sm">
                        {initializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                        Initialize Settings List
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : configs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No settings found. Click "Initialize Settings List" to start.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Page</TableHead>
                                    <TableHead>Component</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Visibility Scope</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {configs.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell>{config.page}</TableCell>
                                        <TableCell className="font-medium">{config.component}</TableCell>
                                        <TableCell className="text-muted-foreground">{config.description}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={config.scope}
                                                onValueChange={(val: ViewScope) => handleScopeSelect(config.id, config.component, val)}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select scope" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Data (No Filter)</SelectItem>
                                                    <SelectItem value="Division">My Division Only</SelectItem>
                                                    <SelectItem value="Unit">My Unit Only</SelectItem>
                                                    <SelectItem value="Individual">Assigned to Me Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
