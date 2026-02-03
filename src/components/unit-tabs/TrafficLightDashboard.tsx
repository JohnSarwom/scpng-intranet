import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    CheckCircle2,
    MinusCircle,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for the dashboard
const dashboardMetrics = [
    {
        category: "Strategic Alignment",
        status: "good", // good, warning, critical
        score: 85,
        trend: "up",
        items: [
            { label: "Goal Coverage", value: "92%", status: "good" },
            { label: "Obj. Completion", value: "78%", status: "warning" },
        ]
    },
    {
        category: "Operational Health",
        status: "warning",
        score: 72,
        trend: "flat",
        items: [
            { label: "Task Velocity", value: "14/week", status: "good" },
            { label: "Overdue Items", value: "5", status: "critical" },
        ]
    },
    {
        category: "Projects",
        status: "good",
        score: 95,
        trend: "up",
        items: [
            { label: "Active Projects", value: "8", status: "good" },
            { label: "On Track", value: "88%", status: "good" },
        ]
    }
];

const StatusIndicator = ({ status }: { status: string }) => {
    const colors = {
        good: "bg-green-500",
        warning: "bg-amber-500",
        critical: "bg-red-500",
    };

    return (
        <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]} ring-2 ring-white dark:ring-slate-950 shadow-sm`} />
    );
};

const TrafficLightDashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardMetrics.map((metric, index) => (
                <motion.div
                    key={metric.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className={`border-t-4 ${metric.status === 'good' ? 'border-t-green-500' :
                        metric.status === 'warning' ? 'border-t-amber-500' : 'border-t-red-500'
                        } shadow-md hover:shadow-lg transition-shadow`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-semibold">{metric.category}</CardTitle>
                                    <CardDescription className="text-xs mt-1 flex items-center gap-1">
                                        {metric.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                                        {metric.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-green-500" />}
                                        {metric.trend === 'flat' && <MinusCircle className="w-3 h-3 text-gray-400" />}
                                        <span>vs last month</span>
                                    </CardDescription>
                                </div>
                                <StatusIndicator status={metric.status} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between mb-4">
                                <span className="text-3xl font-bold">{metric.score}%</span>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Health Score</div>
                            </div>
                            <Progress
                                value={metric.score}
                                className={`h-2 mb-4 ${metric.status === 'good' ? 'bg-green-100 dark:bg-green-900' :
                                    metric.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900' : 'bg-red-100 dark:bg-red-900'
                                    }`}
                                indicatorClassName={
                                    metric.status === 'good' ? 'bg-green-500' :
                                        metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                }
                            />

                            <div className="space-y-2 mt-4">
                                {metric.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0 border-dashed">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{item.value}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'good' ? 'bg-green-500' :
                                                item.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

export default TrafficLightDashboard;
