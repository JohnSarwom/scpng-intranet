import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import {
    Target, Flag, Award, Zap, TrendingUp, Users, Heart, Shield, Lightbulb,
    ChevronRight, ArrowDownRight, Layers, LayoutDashboard, Clock, BarChart2,
    Building2, GraduationCap, Globe, ShieldCheck, Rocket
} from 'lucide-react';
import { StrategicItem, mockStrategyData } from '@/mockData/strategyData';
import { useStrategySharePoint } from '@/hooks/useStrategySharePoint';
import { Loader2, Table as TableIcon, BarChart as BarChartIcon, LayoutDashboard as DashboardIcon, Network, Globe as GlobeIcon } from 'lucide-react';
import DonutChart from '@/components/organization/DonutChart';
import BarChart from '@/components/organization/BarChart';
import OrgChart from '@/components/strategy/OrgChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StrategySetupWizard from '@/components/strategy/StrategySetupWizard';
import { Settings2, Plus, Pencil } from 'lucide-react';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import EditStrategicObjectiveModal from '@/components/strategy/EditStrategicObjectiveModal';

// Map icon strings to components
const IconMap: Record<string, React.ComponentType<any>> = {
    Award: Award,
    Lightbulb: Lightbulb,
    Shield: Shield,
    Users: Users,
    Heart: Heart,
    TrendingUp: TrendingUp,
    ShieldCheck: ShieldCheck,
    Building2: Building2,
    GraduationCap: GraduationCap,
    Globe: Globe,
    Target: Target,
    Layers: Layers,
    Zap: Zap,
    Rocket: Rocket
};

// Strategic objectives mock data
const strategicObjectives = [
    {
        id: 1,
        title: "Expand Markets & Connectivity",
        description: "Enhance PNGX infrastructure and market accessibility to increase participant engagement.",
        goals: [
            "PNGX Systems: Implement ongoing Trading, Clearing, and Settlement systems.",
            "Market Clean Up: Acquire PNG Registries Ltd and resolve K35 million in undistributed dividends.",
            "Broker Expansion: Amend Business Rules to increase the number of licensed brokers beyond two."
        ],
        icon: TrendingUp,
        progress: 45
    },
    {
        id: 2,
        title: "Regulatory Framework Reform",
        description: "Modernize the legal environment to ensure fair, efficient, and transparent markets.",
        goals: [
            "Legislative Updates: Pass amendments to the SC Act and Capital Market Act by end of 2026.",
            "Thematic Green Bonds: Finalize Green Bond rules with IFC by April 2026.",
            "New Codes: Implement Unit Trust, Trustee Guidelines, and Fund Management Codes by end of 2025."
        ],
        icon: ShieldCheck,
        progress: 30
    },
    {
        id: 3,
        title: "Administrative Fundamentals",
        description: "Strengthen internal governance and complete the transition to the SCPNG identity.",
        goals: [
            "Board Appointment: Appoint new Board Members by April 2026 following parliamentary name change.",
            "Strategic Planning: Finalize the 'Strategic Plan 2025–2030' with ADB and IFC by September 2025.",
            "Policy Finalization: Complete all internal office policies and procedural guides by May 2025."
        ],
        icon: Building2,
        progress: 60
    },
    {
        id: 4,
        title: "Investor Education",
        description: "Empower the public through the 'Invest Smart PNG' campaign and safety awareness.",
        goals: [
            "Digital Reach: Expand social media reach to 2–3 million followers via awareness series.",
            "Investor Bootcamps: Conduct quarterly weekend workshops for first-time investors with PNGX.",
            "Regional Workshops: Execute roadshows and pop-up events in underrepresented regional centers."
        ],
        icon: GraduationCap,
        progress: 25
    },
    {
        id: 5,
        title: "National & International Cooperation",
        description: "Solidify global standing and domestic partnerships for capacity building.",
        goals: [
            "IOSCO MMOU: Finalize assessment and engagement for the MMOU by end of 2026.",
            "Global Partnerships: Maintain ongoing regulatory assistance MOAs with ADB and IFC.",
            "Inter-Agency MOAs: Finalize data access and SME support agreements with the IPA."
        ],
        icon: Globe,
        progress: 40
    },
];

const divisionAlignment = [
    {
        name: "Legal Services Division (LSD)",
        director: "Director Legal Services",
        objectives: [
            {
                title: "Regulatory Framework Reform",
                kras: [
                    "Pass amendments to the SC Act and Capital Market Act by end of 2026.",
                    "Finalize assessment and engagement for IOSCO MMOU by end of 2026.",
                    "Strengthen legal enforcement & compliance protocols."
                ]
            }
        ],
        icon: ShieldCheck,
        color: "border-l-blue-500"
    },
    {
        name: "Licensing, Investigation & Supervision (LISD)",
        director: "Director LIS",
        objectives: [
            {
                title: "Expand Markets & Connectivity",
                kras: [
                    "Implement ongoing Trading, Clearing, and Settlement systems.",
                    "Acquire PNG Registries Ltd and resolve dividend issues.",
                    "Amend Business Rules for broker expansion."
                ]
            },
            {
                title: "Regulatory Framework Reform",
                kras: [
                    "Implement Unit Trust and Fund Management Codes by end of 2025.",
                    "Digitize licensing functions via Centurion Enterprise System."
                ]
            }
        ],
        icon: Zap,
        color: "border-l-yellow-500"
    },
    {
        name: "Research & Publication (RPD)",
        director: "Director R&P",
        objectives: [
            {
                title: "Investor Education",
                kras: [
                    "Expand social media reach to 2–3 million followers.",
                    "Execute quarterly investor bootcamps and regional roadshows.",
                    "Advance 'Invest Smart PNG' awareness series."
                ]
            }
        ],
        icon: GraduationCap,
        color: "border-l-green-500"
    },
    {
        name: "Corporate Services Division (CSD)",
        director: "Director Corporate Services",
        objectives: [
            {
                title: "Administrative Fundamentals",
                kras: [
                    "Complete all internal office policies and procedural guides by May 2025.",
                    "Support internal governance strengthened through HR/Finance modernization.",
                    "Maintain IT infrastructure for secure and efficient operations."
                ]
            }
        ],
        icon: Building2,
        color: "border-l-orange-500"
    },
    {
        name: "Secretariat & Internal Audit Units",
        director: "General Counsel / Manager Audit",
        objectives: [
            {
                title: "Administrative Fundamentals",
                kras: [
                    "Appoint new Board Members by April 2026.",
                    "Finalize the 'Strategic Plan 2025–2030' with ADB and IFC.",
                    "Establish robust internal audit and risk mitigation frameworks."
                ]
            }
        ],
        icon: Shield,
        color: "border-l-purple-500"
    }
];

const Strategy = () => {
    const { strategyData, isLoading, updateStrategy, isUpdating } = useStrategySharePoint();
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const { isAdmin } = useRoleBasedAuth();
    const { refreshStrategy } = useStrategySharePoint();

    // Dynamic state for local overrides (after wizard saves)
    const [localMission, setLocalMission] = useState<string | null>(null);
    const [localVision, setLocalVision] = useState<string | null>(null);
    const [localPillars, setLocalPillars] = useState<any[] | null>(null);
    const [localAlignments, setLocalAlignments] = useState<any[] | null>(null);
    const [localOrganizationValues, setLocalOrganizationValues] = useState<any[] | null>(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedObjective, setSelectedObjective] = useState<any>(null);

    const handleWizardSave = async (data: any) => {
        try {
            await updateStrategy(data);
            setLocalMission(data.mission);
            setLocalVision(data.vision);
            setLocalPillars(data.pillars);
            setLocalAlignments(data.alignments);
            setLocalOrganizationValues(data.organizationValues);
            setIsWizardOpen(false);
        } catch (error) {
            console.error('❌ [Strategy] Save failed:', error);
            // Error is already handled by toast in useStrategySharePoint
        }
    };

    if (isLoading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-intranet-primary" />
                        <p className="text-muted-foreground animate-pulse">Loading Strategy System...</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    const { organization, pillars, objectives, alignments, milestones, risks } = strategyData || {
        organization: mockStrategyData.organization,
        pillars: [],
        objectives: strategicObjectives,
        alignments: divisionAlignment,
        milestones: [],
        risks: []
    };

    const effectiveMission = localMission || (organization.mission.includes("efficient and transparent") ? "To promote and maintain a secure capital market that is fair for and accessible to all stakeholders while supporting capital formation through innovative market development." : organization.mission);
    const effectiveVision = localVision || (organization.vision.includes("leading public service") ? "To ensure Port Moresby becomes the Financial Capital of the Blue Pacific by 2040." : organization.vision);

    // Pillars (The 4 core commitents)
    const effectivePillars = localPillars || (pillars.length > 0 ? pillars : [
        { name: "Protect", description: "Safeguarding investors from scams and market manipulation.", icon: "Shield" },
        { name: "Develop", description: "Encouraging new capital formation and innovative market products.", icon: "TrendingUp" },
        { name: "Regulate", description: "Ensuring all market participants follow the rule of law.", icon: "Award" },
        { name: "Mitigate", description: "Reducing systemic risks within the PNG financial landscape.", icon: "Zap" },
    ]);

    // Strategic Objectives (The implementation cards)
    const effectiveObjectives = objectives && objectives.length > 0 ? objectives : strategicObjectives;

    // Divisional Alignments (The cascade)
    const effectiveAlignments = alignments && alignments.length > 0 ? alignments : divisionAlignment;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <PageLayout>
            <div className="space-y-8 pb-10">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#400010] to-[#800020] text-white shadow-xl p-8 md:p-12 mb-8"
                >
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4">
                            <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
                                <Settings2 className="w-3 h-3 mr-2 inline-block text-intranet-primary-light" />
                                Enterprise Strategy Engine
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                                SCPNG Strategy Hub
                            </h1>
                            <p className="text-intranet-primary-light/80 text-lg md:text-xl font-medium max-w-2xl leading-relaxed italic">
                                Our strategic direction, performance metrics and corporate structure — all in one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="hidden md:block p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                                <Target className="w-12 h-12 text-white/90" />
                            </div>
                            {isAdmin && (
                                <Button
                                    onClick={() => setIsWizardOpen(true)}
                                    className="bg-white text-intranet-primary hover:bg-white/90 font-black text-xs uppercase tracking-widest px-6 py-8 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 group h-auto"
                                >
                                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                    Setup Strategy
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/20 rounded-full blur-2xl" />
                </motion.div>

                {/* Mission & Vision Section */}
                {/* Content is now organized in Tabs below */}

                {/* Core Values Section (Removed from top, moved into Strategy Tab) */}

                {/* Tabs Section */}
                <Tabs defaultValue="strategy" className="w-full space-y-6">
                    <TabsList className="bg-card shadow-sm p-1 h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                        <TabsTrigger value="strategy" className="py-2.5 px-4 data-[state=active]:bg-intranet-primary data-[state=active]:text-white">
                            <DashboardIcon className="w-4 h-4 mr-2" /> Strategy
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="py-2.5 px-4 data-[state=active]:bg-intranet-primary data-[state=active]:text-white">
                            <BarChartIcon className="w-4 h-4 mr-2" /> Analytics
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="py-2.5 px-4 data-[state=active]:bg-intranet-primary data-[state=active]:text-white">
                            <TableIcon className="w-4 h-4 mr-2" /> Reports
                        </TabsTrigger>
                        <TabsTrigger value="org" className="py-2.5 px-4 data-[state=active]:bg-intranet-primary data-[state=active]:text-white">
                            <Network className="w-4 h-4 mr-2" /> Org Structure
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="strategy" className="space-y-10 mt-0 outline-none">
                        {/* 1. Mission & Vision (Provided Content) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-l-4 border-l-intranet-primary shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-intranet-primary text-lg">
                                        <Flag className="w-5 h-5" /> Mission
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-base font-medium leading-relaxed italic text-gray-700 dark:text-gray-300">
                                        "{effectiveMission}"
                                    </p>
                                    <div className="mt-4 space-y-2 border-t pt-4 border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Commission Goals:</p>
                                        <ul className="space-y-2">
                                            {[
                                                "Providing a high-quality and competitive market infrastructure for issuers and investors.",
                                                "Supporting innovation and new financial products.",
                                                "Enabling opportunities that make the PNG capital market a premier choice for investors and issuers in PNG and the Pacific."
                                            ].map((point, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground italic">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-intranet-primary mt-1 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-600 text-lg">
                                        <Target className="w-5 h-5" /> Vision
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-base font-medium leading-relaxed italic text-gray-700 dark:text-gray-300">
                                        "{effectiveVision}"
                                    </p>
                                    <div className="mt-4 border-t pt-4 border-gray-100 dark:border-gray-800">
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            This vision reflects a strategic goal for PNG to be a regional capital-raising hub and key player in Pacific capital markets.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Guiding Principles (Provided Content) */}
                        <div className="space-y-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-semibold px-1 flex items-center justify-center md:justify-start gap-2">
                                    <Award className="w-5 h-5 text-gray-500" />
                                    The 4 Strategic Pillars
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1 px-1">
                                    Embedding our mandate and operational focus into key thematic areas.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {effectivePillars.map((value: any, index: number) => {
                                    const Icon = IconMap[value.icon || value.IconName] || Award;
                                    return (
                                        <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02 }} className="cursor-default">
                                            <Card className="h-full bg-card/80 backdrop-blur border-b-4 border-b-intranet-primary/20 hover:border-intranet-primary transition-all duration-300">
                                                <CardContent className="pt-6 pb-4 flex flex-col items-center gap-3 text-center">
                                                    <div className="p-3 rounded-full bg-intranet-primary/10 text-intranet-primary">
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xs uppercase tracking-widest text-intranet-primary">{value.name || value.title}</h3>
                                                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed italic">"{value.description}"</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <p className="p-4 rounded-xl bg-intranet-primary/5 text-xs italic leading-relaxed text-muted-foreground border border-dashed border-intranet-primary/20 text-center">
                                These four pillars represent SCPNG’s core commitment to investor protection, market development, rule of law, and risk mitigation.
                            </p>
                        </div>

                        {/* 3. Strategic Objectives & Execution (Provided Content) */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold px-1 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Strategic Objectives & Execution
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {effectiveObjectives.filter((o: any) => !o.isFeatured).map((objective: any, index: number) => {
                                    const Icon = IconMap[objective.icon] || (typeof objective.icon === 'string' ? Target : objective.icon);
                                    return (
                                        <Card key={objective.id} className="relative group overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 border-t-intranet-primary hover:border-red-500">
                                            {/* Edit Button - Admin Only */}
                                            {isAdmin && (
                                                <div className="absolute top-2 right-2 z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedObjective(objective);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-md bg-white border border-gray-200 hover:bg-intranet-primary hover:text-white hover:border-intranet-primary transition-all opacity-0 group-hover:opacity-100"
                                                        title="Edit objective"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2.5 rounded-xl bg-intranet-primary/10 text-intranet-primary">
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] font-bold border-intranet-primary/20 text-intranet-primary">
                                                        {objective.progress}%
                                                    </Badge>
                                                </div>

                                                <h3 className="font-bold text-sm md:text-base leading-tight mb-2">{objective.title}</h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{objective.description}</p>

                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                                            <span>Progress</span>
                                                            <Clock className="h-3 w-3" />
                                                        </div>
                                                        <Progress value={objective.progress} className="h-1.5" />
                                                    </div>

                                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="font-bold text-[10px] mb-2 uppercase tracking-widest text-intranet-primary">Key Deliverables:</div>
                                                        <ul className="space-y-2">
                                                            {(objective.goals || []).map((goal: string, idx: number) => (
                                                                <li key={idx} className="flex items-start gap-2 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">
                                                                    <ChevronRight className="h-3 w-3 mt-0.5 text-intranet-primary flex-shrink-0" />
                                                                    <span>{goal}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {/* Project Execution (Special Highlight Card) */}
                                {effectiveObjectives.filter((o: any) => o.isFeatured).map((objective: any) => {
                                    const Icon = IconMap[objective.icon] || Rocket;
                                    return (
                                        <Card key={`featured-${objective.id}`} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-dashed border-intranet-primary/30 bg-intranet-primary/5 md:col-span-1 lg:col-span-1">
                                            <CardContent className="p-5 h-full flex flex-col">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2.5 rounded-xl bg-intranet-primary text-white shadow-md">
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-sm uppercase tracking-tight text-intranet-primary">{objective.title}</h3>
                                                        <p className="text-[10px] text-muted-foreground font-medium italic">Featured Project</p>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg border border-intranet-primary/10">
                                                        <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100 mb-1">{objective.title}</h4>
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                                            "{objective.description}"
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="font-bold text-[10px] uppercase tracking-widest text-intranet-primary flex items-center gap-1">
                                                            <Target className="w-3 h-3" /> Targets & Milestones:
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {(objective.goals || []).map((target: string, idx: number) => (
                                                                <li key={idx} className="flex items-start gap-2 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-intranet-primary mt-1 flex-shrink-0" />
                                                                    {target}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-intranet-primary/10 flex justify-between items-center">
                                                    <Badge variant="secondary" className="bg-intranet-primary/10 text-intranet-primary text-[9px]">Roadmap {new Date().getFullYear() + 1}</Badge>
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Division Alignment & KRAs (Simplified Accordion Section) */}
                        <div className="space-y-8 pt-4">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-intranet-primary mb-1">
                                        <div className="p-1 rounded bg-intranet-primary/10">
                                            <Network className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">Operational Execution</span>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                        Division Alignment & KRAs
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Strategic objectives cascaded into divisional Key Result Areas (KRAs).
                                    </p>
                                </div>
                                <Badge variant="secondary" className="font-bold py-1 px-4">2025/26 Cycle</Badge>
                            </div>

                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {effectiveAlignments.map((division: any, index: number) => {
                                    // Handle both format variants (from service vs from mock)
                                    const alignedTitle = division.alignedObjectiveTitle || (division.objectives && division.objectives[0]?.title);
                                    const kraList = division.kras || (division.objectives && division.objectives[0]?.kras) || [];

                                    return (
                                        <AccordionItem
                                            key={index}
                                            value={`div-${index}`}
                                            className="border rounded-2xl bg-white dark:bg-gray-900/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow px-0"
                                        >
                                            <AccordionTrigger className="hover:no-underline px-6 py-5 group">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="p-3 rounded-xl bg-intranet-primary/10 text-intranet-primary group-data-[state=active]:bg-intranet-primary group-data-[state=active]:text-white transition-colors">
                                                        {(() => {
                                                            const IconComp = IconMap[division.icon] || LayoutDashboard;
                                                            return <IconComp className="w-6 h-6" />;
                                                        })()}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="font-bold text-base text-gray-900 dark:text-gray-100">{division.name}</div>
                                                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{division.director}</div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-8 pt-2">
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-8 border-t border-gray-50 dark:border-gray-800 mt-2">
                                                    <div className="space-y-6 pt-6">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-4 w-1 bg-intranet-primary rounded-full"></div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-intranet-primary/70">Aligned Strategic Objective & Execution</span>
                                                            </div>
                                                            <div className="text-lg font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                                                <Target className="w-5 h-5 text-intranet-primary" />
                                                                {alignedTitle}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-4 w-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Key Result Areas (KRAs)</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {kraList.map((kra: string, kraIdx: number) => (
                                                                    <div
                                                                        key={kraIdx}
                                                                        className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                                                                    >
                                                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-intranet-primary/5 text-intranet-primary flex items-center justify-center">
                                                                            <ChevronRight className="w-3 h-3" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-snug">
                                                                                {kra}
                                                                            </p>
                                                                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
                                                                                Target Status: Active Tracking
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>

                        {/* Redundant original "Alignment Cascade" has been removed to simplify the page as requested */}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-8 mt-0 outline-none">
                        {/* 1. Executive Scorecard */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Strategic Objectives", value: (effectiveObjectives).length.toString(), sub: "Core Focus Areas", icon: Layers, color: "text-intranet-primary", bg: "bg-intranet-primary/5" },
                                { label: "Avg. Completion", value: `${Math.round((effectiveObjectives).reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / (effectiveObjectives.length || 1))}%`, sub: "Objective Progress", icon: TrendingUp, color: "text-intranet-primary", bg: "bg-intranet-primary/5" },
                                { label: "Strategic Executions", value: effectiveObjectives.filter((o: any) => o.isFeatured).length.toString(), sub: "Featured Projects", icon: Rocket, color: "text-intranet-primary", bg: "bg-intranet-primary/5" },
                                { label: "Execution Progress", value: `${Math.round((effectiveObjectives.filter((o: any) => o.isFeatured).reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / (effectiveObjectives.filter((o: any) => o.isFeatured).length || 1)))}%`, sub: "Featured Avg", icon: Zap, color: "text-intranet-primary", bg: "bg-intranet-primary/5" },
                            ].map((stat, i) => (
                                <Card key={i} className="animate-fade-in">
                                    <div className="p-5 flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black">{stat.value}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{stat.label}</div>
                                            <div className="text-[9px] text-muted-foreground opacity-60 mt-1">{stat.sub}</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 2. Strategic Objectives & Execution Distribution & Progress */}
                            <DonutChart
                                title="Strategic Status Distribution"
                                description="Real-time status of Objectives & Executions"
                                data={[
                                    { name: "On Track", value: 4, color: "#2563eb" },
                                    { name: "Needs Attention", value: 2, color: "#f59e0b" },
                                    { name: "At Risk", value: 0, color: "#ef4444" }
                                ]}
                            />

                            <BarChart
                                title="Objective & Execution Progress"
                                description="Progress tracking across Strategy Objectives & Executions"
                                data={[
                                    ...effectiveObjectives.map((obj: any) => ({
                                        name: obj.title.split(' ')[0],
                                        current: obj.progress,
                                        target: 100
                                    }))
                                ]}
                                xAxisLabel="Strategic Items"
                                yAxisLabel="Completion (%)"
                            />

                            {/* 3. Strategic Roadmap Timeline */}
                            <Card className="animate-fade-in overflow-hidden">
                                <CardHeader className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-intranet-primary" />
                                        <CardTitle className="text-lg">Critical Roadmaps & Milestones</CardTitle>
                                    </div>
                                    <CardDescription>Upcoming major strategy deadlines (2025-2026)</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {(milestones && milestones.length > 0 ? milestones : [
                                            { date: "May 2025", title: "Internal Policy Finalization", status: "Upcoming", color: "bg-blue-500", context: "Corporate Services Division completion" },
                                            { date: "Sept 2025", title: "Strategic Plan 2025–2030", status: "Planning", color: "bg-purple-500", context: "Finalize with ADB and IFC stakeholders" },
                                            { date: "April 2026", title: "Board Appointment Cycle", status: "On-Track", color: "bg-green-500", context: "New Board following parliamentary changes" },
                                            { date: "Dec 2026", title: "SC Act & Capital Market Act", status: "Critical", color: "bg-red-500", context: "Legislative amendments passage deadline" },
                                        ]).map((milestone: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${milestone.color?.startsWith('bg-') ? milestone.color : 'bg-intranet-primary'} ring-4 ring-gray-50 dark:ring-gray-800`} style={{ backgroundColor: !milestone.color?.startsWith('bg-') ? milestone.color : undefined }} />
                                                    {idx !== ((milestones?.length || 4) - 1) && <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-800 my-1" />}
                                                </div>
                                                <div className="pb-4 flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-xs font-black text-intranet-primary tracking-tighter">{milestone.date}</div>
                                                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{milestone.title}</div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">{milestone.context}</div>
                                                        </div>
                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight">{milestone.status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 4. Divisional Impact Index */}
                            <Card className="animate-fade-in overflow-hidden">
                                <CardHeader className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Network className="w-5 h-5 text-intranet-primary" />
                                        <CardTitle className="text-lg">Divisional Contribution Impact</CardTitle>
                                    </div>
                                    <CardDescription>Weight of contribution per division in 2025 Cycle</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {[
                                            { name: "LSD", weight: 35, color: "bg-blue-600", full: "Legal Services" },
                                            { name: "LISD", weight: 40, color: "bg-intranet-primary", full: "Licensing & Supervision" },
                                            { name: "RPD", weight: 20, color: "bg-green-600", full: "Research & Publication" },
                                            { name: "CSD", weight: 25, color: "bg-orange-600", full: "Corporate Services" },
                                            { name: "Secretariat", weight: 15, color: "bg-purple-600", full: "Internal Audit Units" },
                                        ].map((div, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-gray-900 dark:text-gray-100">{div.full}</span>
                                                    <span className="text-muted-foreground">{div.weight}% Load</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${div.weight}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className={`h-full ${div.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-8 mt-0 outline-none">
                        {/* 1. Executive Summary & Actions */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <Card className="flex-1 border-none shadow-sm bg-gradient-to-br from-intranet-primary/5 to-transparent">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-intranet-primary font-bold text-xs uppercase tracking-widest">
                                        <DashboardIcon className="w-4 h-4" />
                                        Executive Summary 2025/26
                                    </div>
                                    <CardTitle>Strategy Implementation Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        The Commission is currently in the <strong>Operationalization Phase</strong> of the 2025-2026 cycle.
                                        Four of the documented strategic objectives and executions are currently "On Track," primarily driven by
                                        Administrative Fundamentals and Cooperation efforts. Legislative reforms and the "Centurion System" execution remain high
                                        priorities for the coming quarters to ensure full alignment with updated market regulations.
                                    </p>
                                    <div className="flex gap-4 mt-6">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-intranet-primary text-white rounded-lg text-xs font-bold hover:bg-intranet-primary/90 transition-colors">
                                            <BarChartIcon className="w-4 h-4" /> Download PDF Report
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <TableIcon className="w-4 h-4" /> Export Excel
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:w-1/3 border-none shadow-sm bg-gray-900 text-white">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-intranet-primary-light font-bold text-xs uppercase tracking-widest">
                                        <Shield className="w-4 h-4 text-orange-400" />
                                        Strategic Risk Register
                                    </div>
                                    <CardTitle className="text-white">Active Priorities</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(risks && risks.length > 0 ? risks : [
                                        { title: "Legislative Delay", impact: "Medium", context: "Parliamentary cycle timing" },
                                        { title: "Funding Gap", impact: "Low", context: "Acquisition of PNG Registries Ltd" },
                                        { title: "Talent Mobility", impact: "High", context: "Retention of technical legal experts" },
                                    ]).map((risk: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <div>
                                                <div className="text-xs font-bold">{risk.title}</div>
                                                <div className="text-[10px] text-gray-400">{risk.context}</div>
                                            </div>
                                            <Badge variant="outline" className={`text-[9px] ${risk.impact === 'High' || risk.impact === 'Critical' ? 'text-red-400 border-red-400' : 'text-gray-300 border-white/20'}`}>
                                                {risk.impact}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Detailed Performance Table */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-intranet-primary" />
                                    <CardTitle className="text-lg">Detailed Pillar Alignment & KRA Report</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[200px] text-[10px] uppercase font-black tracking-widest">Strategic Pillar</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Primary KRA Focus</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">Deadline</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Execution Status</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Progress</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {effectiveObjectives.map((row: any, i: number) => (
                                            <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-3 rounded-full bg-intranet-primary" />
                                                        <span className="font-bold text-xs">{row.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground line-clamp-1">{row.description}</TableCell>
                                                <TableCell className="text-xs text-center font-mono">Dec 2026</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="scale-90 font-bold uppercase">{row.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] font-bold">{row.progress}%</span>
                                                        <div className="w-24 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-intranet-primary" style={{ width: `${row.progress}%` }} />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {effectiveObjectives.length === 0 && [
                                            { pillar: "Markets & Connectivity", kra: "Trading/Clearing/Settlement Systems", date: "Dec 2026", status: "Active", progress: 45, color: "text-blue-600" },
                                            { pillar: "Regulatory Reform", kra: "SC Act & Capital Market Act Update", date: "Dec 2026", status: "Drafting", progress: 30, color: "text-orange-600" },
                                        ].map((row, i) => (
                                            <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1 h-3 rounded-full ${row.color.replace('text', 'bg')}`} />
                                                        <span className="font-bold text-xs">{row.pillar}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{row.kra}</TableCell>
                                                <TableCell className="text-xs text-center font-mono">{row.date}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="scale-90 font-bold">{row.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] font-bold">{row.progress}%</span>
                                                        <div className="w-24 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div className={`h-full ${row.color.replace('text', 'bg')}`} style={{ width: `${row.progress}%` }} />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* 3. Divisional Accountability Report */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                        <Users className="w-4 h-4" />
                                        Departmental Accountability
                                    </div>
                                    <CardTitle className="text-base text-gray-900 dark:text-gray-100">Divisional Priority Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(alignments && alignments.length > 0 ? alignments : [
                                        { name: "Legal Services (LSD)", status: "High Priority", load: "Legal Reforms" },
                                        { name: "Licensing (LISD)", status: "In Progress", load: "Broker Expansion" },
                                        { name: "Research (RPD)", status: "Active", load: "Investor Roadshows" },
                                        { name: "Corporate (CSD)", status: "Ongoing", load: "Policy Finalization" },
                                    ]).map((div: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                            <div>
                                                <div className="text-xs font-bold">{div.name}</div>
                                                <div className="text-[10px] text-muted-foreground">Alignment: {div.alignedObjectiveTitle || 'Strategic Support'}</div>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] bg-white dark:bg-gray-900 border-intranet-primary/20">{div.status || 'Active'}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-intranet-primary text-white">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-white/70 font-bold text-xs uppercase tracking-widest">
                                        <Award className="w-4 h-4" />
                                        Strategy Achievement
                                    </div>
                                    <CardTitle className="text-white">Next Performance Gates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(milestones && milestones.length > 0 ? [milestones[0]] : [
                                            { date: "May 2025", title: "Completion of Internal Operating Procedures", progress: 60 }
                                        ]).map((gate: any, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-white/10 border border-white/10">
                                                <div className="text-[10px] uppercase font-bold text-white/60">Target: {gate.date}</div>
                                                <div className="text-sm font-bold mt-1">{gate.title}</div>
                                                <div className="text-[10px] mt-2 flex items-center gap-2">
                                                    <div className="h-1 flex-1 bg-white/20 rounded-full">
                                                        <div className="h-full bg-white rounded-full" style={{ width: `${gate.progress || 0}%` }} />
                                                    </div>
                                                    {gate.progress || 0}% Ready
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-bold uppercase text-white/60 tracking-widest">Full 2025 Cycle Progress</span>
                                            <span className="text-sm font-black">40%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="org" className="mt-0 outline-none">
                        <OrgChart />
                    </TabsContent>
                </Tabs>

                {/* Strategy Setup Wizard */}
                <StrategySetupWizard
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    onSave={handleWizardSave}
                    isSaving={isUpdating}
                />

                <EditStrategicObjectiveModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedObjective(null);
                    }}
                    onSuccess={() => {
                        refreshStrategy();
                    }}
                    objective={selectedObjective}
                />
            </div>
        </PageLayout>
    );
};

// Recursive Component for Goal Cascade
const GoalCascadeItem = ({ item, level }: { item: StrategicItem, level: number }) => {
    const hasChildren = item.children && item.children.length > 0;

    // Determine colors based on level
    const levelColors = {
        0: 'border-l-intranet-primary bg-card', // Pillar
        1: 'border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20', // Org Goal
        2: 'border-l-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20', // Div Goal
        3: 'border-l-purple-400 bg-white dark:bg-card', // Unit Objective
    };

    const LevelIcon = [Layers, Zap, TrendingUp, Target][level] || Target;

    return (
        <Card className={`mb-2 overflow-hidden border-l-4 ${levelColors[level as keyof typeof levelColors] || 'border-l-gray-300'} shadow-sm`}>
            {hasChildren ? (
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-black/5 transition-colors">
                            <div className="flex items-center gap-3 w-full text-left">
                                <LevelIcon className={`w-5 h-5 flex-shrink-0 ${level === 0 ? 'text-intranet-primary' : 'text-muted-foreground'}`} />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm md:text-base">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-4 mr-2">
                                    <div className="w-24 hidden sm:block">
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span>Progress</span>
                                            <span>{item.progress}%</span>
                                        </div>
                                        <Progress value={item.progress} className="h-1.5" />
                                    </div>
                                    <Badge
                                        variant={item.status === 'on-track' ? 'default' : item.status === 'at-risk' ? 'destructive' : 'secondary'}
                                        className="text-[10px] uppercase min-w-[70px] justify-center"
                                    >
                                        {item.status}
                                    </Badge>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-2 border-t bg-black/5 dark:bg-white/5 space-y-2">
                            {/* Recursive Rendering of Children */}
                            {hasChildren && item.children!.map((child) => (
                                <GoalCascadeItem key={child.id} item={child} level={level + 1} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ) : (
                // Leaf Node (No Accordion)
                <div className="px-4 py-3 flex items-start gap-3">
                    <ArrowDownRight className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <Badge
                                variant={item.status === 'completed' ? 'default' : item.status === 'on-track' ? 'outline' : 'destructive'}
                                className="scale-90"
                            >
                                {item.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>

                        {item.owner && (
                            <div className="mt-2 text-xs font-mono bg-black/5 dark:bg-white/10 inline-block px-1.5 py-0.5 rounded">
                                Owner: {item.owner}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default Strategy;
