import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Flag, Award, Zap, TrendingUp, Users, Shield, Lightbulb,
    ChevronRight, ChevronLeft, Save, Rocket, Layers, CheckCircle2,
    Calendar, Building2, Globe, Trash2, PlusCircle, LayoutDashboard,
    Briefcase, Activity, ShieldCheck, GraduationCap, TrendingUp as TrendingUpIcon,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StrategySetupWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    isSaving?: boolean;
}

const STEPS = [
    { title: "Foundation", icon: Target, desc: "Mission & Vision" },
    { title: "Strategic Pillars", icon: Award, desc: "Core Mandate & Pillars" },
    { title: "Strategic Objectives", icon: Layers, desc: "5 Focus Areas & Execution" },
    { title: "Alignment", icon: Users, desc: "Division KRAs" },
    { title: "Review", icon: CheckCircle2, desc: "Strategy Summary" }
];

export const StrategySetupWizard: React.FC<StrategySetupWizardProps> = ({ isOpen, onClose, onSave, isSaving }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { toast } = useToast();

    // Form State
    // Form State
    const [mission, setMission] = useState("To promote and maintain a secure capital market that is fair for and accessible to all stakeholders while supporting capital formation through innovative market development.");
    const [vision, setVision] = useState("To ensure Port Moresby becomes the Financial Capital of the Blue Pacific by 2040.");

    const [pillars, setPillars] = useState([
        { name: "Protect", description: "Safeguarding investors from scams and market manipulation.", icon: "Shield" },
        { name: "Develop", description: "Encouraging new capital formation and innovative market products.", icon: "TrendingUp" },
        { name: "Regulate", description: "Ensuring all market participants follow the rule of law.", icon: "Award" },
        { name: "Mitigate", description: "Reducing systemic risks within the PNG financial landscape.", icon: "Zap" },
    ]);

    const [objectives, setObjectives] = useState([
        {
            id: 1,
            title: "Expand Markets & Connectivity",
            description: "Enhance PNGX infrastructure and market accessibility to increase participant engagement.",
            goals: [
                "PNGX Systems: Implement ongoing Trading, Clearing, and Settlement systems.",
                "Market Clean Up: Acquire PNG Registries Ltd and resolve K35 million in undistributed dividends.",
                "Broker Expansion: Amend Business Rules to increase the number of licensed brokers beyond two."
            ],
            icon: "TrendingUp",
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
            icon: "ShieldCheck",
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
            icon: "Building2",
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
            icon: "GraduationCap",
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
            icon: "Globe",
            progress: 40
        }
    ]);

    const [alignments, setAlignments] = useState([
        {
            name: "Legal Services (LSD)",
            director: "Director Legal Services",
            alignedPillar: "Regulatory Framework Reform",
            icon: "ShieldCheck",
            kras: [
                "Pass amendments to the SC Act and Capital Market Act by end of 2026.",
                "Finalize assessment and engagement for IOSCO MMOU by end of 2026.",
                "Strengthen legal enforcement & compliance protocols."
            ]
        },
        {
            name: "Licensing (LISD)",
            director: "Director LIS",
            alignedPillar: "Expand Markets & Connectivity",
            icon: "Zap",
            kras: [
                "Implement ongoing Trading, Clearing, and Settlement systems.",
                "Acquire PNG Registries Ltd and resolve dividend issues.",
                "Amend Business Rules for broker expansion."
            ]
        },
        {
            name: "Research & Publication (RPD)",
            director: "Director R&P",
            alignedPillar: "Investor Education",
            icon: "GraduationCap",
            kras: [
                "Expand social media reach to 2-3 million followers.",
                "Execute quarterly investor bootcamps and regional roadshows.",
                "Advance 'Invest Smart PNG' awareness series."
            ]
        }
    ]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = () => {
        onSave({ mission, vision, organizationValues: pillars, pillars: objectives, alignments });
        toast({
            title: "Strategy Updated",
            description: "The strategic framework has been successfully updated and published.",
        });
        onClose();
        setCurrentStep(0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] md:h-[650px] w-[95vw] overflow-hidden flex flex-col p-0 border-none shadow-2xl ring-1 ring-black/5">
                <div className="flex h-full">
                    {/* Left Sidebar - Steps */}
                    <div className="w-52 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 p-5 hidden md:flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-1.5 bg-intranet-primary rounded-lg text-white">
                                <Rocket className="w-4 h-4" />
                            </div>
                            <div className="font-black text-[10px] uppercase tracking-widest text-intranet-primary">Setup Wizard</div>
                        </div>

                        <div className="space-y-4">
                            {STEPS.map((step, idx) => (
                                <div key={idx} className={`flex items-start gap-2.5 transition-opacity ${currentStep === idx ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`p-1.5 rounded-md ${currentStep === idx ? 'bg-intranet-primary text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        <step.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] uppercase font-black tracking-tighter text-muted-foreground leading-none">{step.desc}</div>
                                        <div className="text-xs font-bold leading-tight">{step.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="text-[9px] font-bold text-muted-foreground mb-1">PROGRESS</div>
                            <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-1" />
                        </div>
                    </div>

                    {/* Right Side - Content Area with Fixed Header/Footer */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden relative">
                        <DialogHeader className="p-5 pb-2 border-b border-gray-50 dark:border-gray-800">
                            <DialogTitle className="text-lg font-black flex items-center gap-2">
                                {STEPS[currentStep].title} Setup
                                <Badge variant="outline" className="text-[9px] uppercase ml-2 px-1.5 h-4">Step {currentStep + 1} / 4</Badge>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] leading-tight">{STEPS[currentStep].desc} - Configure your strategic hub core.</DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 bg-white dark:bg-gray-900">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    {currentStep === 0 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Flag className="w-3 h-3 text-intranet-primary" />
                                                    Mission Statement
                                                </Label>
                                                <Textarea
                                                    value={mission}
                                                    onChange={(e) => setMission(e.target.value)}
                                                    placeholder="Describe the overall purpose of the commission..."
                                                    className="min-h-[80px] text-xs leading-relaxed bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 focus:border-intranet-primary transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Lightbulb className="w-3 h-3 text-yellow-500" />
                                                    Vision 2040
                                                </Label>
                                                <Textarea
                                                    value={vision}
                                                    onChange={(e) => setVision(e.target.value)}
                                                    placeholder="Where do you see the commission by 2040?"
                                                    className="min-h-[80px] text-xs leading-relaxed bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 focus:border-intranet-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-intranet-primary flex items-center gap-2">
                                                    <Award className="w-4 h-4" />
                                                    The 4 Strategic Pillars
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {pillars.map((pillar, i) => (
                                                    <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-intranet-primary shadow-sm">
                                                                {pillar.icon === 'Shield' && <Shield className="w-4 h-4" />}
                                                                {pillar.icon === 'TrendingUp' && <TrendingUp className="w-4 h-4" />}
                                                                {pillar.icon === 'Award' && <Award className="w-4 h-4" />}
                                                                {pillar.icon === 'Zap' && <Zap className="w-4 h-4" />}
                                                            </div>
                                                            <Input
                                                                value={pillar.name}
                                                                onChange={(e) => {
                                                                    const newPillars = [...pillars];
                                                                    newPillars[i].name = e.target.value;
                                                                    setPillars(newPillars);
                                                                }}
                                                                className="h-8 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-gray-900 dark:text-gray-100"
                                                                placeholder="Pillar Name"
                                                            />
                                                        </div>
                                                        <Textarea
                                                            value={pillar.description}
                                                            onChange={(e) => {
                                                                const newPillars = [...pillars];
                                                                newPillars[i].description = e.target.value;
                                                                setPillars(newPillars);
                                                            }}
                                                            className="min-h-[50px] text-[11px] bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-intranet-primary transition-all resize-none"
                                                            placeholder="Pillar Description"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-intranet-primary flex items-center gap-2">
                                                    <Layers className="w-4 h-4" />
                                                    Strategic Objectives & Execution
                                                </h3>
                                                <Button
                                                    onClick={() => {
                                                        const newPillar = {
                                                            id: Date.now(),
                                                            title: "New Strategic Objective",
                                                            description: "New objective description...",
                                                            goals: ["Key deliverable one"],
                                                            icon: "Target",
                                                            progress: 0
                                                        };
                                                        setObjectives([...objectives, newPillar]);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[9px] font-black uppercase tracking-widest border-intranet-primary/20 text-intranet-primary"
                                                >
                                                    <PlusCircle className="w-3 h-3 mr-1.5" /> Add Objective
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {objectives.map((pillar, i) => (
                                                    <div key={pillar.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-4 group transition-all relative">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setObjectives(objectives.filter(p => p.id !== pillar.id))}
                                                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>

                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-intranet-primary font-bold text-sm flex-shrink-0 shadow-sm">
                                                                P{i + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-3">
                                                                <div className="space-y-1">
                                                                    <Input
                                                                        value={pillar.title}
                                                                        onChange={(e) => {
                                                                            const newPillars = [...objectives];
                                                                            newPillars[i].title = e.target.value;
                                                                            setObjectives(newPillars);
                                                                        }}
                                                                        className="h-8 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-gray-900 dark:text-gray-100"
                                                                        placeholder="Objective Title"
                                                                    />
                                                                    <Textarea
                                                                        value={pillar.description}
                                                                        onChange={(e) => {
                                                                            const newPillars = [...objectives];
                                                                            newPillars[i].description = e.target.value;
                                                                            setObjectives(newPillars);
                                                                        }}
                                                                        className="min-h-[40px] text-[11px] bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-muted-foreground resize-none"
                                                                        placeholder="Objective Description"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div className="text-[9px] font-black tracking-widest text-intranet-primary flex items-center gap-1.5">
                                                                        <Activity className="w-3 h-3" />
                                                                        KEY DELIVERABLES
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {pillar.goals.map((goal, gIdx) => (
                                                                            <div key={gIdx} className="flex items-center gap-2 group/goal">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-intranet-primary/40 flex-shrink-0" />
                                                                                <Input
                                                                                    value={goal}
                                                                                    onChange={(e) => {
                                                                                        const newPillars = [...objectives];
                                                                                        newPillars[i].goals[gIdx] = e.target.value;
                                                                                        setObjectives(newPillars);
                                                                                    }}
                                                                                    className="h-6 text-[11px] bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-gray-700 dark:text-gray-300"
                                                                                />
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        const newPillars = [...objectives];
                                                                                        newPillars[i].goals = newPillars[i].goals.filter((_, idx) => idx !== gIdx);
                                                                                        setObjectives(newPillars);
                                                                                    }}
                                                                                    className="h-5 w-5 text-muted-foreground hover:text-red-500 opacity-0 group-hover/goal:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Trash2 className="w-2.5 h-2.5" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const newPillars = [...objectives];
                                                                                newPillars[i].goals.push("New deliverable...");
                                                                                setObjectives(newPillars);
                                                                            }}
                                                                            className="h-6 text-[9px] font-bold text-muted-foreground hover:text-intranet-primary p-0"
                                                                        >
                                                                            + Add Deliverable
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 pt-2">
                                                                    <Progress value={pillar.progress} className="h-1 flex-1" />
                                                                    <Input
                                                                        type="number"
                                                                        value={pillar.progress}
                                                                        onChange={(e) => {
                                                                            const newPillars = [...objectives];
                                                                            newPillars[i].progress = parseInt(e.target.value) || 0;
                                                                            setObjectives(newPillars);
                                                                        }}
                                                                        className="h-6 w-12 text-[10px] font-black text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-0 shadow-none"
                                                                    />
                                                                    <span className="text-[10px] font-black">%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 flex items-center gap-3 flex-1 mr-4">
                                                    <Shield className="w-4 h-4 flex-shrink-0" />
                                                    <p className="text-[10px] font-medium leading-tight">Map divisions to strategic pillars and define their Key Result Areas (KRAs).</p>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        const newAlignment = {
                                                            name: "New Division",
                                                            director: "Director Title",
                                                            alignedPillar: pillars[0]?.title || "Strategic Pillar",
                                                            icon: "LayoutDashboard",
                                                            kras: ["Key Result Area 1"]
                                                        };
                                                        setAlignments([...alignments, newAlignment]);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[9px] font-black uppercase tracking-widest border-intranet-primary/20 text-intranet-primary shrink-0"
                                                >
                                                    <PlusCircle className="w-3 h-3 mr-1.5" /> Add Division
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {alignments.map((align, i) => (
                                                    <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 group relative transition-all">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setAlignments(alignments.filter((_, idx) => idx !== i))}
                                                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Division Name</Label>
                                                                    <Input
                                                                        value={align.name}
                                                                        onChange={(e) => {
                                                                            const newAlignments = [...alignments];
                                                                            newAlignments[i].name = e.target.value;
                                                                            setAlignments(newAlignments);
                                                                        }}
                                                                        className="h-8 text-xs font-bold bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Director Title</Label>
                                                                    <Input
                                                                        value={align.director}
                                                                        onChange={(e) => {
                                                                            const newAlignments = [...alignments];
                                                                            newAlignments[i].director = e.target.value;
                                                                            setAlignments(newAlignments);
                                                                        }}
                                                                        className="h-7 text-[10px] bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Aligned Strategic Pillar</Label>
                                                                    <select
                                                                        value={align.alignedPillar}
                                                                        onChange={(e) => {
                                                                            const newAlignments = [...alignments];
                                                                            newAlignments[i].alignedPillar = e.target.value;
                                                                            setAlignments(newAlignments);
                                                                        }}
                                                                        className="w-full h-7 rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-intranet-primary"
                                                                    >
                                                                        {objectives.map(p => (
                                                                            <option key={p.id} value={p.title}>{p.title}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-[9px] font-black text-intranet-primary uppercase tracking-widest flex items-center gap-1.5">
                                                                    <Briefcase className="w-3 h-3" />
                                                                    KEY RESULT AREAS (KRAs)
                                                                </Label>
                                                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                                                                    {align.kras.map((kra, kIdx) => (
                                                                        <div key={kIdx} className="flex items-center gap-2 group/kra">
                                                                            <div className="w-1 h-3 rounded-full bg-intranet-primary flex-shrink-0" />
                                                                            <Input
                                                                                value={kra}
                                                                                onChange={(e) => {
                                                                                    const newAlignments = [...alignments];
                                                                                    newAlignments[i].kras[kIdx] = e.target.value;
                                                                                    setAlignments(newAlignments);
                                                                                }}
                                                                                className="h-7 text-[10px] bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-gray-700 dark:text-gray-300"
                                                                            />
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => {
                                                                                    const newAlignments = [...alignments];
                                                                                    newAlignments[i].kras = newAlignments[i].kras.filter((_, idx) => idx !== kIdx);
                                                                                    setAlignments(newAlignments);
                                                                                }}
                                                                                className="h-5 w-5 text-muted-foreground hover:text-red-500 opacity-0 group-hover/kra:opacity-100 transition-opacity"
                                                                            >
                                                                                <Trash2 className="w-2.5 h-2.5" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newAlignments = [...alignments];
                                                                            newAlignments[i].kras.push("New KRA area...");
                                                                            setAlignments(newAlignments);
                                                                        }}
                                                                        className="h-6 text-[9px] font-bold text-muted-foreground hover:text-intranet-primary p-0"
                                                                    >
                                                                        + Add KRA
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 4 && (
                                        <div className="space-y-4 text-center py-4">
                                            <div className="inline-flex p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 mb-2 ring-2 ring-green-100 dark:ring-green-900/10">
                                                <Rocket className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Ready to Publish</h3>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                                                    Your strategic framework has been configured and is ready to be live.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mt-4">
                                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border-none">
                                                    <div className="text-[9px] font-black uppercase text-muted-foreground opacity-60 mb-1">Pillars</div>
                                                    <div className="text-lg font-black text-purple-600">{pillars.length}</div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border-none">
                                                    <div className="text-[9px] font-black uppercase text-muted-foreground opacity-60 mb-1">Objectives</div>
                                                    <div className="text-lg font-black text-intranet-primary">{objectives.length}</div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border-none">
                                                    <div className="text-[9px] font-black uppercase text-muted-foreground opacity-60 mb-1">Divisions</div>
                                                    <div className="text-lg font-black text-blue-600">{alignments.length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <DialogFooter className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm sticky bottom-0 z-10 sm:flex sm:items-center sm:justify-between sm:space-x-0 w-full shrink-0">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="font-bold tracking-widest text-[9px] uppercase h-9 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                                </Button>
                                <Button variant="outline" onClick={onClose} className="font-bold tracking-widest text-[9px] uppercase border-gray-200 dark:border-gray-800 h-9 px-4 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</Button>
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={isSaving}
                                className="font-bold tracking-widest text-[9px] uppercase bg-intranet-primary hover:bg-intranet-primary/90 text-white shadow-lg shadow-intranet-primary/20 min-w-[120px] h-9 px-6 transition-all active:scale-95"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Publishing...</>
                                ) : currentStep === STEPS.length - 1 ? (
                                    <><Save className="w-3.5 h-3.5 mr-1.5" /> Publish Strategy</>
                                ) : (
                                    <>Next Step <ChevronRight className="w-3.5 h-3.5 ml-1.5" /></>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StrategySetupWizard;
