
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from 'lucide-react';

const PersonalKPIStats: React.FC = () => {
  // Mock data for personal KPI stats - Quarterly
  const quarterlyData = [
    { name: 'Q1', productivity: 69, efficiency: 73, kraSuccess: 75 },
    { name: 'Q2', productivity: 80, efficiency: 82, kraSuccess: 85 },
    { name: 'Q3', productivity: 85, efficiency: 89, kraSuccess: 88 },
    { name: 'Q4', productivity: 90, efficiency: 92, kraSuccess: 92 },
  ];

  // Quarterly Goals Progress Data - Multiple projects per quarter
  const quarterlyGoals = [
    // Q1 Projects
    {
      quarter: 'Q1',
      goal: 'Complete Digital Transformation Project',
      progress: 100,
      status: 'completed'
    },
    {
      quarter: 'Q1',
      goal: 'Implement Cloud Migration Strategy',
      progress: 100,
      status: 'completed'
    },
    {
      quarter: 'Q1',
      goal: 'Staff Onboarding & Training Program',
      progress: 100,
      status: 'completed'
    },
    // Q2 Projects
    {
      quarter: 'Q2',
      goal: 'Implement New CRM System',
      progress: 100,
      status: 'completed'
    },
    {
      quarter: 'Q2',
      goal: 'Develop Internal Communication Platform',
      progress: 100,
      status: 'completed'
    },
    {
      quarter: 'Q2',
      goal: 'Security Audit & Compliance Review',
      progress: 100,
      status: 'completed'
    },
    // Q3 Projects
    {
      quarter: 'Q3',
      goal: 'Team Training & Development Program',
      progress: 85,
      status: 'in-progress'
    },
    {
      quarter: 'Q3',
      goal: 'Mobile App Development Initiative',
      progress: 75,
      status: 'in-progress'
    },
    {
      quarter: 'Q3',
      goal: 'Customer Feedback System Implementation',
      progress: 90,
      status: 'in-progress'
    },
    // Q4 Projects
    {
      quarter: 'Q4',
      goal: 'Year-End Performance Review Process',
      progress: 45,
      status: 'in-progress'
    },
    {
      quarter: 'Q4',
      goal: 'Strategic Planning for 2026',
      progress: 30,
      status: 'in-progress'
    },
    {
      quarter: 'Q4',
      goal: 'Infrastructure Upgrade Project',
      progress: 60,
      status: 'in-progress'
    },
  ];

  return (
    <Card className="shadow-sm mb-6 animate-fade-in rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="h-5 w-5 text-intranet-primary" />
          Personal KPI Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <Tabs defaultValue="performance" className="w-full h-full flex flex-col">
          <TabsList className="grid grid-cols-2 mb-4 flex-shrink-0">
            <TabsTrigger value="performance">Performance Trends</TabsTrigger>
            <TabsTrigger value="goals">Quarterly Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4 flex-1 overflow-hidden">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quarterlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Legend />
                  <Bar dataKey="productivity" name="Productivity" fill="#83002A" radius={[4, 4, 4, 4]} />
                  <Bar dataKey="efficiency" name="Efficiency" fill="#5C001E" radius={[4, 4, 4, 4]} />
                  <Bar dataKey="kraSuccess" name="KRA Success" fill="#9E3A5D" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Quarterly Performance Metrics (%)
            </div>
          </TabsContent>

          <TabsContent value="goals" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto py-4 space-y-4 scrollbar-thin pr-2">
              {quarterlyGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-intranet-primary">{goal.quarter}</span>
                      <span className="text-sm text-gray-700">{goal.goal}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 flex-shrink-0">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${goal.status === 'completed' ? 'bg-green-600' : 'bg-intranet-primary'
                        }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PersonalKPIStats;
