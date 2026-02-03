
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bookmark, FileText, Calendar, Users, Book, ExternalLink, FileImage, Building, Target, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuickLinkProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  url: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ icon, title, description, badge, url }) => (
  <a 
    href={url} 
    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors"
  >
    <div className="text-intranet-primary mt-0.5">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        {badge && (
          <Badge variant="outline" className="bg-intranet-primary/10 text-intranet-primary text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  </a>
);

const QuickAccess: React.FC = () => {
  const quickLinks = [
    {
      icon: <FileText size={18} />,
      title: "Monthly Report",
      description: "Q2 performance report",
      badge: "Doc",
      url: "/documents"
    },
    {
      icon: <Calendar size={18} />,
      title: "Annual Meeting",
      description: "Scheduled for next month",
      badge: "Event",
      url: "/calendar"
    },
    {
      icon: <Book size={18} />,
      title: "Policy Guidelines",
      description: "Updated regulations",
      badge: "New",
      url: "/documents"
    },
    {
      icon: <Target size={18} />,
      title: "Strategic Objectives",
      description: "Company goals and KPIs",
      badge: "Important",
      url: "/organization"
    }
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Bookmark className="h-5 w-5 text-intranet-primary" />
          Quick Access
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <div className="space-y-1 h-full overflow-y-auto scrollbar-thin pr-2">
          {quickLinks.map((link, index) => (
            <QuickLink key={index} {...link} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAccess;
