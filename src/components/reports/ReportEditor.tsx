import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, X, Plus, Trash, MoveDown, MoveUp, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Report, ReportSectionContent, ReportSection } from '@/types/reports';
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ReportEditorProps {
  report: Report;
  onSave: (report: Report) => void;
  onCancel: () => void;
  onPreview: (report: Report) => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  report: initialReport,
  onSave,
  onCancel,
  onPreview
}) => {
  const { toast } = useToast();
  const [report, setReport] = useState<Report>({ ...initialReport });
  const [sections, setSections] = useState<ReportSectionContent[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (initialReport?.content?.sections) {
      setSections([...initialReport.content.sections]);
    }
  }, [initialReport]);

  const handleSaveReport = () => {
    if (!report.name || report.name.trim() === '') {
      toast({
        title: "Error",
        description: "Report name is required",
        variant: "destructive"
      });
      return;
    }

    if (sections.length === 0) {
      toast({
        title: "Error",
        description: "Report must have at least one section",
        variant: "destructive"
      });
      return;
    }

    // Update the report with the new sections
    const updatedReport = {
      ...report,
      content: {
        ...report.content,
        sections: sections,
        metadata: {
          ...report.content.metadata,
          updated_at: new Date().toISOString()
        }
      }
    };

    onSave(updatedReport);
  };

  const handleUpdateReportName = (name: string) => {
    setReport({
      ...report,
      name
    });
  };

  const handleUpdateSectionTitle = (index: number, title: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      title
    };
    setSections(updatedSections);
  };

  const handleUpdateSectionSummary = (index: number, summary: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      summary
    };
    setSections(updatedSections);
  };

  const handleUpdateSectionType = (index: number, type: 'kpi' | 'project' | 'task' | 'risk' | 'custom') => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      type
    };
    setSections(updatedSections);
  };

  const handleUpdateVisualizationType = (
    index: number, 
    type: 'table' | 'chart' | 'metrics' | undefined
  ) => {
    const updatedSections = [...sections];
    if (!updatedSections[index].visualization) {
      updatedSections[index].visualization = { type };
    } else {
      updatedSections[index].visualization.type = type;
    }
    setSections(updatedSections);
  };

  const handleUpdateChartType = (
    index: number,
    chartType: 'bar' | 'line' | 'pie' | 'radar' | undefined
  ) => {
    const updatedSections = [...sections];
    if (!updatedSections[index].visualization) {
      updatedSections[index].visualization = { 
        type: 'chart',
        chart_type: chartType 
      };
    } else {
      updatedSections[index].visualization.chart_type = chartType;
    }
    setSections(updatedSections);
  };

  const handleAddSection = () => {
    const newSection: ReportSectionContent = {
      id: uuidv4(),
      title: `New Section ${sections.length + 1}`,
      type: 'custom',
      data: [],
      summary: 'Add a description for this section'
    };
    
    setSections([...sections, newSection]);
    setActiveSection(sections.length);
  };

  const handleDeleteSection = () => {
    if (sectionToDelete === null) return;
    
    const updatedSections = sections.filter((_, index) => index !== sectionToDelete);
    setSections(updatedSections);
    
    // Update active section if the deleted section was the active one
    if (sectionToDelete === activeSection) {
      setActiveSection(Math.min(sectionToDelete, updatedSections.length - 1));
    } else if (sectionToDelete < activeSection) {
      setActiveSection(activeSection - 1);
    }
    
    setShowDeleteDialog(false);
    setSectionToDelete(null);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSections = [...sections];
    
    // Swap sections
    [updatedSections[index], updatedSections[newIndex]] = 
      [updatedSections[newIndex], updatedSections[index]];
    
    setSections(updatedSections);
    setActiveSection(newIndex);
  };

  const showConfirmDelete = (index: number) => {
    setSectionToDelete(index);
    setShowDeleteDialog(true);
  };

  const handlePreview = () => {
    const previewReport = {
      ...report,
      content: {
        ...report.content,
        sections
      }
    };
    
    onPreview(previewReport);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Report</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button onClick={handleSaveReport}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>Basic information about the report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={report.name}
                onChange={(e) => handleUpdateReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-start gap-6">
        <div className="w-1/4">
          <div className="space-y-2">
            <div className="font-medium">Sections</div>
            <div className="border rounded-md">
              <div className="p-2">
                {sections.map((section, index) => (
                  <div 
                    key={section.id}
                    className={`p-2 rounded cursor-pointer ${activeSection === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setActiveSection(index)}
                  >
                    {section.title}
                  </div>
                ))}
              </div>
              <Separator />
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-none" 
                onClick={handleAddSection}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          {sections.length > 0 && activeSection < sections.length ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Section</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveSection(activeSection, 'up')}
                      disabled={activeSection === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveSection(activeSection, 'down')}
                      disabled={activeSection === sections.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => showConfirmDelete(activeSection)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="section-title">Section Title</Label>
                    <Input
                      id="section-title"
                      value={sections[activeSection].title}
                      onChange={(e) => handleUpdateSectionTitle(activeSection, e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="section-summary">Section Summary</Label>
                    <Textarea
                      id="section-summary"
                      value={sections[activeSection].summary || ''}
                      onChange={(e) => handleUpdateSectionSummary(activeSection, e.target.value)}
                      placeholder="Enter a summary for this section"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="section-type">Section Type</Label>
                      <Select
                        value={sections[activeSection].type}
                        onValueChange={(value) => handleUpdateSectionType(
                          activeSection, 
                          value as 'kpi' | 'project' | 'task' | 'risk' | 'custom'
                        )}
                      >
                        <SelectTrigger id="section-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kpi">KPI Data</SelectItem>
                          <SelectItem value="project">Project Data</SelectItem>
                          <SelectItem value="task">Task Data</SelectItem>
                          <SelectItem value="risk">Risk Data</SelectItem>
                          <SelectItem value="custom">Custom Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="visualization-type">Visualization Type</Label>
                      <Select
                        value={sections[activeSection].visualization?.type || ''}
                        onValueChange={(value) => handleUpdateVisualizationType(
                          activeSection,
                          value as 'table' | 'chart' | 'metrics'
                        )}
                      >
                        <SelectTrigger id="visualization-type">
                          <SelectValue placeholder="Select visualization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="chart">Chart</SelectItem>
                          <SelectItem value="metrics">Metrics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {sections[activeSection].visualization?.type === 'chart' && (
                    <div className="grid gap-2">
                      <Label htmlFor="chart-type">Chart Type</Label>
                      <Select
                        value={sections[activeSection].visualization?.chart_type || ''}
                        onValueChange={(value) => handleUpdateChartType(
                          activeSection,
                          value as 'bar' | 'line' | 'pie' | 'radar'
                        )}
                      >
                        <SelectTrigger id="chart-type">
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="radar">Radar Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Tabs defaultValue="data-source">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="data-source">Data Source</TabsTrigger>
                        <TabsTrigger value="data-preview">Data Preview</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="data-source">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <Label>Data Source</Label>
                                <p className="text-sm text-muted-foreground">
                                  Select the source for this section's data
                                </p>
                                
                                <div className="border rounded p-4">
                                  <div className="grid gap-3">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="data-kpis" />
                                      <Label htmlFor="data-kpis">KPIs</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="data-projects" />
                                      <Label htmlFor="data-projects">Projects</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="data-tasks" />
                                      <Label htmlFor="data-tasks">Tasks</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="data-risks" />
                                      <Label htmlFor="data-risks">Risks</Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid gap-2">
                                <Label>Filters</Label>
                                <p className="text-sm text-muted-foreground">
                                  Apply filters to refine the data (coming soon)
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="data-preview">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <Label>Data Preview</Label>
                              <p className="text-sm text-muted-foreground">
                                Preview of the data based on selected source and filters
                              </p>
                              
                              <div className="border rounded p-6 text-center text-muted-foreground">
                                {sections[activeSection].data && sections[activeSection].data.length > 0 ? (
                                  <div>Data preview would appear here</div>
                                ) : (
                                  <div>No data available. Configure data source to see a preview.</div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/20">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Section Selected</h3>
                <p className="text-muted-foreground">Select a section to edit or add a new section</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={handleAddSection}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Section
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Section Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportEditor; 