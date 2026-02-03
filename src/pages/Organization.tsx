
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, Minus, Target, Flag, Award, BarChart2, TrendingUp, Clock } from 'lucide-react';
import DonutChart from '@/components/organization/DonutChart';
import BarChart from '@/components/organization/BarChart';

const Organization = () => {
  // Mock data for Mission and Vision
  const orgMission = "To promote and maintain a secure capital market that is fair for and accessible to all stakeholders while supporting capital formation through innovative market development.";

  const orgVision = "To ensure Port Moresby becomes the Financial Capital of the Blue Pacific by 2040.";

  const orgValues = [
    { name: "Protect", description: "Safeguarding investors from scams and market manipulation." },
    { name: "Develop", description: "Encouraging new capital formation and innovative market products." },
    { name: "Regulate", description: "Ensuring all market participants follow the rule of law." },
    { name: "Mitigate", description: "Reducing systemic risks within the PNG financial landscape." },
  ];

  // Mock data for KPIs
  const kpiData = [
    {
      id: 1,
      area: "Financial",
      kpi: "Revenue Growth",
      target: "15%",
      current: "12%",
      status: "on-track",
      progress: 80,
    },
    {
      id: 2,
      area: "Financial",
      kpi: "Cost Reduction",
      target: "8%",
      current: "5%",
      status: "needs-attention",
      progress: 62,
    },
    {
      id: 3,
      area: "Customers",
      kpi: "Customer Satisfaction",
      target: "90%",
      current: "86%",
      status: "on-track",
      progress: 95,
    },
    {
      id: 4,
      area: "Customers",
      kpi: "New Clients",
      target: "50",
      current: "38",
      status: "on-track",
      progress: 76,
    },
    {
      id: 5,
      area: "Internal Processes",
      kpi: "Project Delivery On Time",
      target: "95%",
      current: "82%",
      status: "at-risk",
      progress: 58,
    },
    {
      id: 6,
      area: "Innovation",
      kpi: "New Products Launched",
      target: "5",
      current: "3",
      status: "on-track",
      progress: 90,
    },
    {
      id: 7,
      area: "People",
      kpi: "Employee Engagement",
      target: "85%",
      current: "78%",
      status: "on-track",
      progress: 85,
    },
    {
      id: 8,
      area: "People",
      kpi: "Training Hours per Employee",
      target: "40 hrs",
      current: "28 hrs",
      status: "needs-attention",
      progress: 70,
    },
  ];

  // Strategic objectives (Moved to Strategy page)

  // Data for donut chart
  const kpiStatusData = [
    { name: "On Track", value: 5, color: "#4CAF50" },
    { name: "Needs Attention", value: 2, color: "#FFC107" },
    { name: "At Risk", value: 1, color: "#FF5252" }
  ];

  // Data for bar chart
  const kpiProgressData = [
    { name: "Financial", current: 71, target: 85 },
    { name: "Customers", current: 86, target: 90 },
    { name: "Internal", current: 58, target: 95 },
    { name: "Innovation", current: 90, target: 100 },
    { name: "People", current: 77, target: 85 }
  ];

  return (
    <PageLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Organizational Overview</h1>
        <p className="text-gray-500">Strategic direction, performance metrics and corporate objectives</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-card to-muted/80 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-intranet-primary" />
              Mission & Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-intranet-primary">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-300">{orgMission}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-intranet-primary">Our Vision</h3>
              <p className="text-gray-700 dark:text-gray-300">{orgVision}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-intranet-primary">Our Values</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {orgValues.map((value, index) => (
                  <li key={index} className="flex flex-col p-3 border rounded-md hover:bg-accent/50 transition-colors">
                    <span className="font-medium">{value.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{value.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {/* Strategic objectives cards removed and moved to Strategy page */}
        </div>
      </div>

      {/* Analytics sections moved to Strategy page */}

      {/* KPI Table moved to Strategy page */}
    </PageLayout>
  );
};

export default Organization;
