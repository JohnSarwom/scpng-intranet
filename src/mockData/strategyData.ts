export interface GoalLink {
    id: string;
    name: string;
}

export interface KpiTarget {
    metric: string;
    targetValue: string | number;
    currentValue: string | number;
    unit: string;
    status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}

export interface StrategicItem {
    id: string;
    title: string;
    description: string;
    progress: number; // 0-100
    owner?: string;
    status: 'on-track' | 'at-risk' | 'behind' | 'completed';
    children?: StrategicItem[];
    kpis?: KpiTarget[];
    parentId?: string;
}

export interface StrategyMilestone {
    id: string;
    title: string;
    date: string;
    status: 'Upcoming' | 'Planning' | 'On-Track' | 'Critical';
    context: string;
    color: string;
}

export interface StrategyRisk {
    id: string;
    title: string;
    impact: 'Low' | 'Medium' | 'High' | 'Critical';
    context: string;
}

export interface DivisionalAlignment {
    id: string;
    name: string;
    director: string;
    kras: string[];
    icon: string;
    alignedObjectiveId: string;
    alignedObjectiveTitle?: string;
}

export interface StrategyData {
    organization: {
        mission: string;
        vision: string;
        values: { name: string; description: string; icon: string }[];
    };
    pillars: StrategicItem[];
    objectives?: StrategicItem[];
    alignments?: DivisionalAlignment[];
    milestones?: StrategyMilestone[];
    risks?: StrategyRisk[];
}

export const mockStrategyData: StrategyData = {
    organization: {
        mission: "To promote and maintain a secure capital market that is fair for and accessible to all stakeholders while supporting capital formation through innovative market development.",
        vision: "To ensure Port Moresby becomes the Financial Capital of the Blue Pacific by 2040.",
        values: [
            { name: "Protect", description: "Safeguarding investors from scams and market manipulation.", icon: "Shield" },
            { name: "Develop", description: "Encouraging new capital formation and innovative market products.", icon: "TrendingUp" },
            { name: "Regulate", description: "Ensuring all market participants follow the rule of law.", icon: "Award" },
            { name: "Mitigate", description: "Reducing systemic risks within the PNG financial landscape.", icon: "Zap" },
        ]
    },
    pillars: [
        {
            id: "pillar-1",
            title: "Operational Excellence",
            description: "Optimize internal processes to improve efficiency, reduce costs, and ensure reliability.",
            progress: 78,
            status: "on-track",
            children: [
                {
                    id: "org-goal-1",
                    title: "Reduce Operational Costs by 10%",
                    description: "Streamline workflows and automate repetitive tasks across all divisions.",
                    progress: 65,
                    status: "on-track",
                    parentId: "pillar-1",
                    owner: "COO",
                    children: [
                        {
                            id: "div-goal-1",
                            title: "IT Infrastructure Optimization",
                            description: "Migrate legacy systems to cloud and retire redundant servers.",
                            progress: 80,
                            status: "on-track",
                            parentId: "org-goal-1",
                            owner: "CTO",
                            children: [
                                {
                                    id: "unit-obj-1",
                                    title: "Server Decommissioning Project",
                                    description: "Retire 50% of on-prem servers by Q4.",
                                    progress: 90,
                                    status: "completed",
                                    parentId: "div-goal-1",
                                    owner: "IT Infrastructure Manager"
                                },
                                {
                                    id: "unit-obj-2",
                                    title: "Cloud Migration Phase 2",
                                    description: "Migrate ERP and CRM systems to Azure.",
                                    progress: 40,
                                    status: "at-risk",
                                    parentId: "div-goal-1",
                                    owner: "Cloud Architect"
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "org-goal-2",
                    title: "Achieve 99.99% System Uptime",
                    description: "Ensure high availability for all critical business services.",
                    progress: 92,
                    status: "on-track",
                    parentId: "pillar-1",
                    owner: "CTO",
                    children: [
                        {
                            id: "div-goal-2",
                            title: "Network Resilience Upgrade",
                            description: "Implement redundant fiber paths and automatic failover.",
                            progress: 88,
                            status: "on-track",
                            parentId: "org-goal-2",
                            owner: "Head of Networks",
                            children: [
                                {
                                    id: "unit-obj-3",
                                    title: "Core Switch Replacement",
                                    description: "Upgrade core switches in HQ data center.",
                                    progress: 100,
                                    status: "completed",
                                    parentId: "div-goal-2",
                                    owner: "Network Lead"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: "pillar-2",
            title: "Market Expansion",
            description: "Increase market share across Australia and expand into New Zealand and Southeast Asia.",
            progress: 45,
            status: "at-risk",
            children: [
                {
                    id: "org-goal-3",
                    title: "Enter New Zealand Market",
                    description: "Establish a physical presence and sign first 10 clients in NZ.",
                    progress: 30,
                    status: "at-risk",
                    parentId: "pillar-2",
                    owner: "Head of Sales",
                    children: [
                        {
                            id: "div-goal-3",
                            title: "NZ Regulatory Compliance",
                            description: "Obtain all necessary licenses to operate in NZ.",
                            progress: 20,
                            status: "behind",
                            parentId: "org-goal-3",
                            owner: "General Counsel"
                        }
                    ]
                }
            ]
        },
        {
            id: "pillar-3",
            title: "Customer Delight",
            description: "Deliver exceptional customer experiences to drive loyalty and retention.",
            progress: 85,
            status: "on-track",
            children: []
        },
        {
            id: "pillar-4",
            title: "Talent Development",
            description: "Build a high-performing workforce through recruitment, training and retention.",
            progress: 60,
            status: "on-track",
            children: []
        }
    ]
};
