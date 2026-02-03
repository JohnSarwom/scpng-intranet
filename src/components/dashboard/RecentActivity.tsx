import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { List } from 'lucide-react';

interface ActivityItemProps {
  actor: string;
  action: string;
  target: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ actor, action, target, time }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
    <div className="flex-1">
      <p className="text-sm">
        <span className="font-semibold">{actor}</span> {action}{' '}
        <span className="font-semibold">{target}</span>.
      </p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
    </div>
  </div>
);

const RecentActivity: React.FC = () => {
  const activities = [
    {
      actor: 'John Doe',
      action: 'updated',
      target: 'Q2 Financial Report',
      time: '2 hours ago',
    },
    {
      actor: 'Jane Smith',
      action: 'submitted',
      target: 'New Marketing Proposal',
      time: '5 hours ago',
    },
    {
      actor: 'System',
      action: 'generated',
      target: 'Weekly Performance Metrics',
      time: '1 day ago',
    },
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <List className="h-5 w-5 text-intranet-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
