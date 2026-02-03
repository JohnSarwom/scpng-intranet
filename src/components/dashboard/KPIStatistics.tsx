
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample KPI data - in a real implementation, this would come from an API
const kpiData = [
  { name: 'Q1', value: 68, target: 70 },
  { name: 'Q2', value: 75, target: 70 },
  { name: 'Q3', value: 82, target: 75 },
  { name: 'Q4', value: 88, target: 80 },
];

const pieData = [
  { name: 'Completed', value: 72, color: '#83002A' },
  { name: 'In Progress', value: 18, color: '#5C001E' },
  { name: 'Not Started', value: 10, color: '#cccccc' },
];

const tableData = [
  { metric: 'Document Processing', current: 87, target: 75, trend: 'up' },
  { metric: 'Client Satisfaction', current: 92, target: 90, trend: 'up' },
  { metric: 'Response Time', current: 68, target: 80, trend: 'down' },
  { metric: 'Compliance Rate', current: 95, target: 95, trend: 'stable' },
];

const KPIStatistics: React.FC = () => {
  return (
    <Card className="shadow-sm animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold">KPI Statistics</CardTitle>
        <Badge variant="outline" className="bg-intranet-primary/10 text-intranet-primary font-medium">
          Q4 2024
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chart">Performance</TabsTrigger>
            <TabsTrigger value="progress">Completion</TabsTrigger>
            <TabsTrigger value="table">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kpiData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Performance']}
                    labelFormatter={(label) => `${label} 2024`}
                  />
                  <Bar dataKey="value" fill="#83002A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#5C001E" radius={[4, 4, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Quarterly Performance
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <div className="flex justify-center h-64">
              <ResponsiveContainer width="80%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              KPI Completion Status
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Metric</th>
                    <th className="text-right py-3 font-medium">Current</th>
                    <th className="text-right py-3 font-medium">Target</th>
                    <th className="text-right py-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3">{item.metric}</td>
                      <td className="text-right py-3 font-medium">{item.current}%</td>
                      <td className="text-right py-3 text-muted-foreground">{item.target}%</td>
                      <td className="text-right py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                          item.trend === 'up' 
                            ? 'bg-green-100 text-green-800' 
                            : item.trend === 'down' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KPIStatistics;
