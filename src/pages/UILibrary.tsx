import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal, Waves, Loader2, CheckCircle2, AlertCircle, Info, Bell, Palette, Layout, Type, MousePointer2, Database, Lock, TrendingUp, Zap, Shield, Users, Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import DonutChart from '@/components/organization/DonutChart';

const UILibrary = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const toggleLoading = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Header */}
            <div className="flex-none p-8 border-b bg-card/50 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Palette className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">UI Design System</h1>
                        <p className="text-muted-foreground mt-1">
                            Comprehensive library of components, styles, and interactions for the intranet.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                <Tabs defaultValue="typography" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-7 lg:w-[1000px] bg-muted/50 p-1">
                        <TabsTrigger value="typography" className="space-x-2">
                            <Type className="w-4 h-4" />
                            <span>Typography</span>
                        </TabsTrigger>
                        <TabsTrigger value="inputs" className="space-x-2">
                            <MousePointer2 className="w-4 h-4" />
                            <span>Inputs</span>
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="space-x-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Feedback</span>
                        </TabsTrigger>
                        <TabsTrigger value="layout" className="space-x-2">
                            <Layout className="w-4 h-4" />
                            <span>Layout</span>
                        </TabsTrigger>
                        <TabsTrigger value="data" className="space-x-2">
                            <Database className="w-4 h-4" />
                            <span>Data</span>
                        </TabsTrigger>
                        <TabsTrigger value="patterns" className="space-x-2">
                            <Lock className="w-4 h-4" />
                            <span>Patterns</span>
                        </TabsTrigger>
                        <TabsTrigger value="animation" className="space-x-2">
                            <Waves className="w-4 h-4" />
                            <span>Animation</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Typography & Colors */}
                    <TabsContent value="typography" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Typography Scale</CardTitle>
                                    <CardDescription>Headings and body text hierarchies</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-1">
                                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Heading 1</h1>
                                        <p className="text-xs text-muted-foreground">Extrabold 48px/3rem</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-semibold tracking-tight">Heading 2</h2>
                                        <p className="text-xs text-muted-foreground">Semibold 30px/1.875rem</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
                                        <p className="text-xs text-muted-foreground">Semibold 24px/1.5rem</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-semibold tracking-tight">Heading 4</h4>
                                        <p className="text-xs text-muted-foreground">Semibold 20px/1.25rem</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                                            The quick brown fox jumps over the lazy dog. This is a standard paragraph element with optimized line height for readability.
                                        </p>
                                        <p className="text-xs text-muted-foreground">Body Regular 16px/1rem</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            This is muted text, used for secondary information or descriptions.
                                        </p>
                                        <p className="text-xs text-muted-foreground">Small Muted 14px/0.875rem</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Color Palette</CardTitle>
                                    <CardDescription>Primary, secondary, and functional colors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Brand Colors</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-primary shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Primary</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-secondary shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Secondary</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-accent shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Accent</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">System Colors</h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-destructive shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Destructive</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-muted shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Muted</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-card border shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Card</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-12 w-full rounded-lg bg-popover border shadow-sm" />
                                                    <p className="text-xs font-medium text-center">Popover</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Buttons & Inputs */}
                    <TabsContent value="inputs" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Buttons</CardTitle>
                                    <CardDescription>Button variants, sizes, and states</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest">Variants</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <Button>Default</Button>
                                            <Button variant="secondary">Secondary</Button>
                                            <Button variant="outline">Outline</Button>
                                            <Button variant="ghost">Ghost</Button>
                                            <Button variant="destructive">Destructive</Button>
                                            <Button variant="link">Link</Button>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest">Sizes</Label>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <Button size="lg">Large</Button>
                                            <Button>Default</Button>
                                            <Button size="sm">Small</Button>
                                            <Button size="icon"><Bell className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest">States</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <Button disabled>Disabled</Button>
                                            <Button onClick={toggleLoading}>
                                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
                                                Loading / Icon
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Inputs</CardTitle>
                                    <CardDescription>Input fields, toggles, and sliders</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">Text Input</Label>
                                        <Label htmlFor="email">Email address</Label>
                                        <Input type="email" id="email" placeholder="name@example.com" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">Switch</Label>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="airplane-mode" />
                                                <Label htmlFor="airplane-mode">Airplane Mode</Label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">Slider</Label>
                                            <div className="space-y-1">
                                                <Label>Volume</Label>
                                                <Slider defaultValue={[33]} max={100} step={1} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Feedback */}
                    <TabsContent value="feedback" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alerts & Badges</CardTitle>
                                    <CardDescription>Status indicators and messages</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest">Alerts</Label>
                                        <div className="space-y-4">
                                            <Alert>
                                                <Terminal className="h-4 w-4" />
                                                <AlertTitle>Heads up!</AlertTitle>
                                                <AlertDescription>
                                                    You can add components to your app using the cli.
                                                </AlertDescription>
                                            </Alert>
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>
                                                    Your session has expired. Please log in again.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest">Badges</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <Badge>Default</Badge>
                                            <Badge variant="secondary">Secondary</Badge>
                                            <Badge variant="outline">Outline</Badge>
                                            <Badge variant="destructive">Destructive</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Toast Notifications</CardTitle>
                                    <CardDescription>Temporary notifications</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">Success Toast</Label>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    toast({
                                                        title: "Scheduled: Catch up",
                                                        description: "Friday, February 10, 2023 at 5:57 PM",
                                                    });
                                                }}
                                            >
                                                Show Toast
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">Destructive Toast</Label>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    toast({
                                                        variant: "destructive",
                                                        title: "Uh oh! Something went wrong.",
                                                        description: "There was a problem with your request.",
                                                    });
                                                }}
                                            >
                                                Show Error Toast
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Layout & Cards */}
                    <TabsContent value="layout" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Feature Cards</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="h-full bg-card/80 backdrop-blur border-b-4 border-b-primary/20 hover:border-primary transition-all duration-300">
                                    <CardContent className="pt-6 pb-4 flex flex-col items-center gap-3 text-center">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-primary">Feature Title</h3>
                                            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed italic">"A brief description of the feature or value proposition goes here."</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Separator />

                        {/* Dashboard Widgets */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Dashboard Widgets</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status List */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            <Users className="w-4 h-4" />
                                            List Group
                                        </div>
                                        <CardTitle className="text-base text-gray-900 dark:text-gray-100">Status List</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {[
                                            { name: "Item Item 1", status: "High Priority", load: "Category A" },
                                            { name: "List Item 2", status: "In Progress", load: "Category B" },
                                            { name: "List Item 3", status: "Active", load: "Category C" },
                                            { name: "List Item 4", status: "Pending", load: "Category D" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <div>
                                                    <div className="text-xs font-bold">{item.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">Type: {item.load}</div>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] bg-white dark:bg-gray-900 border-primary/20">{item.status}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Progress Card */}
                                <Card className="border-none shadow-sm bg-primary text-white">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-white/70 font-bold text-xs uppercase tracking-widest">
                                            <Award className="w-4 h-4" />
                                            Progress Summary
                                        </div>
                                        <CardTitle className="text-white">Milestone Tracker</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {[
                                                { date: "Date/Time", title: "Primary Milestone Objective", progress: 60 }
                                            ].map((gate, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-white/10 border border-white/10">
                                                    <div className="text-[10px] uppercase font-bold text-white/60">Target: {gate.date}</div>
                                                    <div className="text-sm font-bold mt-1">{gate.title}</div>
                                                    <div className="text-[10px] mt-2 flex items-center gap-2">
                                                        <div className="h-1 flex-1 bg-white/20 rounded-full">
                                                            <div className="h-full bg-white rounded-full" style={{ width: `${gate.progress}%` }} />
                                                        </div>
                                                        {gate.progress}% Ready
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-bold uppercase text-white/60 tracking-widest">Overall Progress</span>
                                                <span className="text-sm font-black">40%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Status Report Table */}
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Detailed Status Report</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[200px] text-[10px] uppercase font-black tracking-widest">Item Name</TableHead>
                                                <TableHead className="text-[10px] uppercase font-black tracking-widest">Description</TableHead>
                                                <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">Deadline</TableHead>
                                                <TableHead className="text-[10px] uppercase font-black tracking-widest">Status</TableHead>
                                                <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Progress</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { title: "Project Alpha", description: "Core infrastructure overhaul", date: "Dec 2026", status: "On Track", progress: 45, color: "bg-blue-500" },
                                                { title: "Initiative Beta", description: "Market expansion phase 1", date: "Jun 2026", status: "Delayed", progress: 30, color: "bg-orange-500" },
                                                { title: "Operation Gamma", description: "Internal governance audit", date: "Sep 2026", status: "Completed", progress: 100, color: "bg-green-500" },
                                            ].map((row, i) => (
                                                <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1 h-3 rounded-full ${row.color}`} />
                                                            <span className="font-bold text-xs">{row.title}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground line-clamp-1">{row.description}</TableCell>
                                                    <TableCell className="text-xs text-center font-mono">{row.date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="scale-90 font-bold uppercase">{row.status}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[10px] font-bold">{row.progress}%</span>
                                                            <div className="w-24 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${row.progress}%` }} />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Status Distribution Chart */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DonutChart
                                    title="Status Distribution"
                                    description="Real-time status of generic items"
                                    data={[
                                        { name: "On Track", value: 65, color: "#2563eb" },
                                        { name: "Needs Attention", value: 25, color: "#f59e0b" },
                                        { name: "At Risk", value: 10, color: "#ef4444" }
                                    ]}
                                />
                                <Card className="flex items-center justify-center border-dashed border-2 bg-muted/20">
                                    <div className="text-muted-foreground text-sm">Additional Chart Placeholder</div>
                                </Card>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Standard Card */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Standard Card</Label>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Standard Card</CardTitle>
                                        <CardDescription>Basic container</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-24 rounded-md bg-muted/50 flex items-center justify-center border border-dashed">
                                            Content Area
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">Action</Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            {/* Stat Card */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Statistic Card</Label>
                                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Revenue
                                        </CardTitle>
                                        <div className="h-4 w-4 text-muted-foreground">$</div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">$45,231.89</div>
                                        <p className="text-xs text-muted-foreground">
                                            +20.1% from last month
                                        </p>
                                        <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[70%]" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Glass Card */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Glassmorphism Card</Label>
                                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-card-foreground shadow-xl">
                                    <CardHeader>
                                        <CardTitle>Glassmorphism</CardTitle>
                                        <CardDescription className="text-muted-foreground/80">Modern aesthetic</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Using <code>bg-white/10 backdrop-blur</code> utilities.</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 border-0">Frosted Button</Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Data Display */}
                    <TabsContent value="data" className="space-y-8 animate-in fade-in-50 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Tables</CardTitle>
                                <CardDescription> displaying rows of data.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Invoice</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">INV001</TableCell>
                                            <TableCell><Badge>Paid</Badge></TableCell>
                                            <TableCell>Credit Card</TableCell>
                                            <TableCell className="text-right">$250.00</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">INV002</TableCell>
                                            <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                                            <TableCell>PayPal</TableCell>
                                            <TableCell className="text-right">$150.00</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">INV003</TableCell>
                                            <TableCell><Badge variant="destructive">Unpaid</Badge></TableCell>
                                            <TableCell>Bank Transfer</TableCell>
                                            <TableCell className="text-right">$350.00</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">INV004</TableCell>
                                            <TableCell><Badge>Paid</Badge></TableCell>
                                            <TableCell>Credit Card</TableCell>
                                            <TableCell className="text-right">$450.00</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Patterns */}
                    <TabsContent value="patterns" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="flex justify-center p-8 bg-muted/30 rounded-lg">
                            <Card className="w-full max-w-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Login</CardTitle>
                                    <CardDescription>
                                        Enter your email below to login to your account.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email-login">Email</Label>
                                        <Input id="email-login" type="email" placeholder="m@example.com" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" required />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Sign in</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Animation */}
                    <TabsContent value="animation" className="space-y-8 animate-in fade-in-50 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Loading States & Animations</CardTitle>
                                <CardDescription>Spinners, skeletons, and pulses</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <Label>Spinners</Label>
                                    <div className="flex items-center gap-4">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Pulse Effect</Label>
                                    <div className="flex items-center gap-4">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                        </span>
                                        <span className="text-sm text-muted-foreground">Live Status</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Skeletons</Label>
                                    <div className="space-y-2">
                                        <div className="h-4 w-[250px] bg-muted animate-pulse rounded" />
                                        <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Toaster />
        </div>
    );
};

export default UILibrary;
