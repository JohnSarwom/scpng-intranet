import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useMsal } from '@azure/msal-react';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { SharePointListSetupService } from '@/services/sharePointListSetupService';
import { getGraphClient } from '@/services/graphService';
import {
    Settings,
    Loader2,
    CheckCircle,
    AlertCircle,
    Check,
    Database,
    Play,
    LayoutDashboard,
    Layers,
    FileText,
    ListChecks,
    Trash2,
    Rocket,
    TestTube,
    Info,
    List
} from "lucide-react";
import { SharePointExplorer } from '@/components/admin/SharePointExplorer';
import { deleteAllPriceHistory } from '@/services/marketDataSharePointService';

const TestGround = () => {
    const { toast } = useToast();
    const { instance: msalInstance } = useMsal();
    const { user: roleUser } = useRoleBasedAuth();
    const [isSettingUpOps, setIsSettingUpOps] = useState(false);
    const [isSettingUpLists, setIsSettingUpLists] = useState(false);
    const [isSettingUpStrategyHub, setIsSettingUpStrategyHub] = useState(false);
    const [setupResult, setSetupResult] = useState<any>(null);

    const handleSetupStrategyLists = async () => {
        setIsSettingUpLists(true);
        setSetupResult(null);

        try {
            // console.log('🚀 [TestGround] Starting SharePoint list setup...');

            toast({
                title: "🚀 Creating SharePoint Lists",
                description: "This may take a minute...",
            });

            // Get Graph client
            // console.log('📡 [TestGround] Getting Graph client...');
            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) {
                throw new Error('Failed to get Graph client');
            }
            // console.log('✅ [TestGround] Graph client obtained');

            // Get site ID
            // console.log('🔍 [TestGround] Getting SharePoint site...');
            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();
            // console.log('✅ [TestGround] Site obtained:', site.id);

            // Create setup service
            // console.log('🛠️ [TestGround] Creating setup service...');
            const setupService = new SharePointListSetupService(graphClient, site.id);

            // Check if lists already exist
            // console.log('🔍 [TestGround] Checking for existing lists...');
            const { exists, lists } = await setupService.checkExistingLists();
            // console.log('📋 [TestGround] Existing lists check:', { exists, lists });

            if (exists) {
                const result = {
                    success: false,
                    message: `Lists already exist: ${lists.join(', ')}`,
                    existingLists: lists
                };
                setSetupResult(result);
                toast({
                    title: "⚠️ Lists Already Exist",
                    description: `Found: ${lists.join(', ')}`,
                    variant: "destructive"
                });
                return;
            }

            // Create all lists
            // console.log('🏗️ [TestGround] Creating all lists...');
            const result = await setupService.createAllLists();
            // console.log('📊 [TestGround] Setup result:', result);
            setSetupResult(result);

            if (result.success) {
                toast({
                    title: "✅ Success!",
                    description: "All Strategy lists created successfully with sample data",
                });
            } else {
                throw new Error(result.message);
            }

        } catch (error: any) {
            console.error('❌ [TestGround] Setup failed:', error);
            const errorResult = {
                success: false,
                message: error.message || "Failed to create SharePoint lists",
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                    code: error.code
                }
            };
            setSetupResult(errorResult);
            toast({
                title: "❌ Setup Failed",
                description: error.message || "Failed to create SharePoint lists",
                variant: "destructive"
            });
        } finally {
            setIsSettingUpLists(false);
        }
    };

    const handleSetupStrategyHubEngine = async () => {
        setIsSettingUpStrategyHub(true);
        setSetupResult(null);

        try {
            toast({
                title: "🚀 Deploying Strategy Engine",
                description: "Creating all lists and seeding SCPNG mock data...",
            });

            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();

            const setupService = new SharePointListSetupService(graphClient, site.id);
            const result = await setupService.setupStrategyHubEngine();
            setSetupResult(result);

            if (result.success) {
                toast({
                    title: "✅ Engine Deployed!",
                    description: "Strategy, Analytics & Reports are now live with real data.",
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('❌ Strategy Hub Setup failed:', error);
            setSetupResult({ success: false, message: error.message, error });
            toast({
                title: "❌ Deployment Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSettingUpStrategyHub(false);
        }
    };

    const handleSetupOperationsLists = async () => {
        setIsSettingUpOps(true);
        setSetupResult(null);

        try {
            // console.log('🚀 [TestGround] Starting Operations list setup...');

            toast({
                title: "🚀 Creating Operations Lists",
                description: "This may take a minute...",
            });

            // Get Graph client
            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            // Get site ID
            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();

            // Create setup service
            const setupService = new SharePointListSetupService(graphClient, site.id);

            // Create ONLY Operations lists (KRAs, KPIs, Projects, Tasks, Risks)
            // console.log('🏗️ [TestGround] Creating Operations lists only...');
            const result = await setupService.createOperationsLists();
            setSetupResult(result);

            if (result.success) {
                toast({
                    title: "✅ Success!",
                    description: "All Operations lists created successfully with sample data",
                });
            } else {
                throw new Error(result.message);
            }

        } catch (error: any) {
            console.error('❌ [TestGround] Setup failed:', error);
            setSetupResult({
                success: false,
                message: error.message || "Failed to create Operations lists",
                error
            });
            toast({
                title: "❌ Setup Failed",
                description: error.message || "Failed to create Operations lists",
                variant: "destructive"
            });
        } finally {
            setIsSettingUpOps(false);
        }
    };

    const [isSettingUpMarket, setIsSettingUpMarket] = useState(false);
    const [isSettingUpDocs, setIsSettingUpDocs] = useState(false);
    const [isDeletingHistory, setIsDeletingHistory] = useState(false);

    const [isSettingUpAppSettings, setIsSettingUpAppSettings] = useState(false);

    const handleSetupAppSettings = async () => {
        setIsSettingUpAppSettings(true);
        setSetupResult(null);

        try {
            toast({
                title: "🚀 Creating App Settings List",
                description: "This may take a moment...",
            });

            // Get Graph client
            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            // Get site ID
            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();

            // Create setup service
            const setupService = new SharePointListSetupService(graphClient, site.id);

            // Create List
            const result = await setupService.createInternalAppSettingsList();
            setSetupResult(result);

            if (result.success) {
                toast({
                    title: "✅ Success!",
                    description: result.message,
                });
            } else {
                throw new Error(result.message);
            }

        } catch (error: any) {
            console.error('❌ [TestGround] Setup failed:', error);
            setSetupResult({
                success: false,
                message: error.message || "Failed to create App Settings list",
                error
            });
            toast({
                title: "❌ Setup Failed",
                description: error.message || "Failed to create App Settings list",
                variant: "destructive"
            });
        } finally {
            setIsSettingUpAppSettings(false);
        }
    };

    const handleSetupMarketLists = async () => {
        setIsSettingUpMarket(true);
        setSetupResult(null);

        try {
            // console.log('🚀 [TestGround] Starting Market Data list setup...');

            toast({
                title: "🚀 Creating Market Data Lists",
                description: "This may take a minute...",
            });

            // Get Graph client
            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            // Get site ID
            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();

            // Create setup service
            const setupService = new SharePointListSetupService(graphClient, site.id);

            // Create Lists
            const result = await setupService.createMarketDataLists();
            setSetupResult(result);

            if (result.success) {
                toast({
                    title: "✅ Success!",
                    description: "All Market Data lists created successfully",
                });
            } else {
                throw new Error(result.message);
            }

        } catch (error: any) {
            console.error('❌ [TestGround] Setup failed:', error);
            setSetupResult({
                success: false,
                message: error.message || "Failed to create Market Data lists",
                error
            });
            toast({
                title: "❌ Setup Failed",
                description: error.message || "Failed to create Market Data lists",
                variant: "destructive"
            });
        } finally {
            setIsSettingUpMarket(false);
        }
    };

    const [isSeedingMarket, setIsSeedingMarket] = useState(false);

    const handleSeedMarketData = async () => {
        setIsSeedingMarket(true);
        setSetupResult(null);

        try {
            toast({ title: "🌱 Seeding Market Data", description: "Generating companies and history... This may take a few minutes." });

            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            const site = await graphClient.api('/sites/scpng1.sharepoint.com:/sites/scpngintranet').get();
            const setupService = new SharePointListSetupService(graphClient, site.id);

            const result = await setupService.seedMarketData();

            if (result.success) {
                toast({ title: "✅ Seeding Complete", description: result.message });
                setSetupResult({ success: true, message: result.message, details: null });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('Seeding failed', error);
            toast({ title: "❌ Seeding Failed", description: error.message, variant: "destructive" });
            setSetupResult({ success: false, message: error.message, error });
        } finally {
            setIsSeedingMarket(false);
        }
    };

    const handleSetupDocs = async () => {
        setIsSettingUpDocs(true);
        setSetupResult(null);

        try {
            // Get Graph client
            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            // Get site ID
            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();

            const setupService = new SharePointListSetupService(graphClient, site.id);

            const result = await setupService.createSharedDocsSetup();
            setSetupResult(result);

            if (result.success) {
                toast({
                    title: "✅ Success!",
                    description: "Organizational Documents setup completed",
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('Setup failed:', error);
            setSetupResult({
                success: false,
                message: error.message,
                details: error
            });
            toast({
                title: "❌ Setup Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSettingUpDocs(false);
        }
    };

    const handleDeleteDocs = async () => {
        if (!confirm('Are you sure you want to delete the Organizational Documents library? This cannot be undone!')) {
            return;
        }

        setIsSettingUpDocs(true);
        try {
            const graphClient = await getGraphClient(msalInstance);
            if (!graphClient) throw new Error('Failed to get Graph client');

            const site = await graphClient
                .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                .get();

            const setupService = new SharePointListSetupService(graphClient, site.id);

            const result = await setupService.deleteSharedDocsSetup();

            if (result.success) {
                toast({
                    title: "🗑️ Deleted",
                    description: "Organizational Documents library deleted",
                });
                setSetupResult({ success: true, message: result.message });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: "❌ Delete Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSettingUpDocs(false);
        }
    };

    return (
        <PageLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <TestTube className="h-8 w-8 text-intranet-primary" />
                            Test Ground
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Admin testing area for SharePoint list creation and other experimental features
                        </p>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        Admin Only
                    </Badge>
                </div>

                <Separator />

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Current User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Email:</span>
                                <p className="text-muted-foreground">{roleUser?.user_email || 'Not loaded'}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Role:</span>
                                <p className="text-muted-foreground">{roleUser?.role_name || 'Not loaded'}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Division:</span>
                                <p className="text-muted-foreground">{roleUser?.division_name || 'Not assigned'}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Is Admin:</span>
                                <p className="text-muted-foreground">
                                    {roleUser?.is_admin ? (
                                        <Badge variant="default">Yes</Badge>
                                    ) : (
                                        <Badge variant="secondary">No</Badge>
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enterprise Strategy Hub Setup Card (NEW) */}
                <Card className="border-2 border-intranet-primary shadow-lg bg-gradient-to-br from-white to-intranet-primary/5 dark:from-gray-900 dark:to-intranet-primary/10">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2 text-intranet-primary text-bold">
                                    <Rocket className="h-6 w-6" />
                                    Enterprise Strategy Hub Backend Setup
                                </CardTitle>
                                <CardDescription className="text-base font-medium mt-1">
                                    Deploy the complete design schema for Strategy, Analytics, and Reports.
                                </CardDescription>
                            </div>
                            <Badge className="bg-intranet-primary text-white">Recommended</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Comprehensive Data Setup
                                </h3>
                                <ul className="grid grid-cols-1 gap-2 text-sm font-medium">
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategy Config (Mission/Vision)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategic Pillars (4 Pillars)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategic Objectives (Full Cards)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Divisional Alignment (Cascade)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Roadmap Milestones (Analytics)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategy Risks (Reports)</li>
                                </ul>
                            </div>

                            <div className="bg-intranet-primary/5 rounded-2xl p-6 border border-intranet-primary/10 flex flex-col justify-center">
                                <div className="space-y-4">
                                    <Button
                                        onClick={handleSetupStrategyHubEngine}
                                        disabled={isSettingUpStrategyHub}
                                        size="lg"
                                        className="w-full bg-intranet-primary hover:bg-intranet-primary-dark shadow-md py-6 text-lg font-bold"
                                    >
                                        {isSettingUpStrategyHub ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                                Deploying Engine...
                                            </>
                                        ) : (
                                            <>
                                                <Settings className="h-6 w-6 mr-2" />
                                                Deploy Strategy Engine
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            if (!confirm('RESET: This will delete all Strategy Hub lists. Data will be lost! Proceed?')) return;
                                            setIsSettingUpStrategyHub(true);
                                            try {
                                                const graphClient = await getGraphClient(msalInstance);
                                                const site = await graphClient.api('/sites/scpng1.sharepoint.com:/sites/scpngintranet').get();
                                                const setupService = new SharePointListSetupService(graphClient, site.id);
                                                const res = await setupService.deleteStrategyHubEngine();
                                                if (res.success) toast({ title: "🗑️ Cleaned Up", description: "Strategy Hub Engine lists removed." });
                                            } finally {
                                                setIsSettingUpStrategyHub(false);
                                            }
                                        }}
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Reset Strategy Engine
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SharePoint List Setup Card */}
                <Card className="border-2 border-intranet-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-intranet-primary" />
                            SharePoint Strategy Lists Setup
                        </CardTitle>
                        <CardDescription>
                            Create required lists for Strategy System (Mission, Pillars, Objectives)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* What Gets Created */}
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Lists to be Created:
                            </h3>
                            <div className="grid gap-2 ml-6">
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-intranet-primary" />
                                    <div>
                                        <p className="font-medium">Strategy_Config</p>
                                        <p className="text-sm text-muted-foreground">Mission, Vision, Values</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-intranet-primary" />
                                    <div>
                                        <p className="font-medium">Strategic_Pillars</p>
                                        <p className="text-sm text-muted-foreground">Top-level strategic pillars</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-intranet-primary" />
                                    <div>
                                        <p className="font-medium">Strategic_Objectives</p>
                                        <p className="text-sm text-muted-foreground">Org Objectives and Division Objectives with relationships</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Setup Button */}
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleSetupStrategyLists}
                                disabled={isSettingUpLists || isSettingUpOps}
                                size="lg"
                                className="w-full gap-2"
                            >
                                {isSettingUpLists ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Strategy Lists...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="h-5 w-5" />
                                        Create Strategy Lists
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to delete all Strategy lists? This cannot be undone.')) return;

                                    setIsSettingUpLists(true);
                                    try {
                                        const graphClient = await getGraphClient(msalInstance);
                                        if (!graphClient) throw new Error('Failed to get Graph client');

                                        const site = await graphClient
                                            .api('/sites/scpng1.sharepoint.com:/sites/scpngintranet')
                                            .get();

                                        const setupService = new SharePointListSetupService(graphClient, site.id);
                                        const result = await setupService.deleteStrategyLists();

                                        if (result.success) {
                                            toast({ title: "✅ Lists Deleted", description: "You can now run the setup again." });
                                            setSetupResult(null); // Clear previous results
                                        } else {
                                            throw new Error(result.message);
                                        }
                                    } catch (error: any) {
                                        toast({
                                            title: "❌ Delete Failed",
                                            description: error.message,
                                            variant: "destructive"
                                        });
                                    } finally {
                                        setIsSettingUpLists(false);
                                    }
                                }}
                                disabled={isSettingUpLists || isSettingUpOps}
                                variant="destructive"
                                size="lg"
                                className="w-full gap-2"
                            >
                                <AlertCircle className="h-5 w-5" />
                                Reset / Delete Strategy Lists
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Operations Lists Setup Card */}
                <Card className="border-2 border-emerald-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            SharePoint Operations Lists Setup
                        </CardTitle>
                        <CardDescription>
                            Create operational lists (KRAs, KPIs, Projects, Tasks) with mock data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* What Gets Created */}
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Lists to be Created:
                            </h3>
                            <div className="grid gap-2 ml-6">
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <div>
                                        <p className="font-medium">Performance_KRAs</p>
                                        <p className="text-sm text-muted-foreground">Linked to Strategic Goals</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <div>
                                        <p className="font-medium">Performance_KPIs</p>
                                        <p className="text-sm text-muted-foreground">Linked to KRAs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <div>
                                        <p className="font-medium">Operations_Projects</p>
                                        <p className="text-sm text-muted-foreground">Linked to KRAs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <div>
                                        <p className="font-medium">Operations_Tasks</p>
                                        <p className="text-sm text-muted-foreground">Daily operations linked to Projects/KRAs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <List className="h-4 w-4 mt-0.5 text-emerald-600" />
                                    <div>
                                        <p className="font-medium">Operations_Risks</p>
                                        <p className="text-sm text-muted-foreground">Risks linked to Projects/KRAs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Setup Button */}
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleSetupOperationsLists}
                                disabled={isSettingUpLists || isSettingUpOps}
                                size="lg"
                                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isSettingUpOps ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Operations Lists...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="h-5 w-5" />
                                        Create Operations Lists
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to delete all Operations lists?')) return;

                                    setIsSettingUpOps(true);
                                    try {
                                        const graphClient = await getGraphClient(msalInstance);
                                        if (!graphClient) throw new Error('Failed to get Graph client');
                                        const site = await graphClient.api('/sites/scpng1.sharepoint.com:/sites/scpngintranet').get();
                                        const setupService = new SharePointListSetupService(graphClient, site.id);
                                        const result = await setupService.deleteOperationsLists();

                                        if (result.success) {
                                            toast({ title: "✅ Lists Deleted", description: "Operations lists removed." });
                                            setSetupResult(null);
                                        } else {
                                            throw new Error(result.message);
                                        }
                                    } catch (error: any) {
                                        toast({ title: "❌ Delete Failed", description: error.message, variant: "destructive" });
                                    } finally {
                                        setIsSettingUpOps(false);
                                    }
                                }}
                                disabled={isSettingUpLists || isSettingUpOps}
                                variant="outline"
                                size="lg"
                                className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <AlertCircle className="h-5 w-5" />
                                Reset / Delete Operations Lists
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Market Data Lists Setup Card */}
                {/* App Settings List Setup Card */}
                <Card className="border-2 border-slate-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-600" />
                            App Configuration Setup
                        </CardTitle>
                        <CardDescription>
                            Create 'InternalAppSettings' list for storing API keys and global config
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <ListChecks className="h-4 w-4" />
                                Lists to be Created:
                            </h4>
                            <ul className="space-y-2 ml-6 text-sm">
                                <li key="appsettings">
                                    <div className="font-medium flex items-center gap-2">
                                        <Database className="h-3 w-3 text-slate-500" />
                                        InternalAppSettings
                                    </div>
                                    <div className="text-muted-foreground ml-5">
                                        Stores configuration key-value pairs (e.g. GeminiAPIKey)
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleSetupAppSettings}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket || isSettingUpDocs || isSettingUpAppSettings}
                                size="lg"
                                className="w-full bg-slate-600 hover:bg-slate-700"
                            >
                                {isSettingUpAppSettings ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Creating settings list...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="h-5 w-5 mr-2" />
                                        Deploy App Settings List
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Shared Documents Setup Card */}
                <Card className="border-2 border-purple-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            SharePoint Shared Documents Setup
                        </CardTitle>
                        <CardDescription>
                            Create document library for Organizational Shared Documents
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <ListChecks className="h-4 w-4" />
                                Lists to be Created:
                            </h4>
                            <ul className="space-y-2 ml-6 text-sm">
                                <li key="docs">
                                    <div className="font-medium flex items-center gap-2">
                                        <Database className="h-3 w-3 text-purple-500" />
                                        Organizational_Documents
                                    </div>
                                    <div className="text-muted-foreground ml-5">
                                        Library for company-wide shared documents with metadata
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleSetupDocs}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket || isSettingUpDocs}
                                size="lg"
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                {isSettingUpDocs ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Setting up Documents...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Create Documents Library
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleDeleteDocs}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket || isSettingUpDocs}
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Documents Library
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            SharePoint Market Data Setup
                        </CardTitle>
                        <CardDescription>
                            Create lists for Market Data (Companies, Price History, Settings)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* What Gets Created */}
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <List className="h-4 w-4" />
                                Lists to be Created:
                            </h3>
                            <div className="grid gap-2 ml-6">
                                <div className="flex items-start gap-2">
                                    <Database className="h-4 w-4 mt-0.5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Market_Companies</p>
                                        <p className="text-sm text-muted-foreground">Company profiles and current data</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Database className="h-4 w-4 mt-0.5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Market_PriceHistory</p>
                                        <p className="text-sm text-muted-foreground">Historical price data linked to companies</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Database className="h-4 w-4 mt-0.5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Market_Settings</p>
                                        <p className="text-sm text-muted-foreground">Configuration settings for the dashboard</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Setup Button */}
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleSetupMarketLists}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket}
                                size="lg"
                                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                {isSettingUpMarket ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Market Lists...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="h-5 w-5" />
                                        Create Market Lists
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleSeedMarketData}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket || isSeedingMarket}
                                size="lg"
                                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                            >
                                {isSeedingMarket ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Seeding Data...
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-5 w-5" />
                                        Seed Market Data
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to delete all Market Data lists?')) return;

                                    setIsSettingUpMarket(true);
                                    try {
                                        const graphClient = await getGraphClient(msalInstance);
                                        if (!graphClient) throw new Error('Failed to get Graph client');
                                        const site = await graphClient.api('/sites/scpng1.sharepoint.com:/sites/scpngintranet').get();
                                        const setupService = new SharePointListSetupService(graphClient, site.id);
                                        const result = await setupService.deleteMarketDataLists();

                                        if (result.success) {
                                            toast({ title: "✅ Lists Deleted", description: "Market Data lists removed." });
                                            setSetupResult(null);
                                        } else {
                                            throw new Error(result.message);
                                        }
                                    } catch (error: any) {
                                        toast({ title: "❌ Delete Failed", description: error.message, variant: "destructive" });
                                    } finally {
                                        setIsSettingUpMarket(false);
                                    }
                                }}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket}
                                variant="outline"
                                size="lg"
                                className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <AlertCircle className="h-5 w-5" />
                                Reset / Delete Market Lists
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to CLEAR ALL Price History? This will delete all rows in Market_PriceHistory.')) return;

                                    setIsDeletingHistory(true);
                                    try {
                                        toast({ title: "🗑️ Clearing History", description: "Deleting all price history items..." });
                                        await deleteAllPriceHistory();
                                        toast({ title: "✅ History Cleared", description: "All price history items have been deleted." });
                                    } catch (error: any) {
                                        console.error('Delete history failed', error);
                                        toast({ title: "❌ Delete Failed", description: error.message, variant: "destructive" });
                                    } finally {
                                        setIsDeletingHistory(false);
                                    }
                                }}
                                disabled={isSettingUpLists || isSettingUpOps || isSettingUpMarket || isDeletingHistory}
                                variant="destructive"
                                size="lg"
                                className="w-full gap-2"
                            >
                                {isDeletingHistory ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Clearing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-5 w-5" />
                                        Clear Price History Only
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Result Display */}
                {setupResult && (
                    <Card className={setupResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {setupResult.success ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Success!
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        Failed
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{setupResult.message}</p>
                            {setupResult.details && (
                                <details className="mt-2">
                                    <summary className="text-xs font-semibold cursor-pointer">View Details</summary>
                                    <pre className="text-xs mt-2 p-2 bg-black/10 dark:bg-white/10 rounded overflow-auto max-h-40">
                                        {JSON.stringify(setupResult.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Instructions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Ensure <strong>Strategy Lists</strong> are created first (Step 1).</li>
                            <li>Click "Create Operations Lists" (Step 2).</li>
                            <li>Wait for the process to complete.</li>
                            <li>Check "Site Contents" in SharePoint to verify all lists.</li>
                        </ol>
                    </CardContent>
                </Card>

                <Separator className="my-8" />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Database className="h-6 w-6 text-intranet-primary" />
                            SharePoint Explorer
                        </h2>
                        <Badge variant="outline">Preview Feature</Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Directly manage SharePoint lists, columns, and data from this interface.
                    </p>
                    <SharePointExplorer />
                </div>
            </div>
        </PageLayout>
    );
};

export default TestGround;
