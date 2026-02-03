import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    Target, ArrowUpRight, Link as LinkIcon, AlertCircle,
    CheckCircle2, GitCommitVertical, User, Layers, ArrowRight
} from 'lucide-react';
import { StrategicItem, StrategyData } from '@/mockData/strategyData';
import { Objective } from '@/types';
import { motion } from 'framer-motion';

interface StrategicAlignmentTabProps {
    unitObjectives: Objective[];
    strategyData: StrategyData;
}

const StrategicAlignmentTab: React.FC<StrategicAlignmentTabProps> = ({ unitObjectives, strategyData }) => {
    // Flatten the provided strategy data to find relevant Division Goals
    // In a real app, filtering logic would match the Unit's parent Division ID

    // We default to columns 1 and 2 just for visualization if no filter match
    const relevantDivGoals = strategyData.pillars
        .flatMap(p => p.children || []) // Org Goals
        .flatMap(og => og.children || []) // Div Goals
        .filter(dg => dg.title.includes("IT") || dg.title.includes("Network") || true).slice(0, 2); // Fallback slice for demo

    return (
        <div className="space-y-6">

            {/* Header Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Strategic Coverage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground mt-1">of Unit Objectives linked to Strategy</p>
                        <Progress value={85} className="h-1 mt-2 bg-blue-200 dark:bg-blue-900" />
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="w-4 h-4" /> Impact Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">A+</div>
                        <p className="text-xs text-muted-foreground mt-1">High contribution to Org Goal #1</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Alignment Gaps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">Objectives unlinked (Orphaned)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Alignment View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: What We Must Do (Incoming Strategy) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-intranet-primary" />
                            Incoming Division Goals
                        </h3>
                        <Badge variant="outline">Mandates</Badge>
                    </div>

                    <div className="space-y-4">
                        {relevantDivGoals.map(goal => (
                            <IncomingGoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                </div>

                {/* Right Column: What We Are Doing (Unit Response) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            My Unit Objectives
                        </h3>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                            <LinkIcon className="w-3 h-3 mr-1" /> Auto-Link
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {/* Render some mock matched objectives first, then orphans */}
                        <AlignedObjectiveCard
                            title="Server Decommissioning Project"
                            status="completed"
                            linkedTo="IT Infrastructure Optimization"
                        />
                        <AlignedObjectiveCard
                            title="Cloud Migration Phase 2"
                            status="at-risk"
                            linkedTo="IT Infrastructure Optimization"
                        />

                        {/* Orphaned Objectives (Real data placeholder) */}
                        {unitObjectives.length > 0 ? (
                            unitObjectives.map(obj => (
                                <OrphanedObjectiveCard key={obj.id} objective={obj} />
                            ))
                        ) : (
                            <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                                No additional unit objectives found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components for cleaner code
const IncomingGoalCard = ({ goal }: { goal: StrategicItem }) => (
    <Card className="border-l-4 border-l-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px]">
                    Division Goal
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">Owner: {goal.owner}</span>
            </div>
            <h4 className="font-semibold text-sm mb-1">{goal.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{goal.description}</p>

            <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">Progress:</span>
                <Progress value={goal.progress} className="h-1.5 w-24" />
                <span className="text-muted-foreground">{goal.progress}%</span>
            </div>
        </CardContent>
    </Card>
);

const AlignedObjectiveCard = ({ title, status, linkedTo }: { title: string, status: string, linkedTo: string }) => (
    <Card className="relative overflow-hidden group hover:border-blue-400 transition-colors">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{title}</h4>
                <Badge variant={status === 'completed' ? 'default' : status === 'at-risk' ? 'destructive' : 'outline'}>
                    {status}
                </Badge>
            </div>

            {/* Linkage Indicator */}
            <div className="flex items-center gap-2 mt-3 p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                <LinkIcon className="w-3 h-3" />
                <span>Linked to: <strong>{linkedTo}</strong></span>
            </div>
        </CardContent>
    </Card>
);

const OrphanedObjectiveCard = ({ objective }: { objective: Objective }) => (
    <Card className="border-dashed border-2 relative opacity-80 hover:opacity-100 transition-opacity">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{objective.title || "Untitled Objective"}</h4>
                <Button variant="outline" size="sm" className="h-6 text-xs">
                    Link
                </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-3 h-3" />
                <span>Not aligned to any strategic goal</span>
            </div>
        </CardContent>
    </Card>
);

export default StrategicAlignmentTab;
