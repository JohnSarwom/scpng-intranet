import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PenSquare, Plus, Trash, Copy, FileText, Image } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReportTemplate, ReportSection, ReportContentSchema } from '@/types/reports';
import { useToast } from '@/components/ui/use-toast';
import { reportsService } from '@/integrations/supabase/reportsService';
import { v4 as uuidv4 } from 'uuid';

interface TemplateManagerProps {
  onCreate?: (template: ReportTemplate) => void;
  onEdit?: (template: ReportTemplate) => void;
  onView?: (template: ReportTemplate) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onCreate,
  onEdit,
  onView
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<ReportTemplate[]>([]);
  const [systemTemplates, setSystemTemplates] = useState<ReportTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form state for creating/editing template
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [includeKpis, setIncludeKpis] = useState<boolean>(true);
  const [includeProjects, setIncludeProjects] = useState<boolean>(true);
  const [includeTasks, setIncludeTasks] = useState<boolean>(true);
  const [includeRisks, setIncludeRisks] = useState<boolean>(true);
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [templateLayout, setTemplateLayout] = useState<'standard' | 'compact' | 'detailed'>('standard');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Filter templates into custom and system categories
    if (templates.length > 0) {
      setCustomTemplates(templates.filter(t => t.type === 'custom'));
      setSystemTemplates(templates.filter(t => t.type === 'system'));
    }
  }, [templates]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesData = await reportsService.getReportTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create sections based on selection
      const sections: ReportSection[] = [];

      if (includeKpis) {
        sections.push({
          id: uuidv4(),
          title: 'KPI Overview',
          type: 'kpi',
          visualization: 'metrics',
        });
      }

      if (includeProjects) {
        sections.push({
          id: uuidv4(),
          title: 'Project Status',
          type: 'project',
          visualization: 'table',
        });
      }

      if (includeTasks) {
        sections.push({
          id: uuidv4(),
          title: 'Task Completion',
          type: 'task',
          visualization: 'chart',
          chart_type: 'bar',
        });
      }

      if (includeRisks) {
        sections.push({
          id: uuidv4(),
          title: 'Risk Assessment',
          type: 'risk',
          visualization: 'table',
        });
      }

      // Create template content schema
      const contentSchema: ReportContentSchema = {
        sections,
        layout: templateLayout,
        include_kpis: includeKpis,
        include_projects: includeProjects,
        include_tasks: includeTasks,
        include_risks: includeRisks,
        include_logo: includeLogo,
      };

      let createdTemplate;

      if (selectedTemplate) {
        // Update existing template
        const updatedTemplate = {
          ...selectedTemplate,
          name: templateName,
          description: templateDescription,
          content_schema: contentSchema,
          updated_at: new Date().toISOString(),
        };

        createdTemplate = await reportsService.updateReportTemplate(selectedTemplate.id, updatedTemplate);

        // Update local state
        setTemplates(templates.map(t => t.id === createdTemplate.id ? createdTemplate : t));

        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
      } else {
        // Create new template
        const newTemplate: Omit<ReportTemplate, 'id'> = {
          name: templateName,
          description: templateDescription,
          type: 'custom',
          content_schema: contentSchema,
          created_at: new Date().toISOString(),
          created_by: 'current_user', // This should be replaced with actual user ID
        };

        createdTemplate = await reportsService.createReportTemplate(newTemplate);

        // Update local state
        setTemplates([...templates, createdTemplate]);

        toast({
          title: 'Success',
          description: 'Template created successfully',
        });
      }

      // Reset form
      resetForm();
      setShowCreateDialog(false);

      // Call callback if provided
      if (onCreate && !selectedTemplate) {
        onCreate(createdTemplate);
      } else if (onEdit && selectedTemplate) {
        onEdit(createdTemplate);
      }
    } catch (error) {
      console.error('Error creating/updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setIncludeKpis(template.content_schema.include_kpis ?? true);
    setIncludeProjects(template.content_schema.include_projects ?? true);
    setIncludeTasks(template.content_schema.include_tasks ?? true);
    setIncludeRisks(template.content_schema.include_risks ?? true);
    setIncludeLogo(template.content_schema.include_logo ?? true);
    setTemplateLayout(template.content_schema.layout);
    setShowCreateDialog(true);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await reportsService.deleteReportTemplate(selectedTemplate.id);

      // Update local state
      setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
      setShowDeleteDialog(false);
      setSelectedTemplate(null);

      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setIncludeKpis(true);
    setIncludeProjects(true);
    setIncludeTasks(true);
    setIncludeRisks(true);
    setIncludeLogo(true);
    setTemplateLayout('standard');
    setSelectedTemplate(null);
  };

  const confirmDeleteTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  const handleViewTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);

    if (onView) {
      onView(template);
    }
  };

  const handleCreateNewClick = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  // Preview of the template
  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="bg-white p-6 rounded-md border max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
            <p className="text-muted-foreground">{selectedTemplate.description}</p>
          </div>
          {selectedTemplate.content_schema.include_logo && (
            <img
              src="/images/SCPNG Original Logo.png"
              alt="SCPNG Logo"
              className="w-16 h-16 object-contain"
            />
          )}
        </div>

        <div className="space-y-6">
          {selectedTemplate.content_schema.sections.map(section => (
            <div key={section.id} className="border rounded-md p-4 bg-background">
              <h3 className="font-medium mb-2">{section.title}</h3>
              <div className="text-sm text-muted-foreground mb-2">
                Data Type: {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
              </div>
              {section.visualization && (
                <div className="flex items-center">
                  <Badge variant="outline">
                    {section.visualization} {section.chart_type ? `- ${section.chart_type}` : ''}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Report Templates</h3>
        <Button onClick={handleCreateNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {customTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Templates</CardTitle>
              <CardDescription>Templates you have created</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-muted rounded-md w-full"></div>
                  <div className="h-12 bg-muted rounded-md w-full"></div>
                </div>
              ) : customTemplates.length > 0 ? (
                <div className="space-y-3">
                  {customTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewTemplate(template)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteTemplate(template)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <div className="mb-4">No custom templates yet</div>
                  <Button variant="outline" size="sm" onClick={handleCreateNewClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Templates</CardTitle>
                <CardDescription>Default templates provided by the system</CardDescription>
              </div>
              <Badge variant="outline">Default</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-muted rounded-md w-full"></div>
                  <div className="h-12 bg-muted rounded-md w-full"></div>
                  <div className="h-12 bg-muted rounded-md w-full"></div>
                </div>
              </div>
            ) : systemTemplates.length > 0 ? (
              <div className="space-y-3">
                {systemTemplates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewTemplate(template)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTemplate({ ...template, type: 'custom' })}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No system templates available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? 'Update the template details and content'
                : 'Configure a new report template'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Enter template description"
                rows={2}
              />
            </div>

            <Separator />

            <div>
              <Label>Data Sections</Label>
              <p className="text-sm text-muted-foreground">
                Select which data sections to include in the template
              </p>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-kpis"
                    checked={includeKpis}
                    onCheckedChange={(checked) => setIncludeKpis(!!checked)}
                  />
                  <Label htmlFor="include-kpis">KPIs & KRAs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-projects"
                    checked={includeProjects}
                    onCheckedChange={(checked) => setIncludeProjects(!!checked)}
                  />
                  <Label htmlFor="include-projects">Projects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-tasks"
                    checked={includeTasks}
                    onCheckedChange={(checked) => setIncludeTasks(!!checked)}
                  />
                  <Label htmlFor="include-tasks">Tasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-risks"
                    checked={includeRisks}
                    onCheckedChange={(checked) => setIncludeRisks(!!checked)}
                  />
                  <Label htmlFor="include-risks">Risks</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="template-layout">Layout Style</Label>
              <Select
                value={templateLayout}
                onValueChange={(value) => setTemplateLayout(value as 'standard' | 'compact' | 'detailed')}
              >
                <SelectTrigger id="template-layout">
                  <SelectValue placeholder="Select layout style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Layout</SelectItem>
                  <SelectItem value="compact">Compact Layout</SelectItem>
                  <SelectItem value="detailed">Detailed Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-logo"
                checked={includeLogo}
                onCheckedChange={(checked) => setIncludeLogo(!!checked)}
              />
              <div>
                <Label htmlFor="include-logo">Include SCPNG Logo</Label>
                <p className="text-sm text-muted-foreground">Add the official SCPNG logo to the report</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate}>{selectedTemplate ? 'Save Changes' : 'Create Template'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how reports using this template will appear
            </DialogDescription>
          </DialogHeader>

          {renderTemplatePreview()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button>
            {selectedTemplate?.type !== 'system' && (
              <Button onClick={() => {
                setShowPreviewDialog(false);
                handleEditTemplate(selectedTemplate!);
              }}>
                Edit Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManager; 