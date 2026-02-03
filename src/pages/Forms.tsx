import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FileText, 
  Users, 
  Building, 
  Settings, 
  Computer, 
  Scale,
  Plus,
  Filter,
  Eye,
  FlaskConical
} from 'lucide-react';
import { divisions } from '@/data/divisions';
import TestForm from '@/components/forms/TestForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormTemplate as FormTemplateType } from '@/types/forms';
import { 
  defaultFormTemplates, 
  leaveApplicationTemplate,
  assetRequestTemplate,
  itSupportTemplate,
  trainingRequestTemplate,
  itRequestTemplate
} from '@/config/formTemplates';

// Form categories based on organizational divisions
interface FormCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  divisionId?: string;
  forms: FormTemplateType[];
}

// Mock form templates - in real implementation, these would come from the database
const mockFormTemplates: FormTemplateType[] = Object.values(defaultFormTemplates);

const formCategories: FormCategory[] = [
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee-related forms and requests',
    icon: Users,
    divisionId: 'corporate-services-division',
    forms: mockFormTemplates.filter(form => 
      ['leave-application', 'overtime-request', 'training-request'].includes(form.id)
    )
  },
  {
    id: 'it',
    name: 'Information Technology',
    description: 'IT services and equipment requests',
    icon: Computer,
    divisionId: 'corporate-services-division',
    forms: mockFormTemplates.filter(form => 
      ['it-support-request', 'it-equipment-access-request'].includes(form.id)
    )
  },
  {
    id: 'procurement',
    name: 'Procurement & Finance',
    description: 'Purchase requests and vendor management',
    icon: Building,
    divisionId: 'corporate-services-division',
    forms: mockFormTemplates.filter(form => 
      ['asset-request', 'vendor-registration'].includes(form.id)
    )
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Legal advice and contract reviews',
    icon: Scale,
    divisionId: 'legal-services-division',
    forms: mockFormTemplates.filter(form => 
      ['legal-advice-request', 'contract-review'].includes(form.id)
    )
  },
  {
    id: 'executive',
    name: 'Executive & Policy',
    description: 'High-level policy and budget requests',
    icon: Settings,
    divisionId: 'executive-division',
    forms: mockFormTemplates.filter(form => 
      ['policy-proposal', 'budget-request'].includes(form.id)
    )
  }
];

const Forms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const navigate = useNavigate();

  // Real form templates
  const formTemplates: FormTemplateType[] = [
    leaveApplicationTemplate,
    assetRequestTemplate,
    itSupportTemplate,
    trainingRequestTemplate,
    itRequestTemplate
  ];

  // Filter forms based on division access and search
  const filteredCategories = useMemo(() => {
    return formCategories.map(category => {
      // Filter forms within category
      const filteredForms = category.forms.filter(form => {
        // Division filter
        const matchesDivision = !selectedDivision || form.divisionId === selectedDivision;
        
        // Search filter
        const matchesSearch = !searchQuery || 
          form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesDivision && matchesSearch;
      });

      return {
        ...category,
        forms: filteredForms
      };
    }).filter(category => 
      // Only show categories that have forms after filtering
      category.forms.length > 0 ||
      // Or if we're on the specific tab for this category
      activeTab === category.id
    );
  }, [searchQuery, selectedDivision, activeTab]);

  const allForms = useMemo(() => {
    return filteredCategories.flatMap(category => category.forms);
  }, [filteredCategories]);

  const handleFormAccess = (template: FormTemplateType) => {
    navigate(`/forms/fill/${template.id}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

  const FormCard: React.FC<{ form: FormTemplateType }> = ({ form }) => {
    // Find the actual form template
    const template = formTemplates.find(t => t.id === form.id);
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => template && handleFormAccess(template)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{form.title}</CardTitle>
              <CardDescription className="text-sm">{form.description}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(form.status)} className="ml-2">
              {form.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>⏱️ {form.estimatedTime}</span>
            <span>Updated: {form.lastUpdated}</span>
          </div>
          
          {form.requiredApprovals && form.requiredApprovals.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Required Approvals:</p>
              <div className="flex flex-wrap gap-1">
                {form.requiredApprovals.map((approval, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {approval}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" disabled={!template}>
              <FileText className="w-4 h-4 mr-2" />
              {template ? 'Fill Form' : 'Coming Soon'}
            </Button>
            <Button size="sm" variant="outline" disabled={!template}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Forms</h1>
          <p className="text-muted-foreground">
            Access official forms for various organizational processes and workflows.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={selectedDivision}
              onValueChange={setSelectedDivision}
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Divisions</SelectItem>
                {divisions.map(division => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Forms Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All Forms ({allForms.length})</TabsTrigger>
            {formCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          {/* All Forms Tab */}
          <TabsContent value="all" className="space-y-6 mt-6">
            {filteredCategories.map(category => (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <Badge variant="secondary">{category.forms.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.forms.map(form => (
                    <FormCard key={form.id} form={form} />
                  ))}
                </div>
              </div>
            ))}

            {allForms.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No forms found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No forms match your search for "${searchQuery}"`
                    : "No forms are available for your current division selection"
                  }
                </p>
              </div>
            )}
          </TabsContent>

          {/* Category-specific tabs */}
          {formCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <category.icon className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.forms.map(form => (
                  <FormCard key={form.id} form={form} />
                ))}
              </div>
              
              {category.forms.length === 0 && (
                <div className="text-center py-12">
                  <category.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No {category.name.toLowerCase()} forms available</h3>
                  <p className="text-muted-foreground">
                    Forms for this category will be added soon.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-4 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <FlaskConical className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl font-semibold">Testing Area</h2>
                <p className="text-muted-foreground">
                  Use this area for testing new forms and integrations.
                </p>
              </div>
            </div>
            <TestForm />
          </TabsContent>
        </Tabs>
      </div>
      
    </PageLayout>
  );
};

export default Forms;
