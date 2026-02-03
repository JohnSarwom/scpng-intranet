import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Users, Computer, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuickFormItemProps {
  id: string;
  title: string;
  description: string;
  category: 'HR' | 'IT';
  estimatedTime: string;
  icon: React.ElementType;
  onClick: () => void;
}

const QuickFormItem: React.FC<QuickFormItemProps> = ({
  title,
  description,
  category,
  estimatedTime,
  icon: Icon,
  onClick
}) => (
  <div
    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer group"
    onClick={onClick}
  >
    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-semibold truncate">{title}</p>
        <Badge variant="secondary" className="text-xs shrink-0">
          {category}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
      <div className="flex items-center gap-1 mt-1">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{estimatedTime}</span>
      </div>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
  </div>
);

const QuickFormsAccess: React.FC = () => {
  const navigate = useNavigate();

  const quickForms = [
    {
      id: 'leave-application',
      title: 'Leave Application',
      description: 'Request time off or leave',
      category: 'HR' as const,
      estimatedTime: '5-10 min',
      icon: Users,
    },
    {
      id: 'training-request',
      title: 'Training Request',
      description: 'Request professional development',
      category: 'HR' as const,
      estimatedTime: '10-15 min',
      icon: Users,
    },
    {
      id: 'it-support-request',
      title: 'IT Support Request',
      description: 'Request IT support or new accounts',
      category: 'IT' as const,
      estimatedTime: '8-12 min',
      icon: Computer,
    },
    {
      id: 'it-equipment-access-request',
      title: 'IT Equipment & Access',
      description: 'Request equipment or system access',
      category: 'IT' as const,
      estimatedTime: '10-15 min',
      icon: Computer,
    },
  ];

  const handleFormClick = (formId: string) => {
    navigate(`/forms/fill/${formId}`);
  };

  const handleViewAllForms = () => {
    navigate('/forms');
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-intranet-primary" />
          Quick Forms Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {quickForms.map((form) => (
            <QuickFormItem
              key={form.id}
              {...form}
              onClick={() => handleFormClick(form.id)}
            />
          ))}
        </div>
        <button
          onClick={handleViewAllForms}
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 transition-colors"
        >
          View all forms
          <ChevronRight className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};

export default QuickFormsAccess;
