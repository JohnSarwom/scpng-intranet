import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertTriangle, Calendar, ChevronRight, BarChart3, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const mockDailyLogs = [
    { date: 'Mon, Dec 08', tasks: 5, hours: 8, mood: 8, status: 'submitted' },
    { date: 'Tue, Dec 09', tasks: 4, hours: 8, mood: 7, status: 'submitted' },
    { date: 'Wed, Dec 10', tasks: 6, hours: 9, mood: 9, status: 'submitted' },
    { date: 'Thu, Dec 11', tasks: 3, hours: 8, mood: 6, status: 'submitted' },
    { date: 'Fri, Dec 12', tasks: 0, hours: 0, mood: 0, status: 'pending' },
];

const WeeklyReviewTab = () => {
    const { toast } = useToast();
    const [executiveSummary, setExecutiveSummary] = useState('');

    const totalTasks = mockDailyLogs.reduce((acc, log) => acc + log.tasks, 0);
    const avgMood = (mockDailyLogs.reduce((acc, log) => acc + log.mood, 0) / 4).toFixed(1); // Exclude Fri

    const handleSubmit = () => {
        toast({
            title: "Weekly Review Submitted",
            description: "Review has been sent to Division Head for approval.",
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Input & Summary */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-intranet-primary" />
                                Weekly Activity Roll-up
                            </CardTitle>
                            <CardDescription>Review daily logs and synthesize for management.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockDailyLogs.map((log, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${log.status === 'submitted' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <div>
                                                <p className="font-medium text-sm">{log.date}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.status === 'submitted' ? `${log.tasks} tasks • ${log.hours}h` : 'No log submitted'}
                                                </p>
                                            </div>
                                        </div>
                                        {log.status === 'submitted' ? (
                                            <Badge variant="outline" className="ml-auto">Complete</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="ml-auto">Pending</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Executive Summary</CardTitle>
                            <CardDescription>Highlight key wins and risks for the Division Head.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="This week we focused on..."
                                className="min-h-[150px]"
                                value={executiveSummary}
                                onChange={(e) => setExecutiveSummary(e.target.value)}
                            />
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button onClick={handleSubmit} className="gap-2">
                                <Send className="w-4 h-4" /> Submit Review
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column: Metrics */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Weekly Pulse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Productivity Score</span>
                                    <span className="font-bold">92%</span>
                                </div>
                                <Progress value={92} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-background rounded-lg text-center border">
                                    <div className="text-2xl font-bold">{totalTasks}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Tasks Done</div>
                                </div>
                                <div className="p-3 bg-background rounded-lg text-center border">
                                    <div className="text-2xl font-bold">{avgMood}<span className="text-xs text-muted-foreground">/10</span></div>
                                    <div className="text-xs text-muted-foreground uppercase">Avg Morale</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-orange-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Escalations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>• Delay in API Approval (2 days)</p>
                                <p>• Server outage on Wed (Resolved)</p>
                            </div>
                            <Button variant="link" className="px-0 text-xs mt-2 text-orange-600">View Incident Reports</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReviewTab;
