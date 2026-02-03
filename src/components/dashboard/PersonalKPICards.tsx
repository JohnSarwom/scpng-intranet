
import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import MetricCard from './MetricCard';

const PersonalKPICards: React.FC = () => {
  // Mock data for personal KPIs
  const personalKPIs = [
    {
      title: "Tasks Completion",
      value: 87,
      subtitle: "Last 30 days",
      trend: 12,
      data: [
        { value: 55 },
        { value: 60 },
        { value: 65 },
        { value: 70 },
        { value: 75 },
        { value: 80 },
        { value: 87 }
      ],
      trendType: "increase" as const,
      trendLabel: "vs previous month",
      color: "#83002A"
    },
    {
      title: "Efficiency Rate",
      value: 92,
      subtitle: "Current quarter",
      trend: 5,
      data: [
        { value: 82 },
        { value: 85 },
        { value: 88 },
        { value: 90 },
        { value: 92 }
      ],
      trendType: "increase" as const,
      trendLabel: "vs last quarter",
      color: "#5C001E"
    },
    {
      title: "KRA Achievement Rate",
      value: 92,
      subtitle: "Goals on track",
      trend: 8,
      data: [
        { value: 75 },
        { value: 78 },
        { value: 82 },
        { value: 88 },
        { value: 92 }
      ],
      trendType: "increase" as const,
      trendLabel: "vs last quarter",
      color: "#83002A"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {personalKPIs.map((kpi, index) => (
        <MetricCard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default PersonalKPICards;
