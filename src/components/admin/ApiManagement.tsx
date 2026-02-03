
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Play, CheckCircle, XCircle, Loader2, ExternalLink, Edit, Save, Activity, Key, Globe } from 'lucide-react';
import { useMsal } from "@azure/msal-react";
import { getGraphClient } from "@/services/graphService";
import { AssetsSharePointService } from "@/services/assetsSharePointService";
import { HRSharePointService } from "@/services/hrSharePointService";
import { PaymentsSharePointService } from "@/services/paymentsSharePointService";
import { UserSharePointService } from "@/services/userSharePointService";
import { fetchStaffMembers } from "@/services/staffService";
import { getCompanies } from "@/services/marketDataSharePointService";
import { supabase, logger, GLOBAL_SETTINGS_ID } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

interface ApiDefinition {
    id: string;
    name: string;
    url: string;
    method: string;
    type: 'Internal' | 'External' | 'SharePoint' | 'Supabase';
    description: string;
    usedIn: string;
}



const INITIAL_APIS: ApiDefinition[] = [
    {
        id: 'graph_assets',
        name: 'Assets Service',
        url: 'https://graph.microsoft.com/v1.0/sites/scpng1.sharepoint.com:/sites/scpngintranet',
        method: 'GET',
        type: 'SharePoint',
        description: 'Manages IT assets in SharePoint list',
        usedIn: 'src/services/assetsSharePointService.ts'
    },
    {
        id: 'graph_hr',
        name: 'HR Service',
        url: 'https://graph.microsoft.com/v1.0/sites/scpng1.sharepoint.com:/sites/scpngintranet',
        method: 'GET',
        type: 'SharePoint',
        description: 'Manages employee profiles and leave requests',
        usedIn: 'src/services/hrSharePointService.ts'
    },
    {
        id: 'graph_payments',
        name: 'Payments Service',
        url: 'https://graph.microsoft.com/v1.0/sites/scpng1.sharepoint.com:/sites/scpngintranet',
        method: 'GET',
        type: 'SharePoint',
        description: 'Manages payment records and approvals',
        usedIn: 'src/services/paymentsSharePointService.ts'
    },
    {
        id: 'graph_users',
        name: 'User Management',
        url: 'https://graph.microsoft.com/v1.0/sites/scpng1.sharepoint.com:/sites/scpngintranet',
        method: 'GET',
        type: 'SharePoint',
        description: 'Manages user roles and permissions',
        usedIn: 'src/services/userSharePointService.ts'
    },
    {
        id: 'graph_market',
        name: 'Market Data Service',
        url: 'https://graph.microsoft.com/v1.0/sites/scpng1.sharepoint.com:/sites/scpngintranet',
        method: 'GET',
        type: 'SharePoint',
        description: 'Manages market companies and price history',
        usedIn: 'src/services/marketDataSharePointService.ts'
    },
    {
        id: 'supabase_staff',
        name: 'Staff Directory',
        url: 'Supabase Database',
        method: 'SELECT',
        type: 'Supabase',
        description: 'Fetches staff members from Supabase',
        usedIn: 'src/services/staffService.ts'
    },
];

const ApiManagement = () => {
    const { instance } = useMsal();
    const { user } = useSupabaseAuth();

    // Internal/System APIs
    const [apis, setApis] = useState<ApiDefinition[]>(INITIAL_APIS);
    const [statuses, setStatuses] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
    const [messages, setMessages] = useState<Record<string, string>>({});

    // Global Config State (Persisted in Supabase)
    const [apiKey, setApiKey] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [tickerUrl, setTickerUrl] = useState('https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'); // Default
    const [prompts, setPrompts] = useState<any>({});

    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingGenAI, setIsTestingGenAI] = useState(false);

    // Editing State for System APIs
    const [editingApi, setEditingApi] = useState<ApiDefinition | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadSettings = async () => {
            setIsConfigLoading(true);
            try {
                const { data, error } = await supabase
                    .from('news_api_settings')
                    .select('*')
                    .eq('id', GLOBAL_SETTINGS_ID)
                    .single();

                if (data) {
                    setApiKey(data.api_key || '');
                    setApiEndpoint(data.api_endpoint || '');
                    setPrompts(data.prompts || {});
                    if (data.prompts?.system_ticker_url) {
                        setTickerUrl(data.prompts.system_ticker_url);
                    }
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setIsConfigLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSaveConfig = async () => {
        setIsSaving(true);
        // Prepare prompts object with ticker url integrated
        const updatedPrompts = {
            ...prompts,
            system_ticker_url: tickerUrl
        };

        const settingsData = {
            id: GLOBAL_SETTINGS_ID,
            api_key: apiKey,
            api_endpoint: apiEndpoint,
            prompts: updatedPrompts,
            updated_at: new Date().toISOString(),
            last_updated_by: user?.id
        };

        try {
            const { error } = await supabase.from('news_api_settings').upsert(settingsData, { onConflict: 'id' });
            if (error) throw error;
            toast.success("Global configurations saved successfully");
            setPrompts(updatedPrompts);
        } catch (error: any) {
            toast.error(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestGenAI = async () => {
        setIsTestingGenAI(true);
        try {
            if (!apiEndpoint || !apiKey) throw new Error("Missing Key or Endpoint");
            const fullEndpoint = `${apiEndpoint}?key=${apiKey}`;
            const testBody = {
                contents: [{ parts: [{ text: "Respond with 'Connection OK'" }] }]
            };
            const res = await fetch(fullEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testBody)
            });
            if (!res.ok) throw new Error("API call failed");
            const data = await res.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                toast.success(`Success: ${data.candidates[0].content.parts[0].text}`);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error: any) {
            toast.error(`Test failed: ${error.message}`);
        } finally {
            setIsTestingGenAI(false);
        }
    };

    // System Status Helpers
    const updateStatus = (id: string, status: 'idle' | 'loading' | 'success' | 'error', message?: string) => {
        setStatuses(prev => ({ ...prev, [id]: status }));
        if (message) {
            setMessages(prev => ({ ...prev, [id]: message }));
        }
    };

    const handleEditClick = (api: ApiDefinition) => {
        setEditingApi({ ...api });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingApi) {
            setApis(prev => prev.map(api => api.id === editingApi.id ? editingApi : api));
            setIsEditDialogOpen(false);
            setEditingApi(null);
            toast.success("API definition updated (Local only)");
        }
    };

    const testApi = async (api: ApiDefinition) => {
        updateStatus(api.id, 'loading');
        try {
            switch (api.id) {
                // ... same test logic as before ...
                case 'graph_assets': {
                    const client = await getGraphClient(instance);
                    if (!client) throw new Error("Failed to initialize Graph Client");
                    const service = new AssetsSharePointService(client);
                    await service.initialize();
                    updateStatus(api.id, 'success', 'Connected to Assets');
                    break;
                }
                case 'graph_hr': {
                    const client = await getGraphClient(instance);
                    const service = new HRSharePointService(client!);
                    await service.initialize();
                    updateStatus(api.id, 'success', 'Connected to HR');
                    break;
                }
                case 'graph_payments': {
                    const client = await getGraphClient(instance);
                    const service = new PaymentsSharePointService(client!);
                    await service.initialize();
                    updateStatus(api.id, 'success', 'Connected to Payments');
                    break;
                }
                case 'graph_users': {
                    const client = await getGraphClient(instance);
                    const service = new UserSharePointService(client!);
                    await service.initialize();
                    updateStatus(api.id, 'success', 'Connected to User Roles');
                    break;
                }
                case 'graph_market': {
                    const data = await getCompanies();
                    if (data) updateStatus(api.id, 'success', `Fetched ${data.length} companies`);
                    break;
                }
                case 'supabase_staff': {
                    const data = await fetchStaffMembers();
                    if (data) updateStatus(api.id, 'success', `Fetched ${data.length} staff`);
                    break;
                }
                default:
                    // Basic fetch for others
                    if (api.url.startsWith('http')) {
                        await fetch(api.url, { mode: 'no-cors' });
                        updateStatus(api.id, 'success', 'Endpoint Reachable');
                    } else {
                        updateStatus(api.id, 'error', 'No test defined');
                    }
            }
        } catch (error: any) {
            updateStatus(api.id, 'error', error.message || 'Failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">API & Integrations</h2>
                    <p className="text-muted-foreground">Manage external API keys, integration links, and monitor system health.</p>
                </div>
                <Button onClick={handleSaveConfig} disabled={isSaving || isConfigLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Configurations
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Generative AI Configuration
                        </CardTitle>
                        <CardDescription>Configure the AI service used for Chat and News summarization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Provider Info</Label>
                            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded border text-xs font-mono text-muted-foreground">
                                Current Provider: Google Gemini
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_endpoint">API Endpoint</Label>
                            <Input
                                id="api_endpoint"
                                value={apiEndpoint}
                                onChange={e => setApiEndpoint(e.target.value)}
                                placeholder="https://generativelanguage.googleapis.com..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_key">API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="api_key"
                                    type="password"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="Enter API Key"
                                />
                                <Button variant="outline" onClick={handleTestGenAI} disabled={isTestingGenAI}>
                                    {isTestingGenAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* External Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            External Widgets & Links
                        </CardTitle>
                        <CardDescription>Manage URLs for external integrations like the Ticker Tape.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticker_url">TradingView Ticker Embed URL</Label>
                            <Textarea
                                id="ticker_url"
                                value={tickerUrl}
                                onChange={e => setTickerUrl(e.target.value)}
                                placeholder="https://s3.tradingview.com/..."
                                className="min-h-[80px] font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                                Verify this URL matches the widget requirements. Changes reflect on the Home/Market pages.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Health Monitor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        System Health Monitor
                    </CardTitle>
                    <CardDescription>
                        Monitor connection statuses for SharePoint lists and internal services.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="hidden md:table-cell">Endpoint</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apis.map((api) => (
                                <TableRow key={api.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{api.name}</span>
                                            <span className="text-xs text-muted-foreground md:hidden">{api.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{api.type}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px] block" title={api.url}>
                                            {api.url}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {statuses[api.id] === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                            {statuses[api.id] === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                            {statuses[api.id] === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                                            {(!statuses[api.id] || statuses[api.id] === 'idle') && <span className="text-muted-foreground">-</span>}
                                            {messages[api.id] && status[api.id] === 'error' && (
                                                <span className="text-xs text-red-500 truncate max-w-[100px]" title={messages[api.id]}>
                                                    {messages[api.id]}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => testApi(api)} disabled={statuses[api.id] === 'loading'}>
                                            Test
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApiManagement;
