import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Calendar, Download, FileText, Mail, PenSquare, Plus, Printer, Save, Settings, Share } from "lucide-react";
import { Task, Project, Risk } from '@/types';
import { Kra, Kpi, Objective } from '@/types';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format } from 'date-fns';
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import WeeklyReviewTab from './WeeklyReviewTab';

interface ReportsTabProps {
  tasks?: Task[];
  kras?: Kra[];
  projects?: Project[];
  risks?: Risk[];
  objectives?: Objective[];
}

// Define report templates
const reportTemplates = [
  { id: "kpi-summary", name: "KPI Summary Report", description: "Overview of all KPIs and their statuses" },
  { id: "unit-performance", name: "Unit Performance Report", description: "Comprehensive view of unit performance across all metrics" },
  { id: "project-status", name: "Project Status Report", description: "Status update for all ongoing projects" },
  { id: "risk-assessment", name: "Risk Assessment Report", description: "Analysis of current risks and their mitigation status" },
  { id: "task-completion", name: "Task Completion Report", description: "Summary of task completion rates and status" },
  { id: "custom", name: "Custom Report", description: "Create a report with custom metrics and layout" },
];

// Define report scheduling options
const schedulingOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

// AI analysis suggestions
const aiAnalysisSuggestions = [
  "Analyze performance trends",
  "Identify bottlenecks in workflows",
  "Highlight resource allocation issues",
  "Recommend optimization opportunities",
  "Predict completion dates based on current progress",
  "Identify at-risk items requiring attention"
];

export const ReportsTab: React.FC<ReportsTabProps> = ({
  tasks = [],
  kras = [],
  projects = [],
  risks = [],
  objectives = []
}) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("kpi-summary");
  const [selectedReportTab, setSelectedReportTab] = useState<string>("generate");
  const [reportName, setReportName] = useState<string>("");
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<string>("weekly");
  const [recipients, setRecipients] = useState<string>("");
  const [enableAIAnalysis, setEnableAIAnalysis] = useState<boolean>(true);
  const [selectedAIFeatures, setSelectedAIFeatures] = useState<string[]>(["trends", "risks"]);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [reportLayout, setReportLayout] = useState<string>("standard");

  const handleGenerateReport = () => {
    if (!reportName) {
      toast({
        title: "Report Name Required",
        description: "Please provide a name for your report",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Generated",
      description: "Your report has been generated successfully",
    });
  };

  const handleScheduleReport = () => {
    if (!reportName) {
      toast({
        title: "Report Name Required",
        description: "Please provide a name for your report",
        variant: "destructive"
      });
      return;
    }

    if (!recipients) {
      toast({
        title: "Recipients Required",
        description: "Please specify at least one recipient email",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Scheduled",
      description: `Your report will be sent ${scheduleFrequency}`,
    });

    setShowScheduleDialog(false);
  };

  const handlePrintReport = () => {
    toast({
      title: "Printing Report",
      description: "Sending report to printer..."
    });
    // In a real implementation, this would use window.print() or a printing library
  };

  const handleEmailReport = () => {
    const emailDialog = window.prompt("Enter email addresses (comma separated):");
    if (emailDialog) {
      toast({
        title: "Report Sent",
        description: `Report has been emailed to: ${emailDialog}`
      });
    }
  };

  const renderGenerateSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Template</CardTitle>
            <CardDescription>Select a template or create a custom report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {reportTemplates.map(template => (
                <div key={template.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`template-${template.id}`}
                    checked={selectedTemplate === template.id}
                    onCheckedChange={() => setSelectedTemplate(template.id)}
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor={`template-${template.id}`}
                      className="font-medium leading-none cursor-pointer"
                    >
                      {template.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Customize your report details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Enter report name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Date Range</Label>
                <div className="flex gap-4">
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, 'PPP') : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <DatePicker
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="end-date" className="text-xs">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, 'PPP') : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <DatePicker
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-ai">Enable AI Analysis</Label>
                  <Switch
                    id="enable-ai"
                    checked={enableAIAnalysis}
                    onCheckedChange={setEnableAIAnalysis}
                  />
                </div>

                {enableAIAnalysis && (
                  <div className="grid gap-1.5 mt-2">
                    <Label className="text-xs">AI Analysis Features</Label>
                    <ToggleGroup type="multiple" variant="outline" className="flex flex-wrap">
                      <ToggleGroupItem value="trends" className="text-xs">Performance Trends</ToggleGroupItem>
                      <ToggleGroupItem value="risks" className="text-xs">Risk Identification</ToggleGroupItem>
                      <ToggleGroupItem value="recommendations" className="text-xs">Recommendations</ToggleGroupItem>
                      <ToggleGroupItem value="predictions" className="text-xs">Predictions</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Content</CardTitle>
            <CardDescription>Select what data to include in your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Data Sections</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-kpis" defaultChecked />
                    <Label htmlFor="include-kpis">KPIs & KRAs ({kras.length} items)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-projects" defaultChecked />
                    <Label htmlFor="include-projects">Projects ({projects.length} items)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-tasks" defaultChecked />
                    <Label htmlFor="include-tasks">Tasks ({tasks.length} items)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-risks" defaultChecked />
                    <Label htmlFor="include-risks">Risks ({risks.length} items)</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Report Layout</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="layout-standard"
                      checked={reportLayout === "standard"}
                      onCheckedChange={() => setReportLayout("standard")}
                    />
                    <Label htmlFor="layout-standard">Standard Layout</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="layout-compact"
                      checked={reportLayout === "compact"}
                      onCheckedChange={() => setReportLayout("compact")}
                    />
                    <Label htmlFor="layout-compact">Compact Layout</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="layout-detailed"
                      checked={reportLayout === "detailed"}
                      onCheckedChange={() => setReportLayout("detailed")}
                    />
                    <Label htmlFor="layout-detailed">Detailed Layout</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmailReport}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </div>
        <Button onClick={handleGenerateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );

  const renderScheduledSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports</CardTitle>
        <CardDescription>Manage your scheduled reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="p-4">
            <div className="text-center text-muted-foreground py-6">
              No scheduled reports yet. Schedule a report to see it here.
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => {
          setSelectedReportTab("generate");
          setShowScheduleDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule New Report
        </Button>
      </CardFooter>
    </Card>
  );

  const renderTemplateSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Report Templates</CardTitle>
        <CardDescription>Create and manage custom report templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Custom Templates</h3>
              <Button variant="outline" size="sm">
                <PenSquare className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
            <div className="text-center text-muted-foreground py-6">
              No custom templates yet. Create a template to see it here.
            </div>
          </div>

          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">System Templates</h3>
              <Badge variant="outline">Default</Badge>
            </div>
            <div className="space-y-3 mt-4">
              {reportTemplates.slice(0, -1).map(template => (
                <div key={template.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
      </div>

      <Tabs defaultValue="generate" value={selectedReportTab} onValueChange={setSelectedReportTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Review</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-4">
          {renderGenerateSection()}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          <WeeklyReviewTab />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-4">
          {renderScheduledSection()}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          {renderTemplateSection()}
        </TabsContent>
      </Tabs>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automatic report generation and distribution
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-name">Report Name</Label>
              <Input
                id="schedule-name"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schedule-frequency">Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {schedulingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schedule-recipients">Recipients (comma separated emails)</Label>
              <Input
                id="schedule-recipients"
                placeholder="Enter email addresses"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="schedule-ai-analysis"
                checked={enableAIAnalysis}
                onCheckedChange={(checked) => setEnableAIAnalysis(checked === true)}
              />
              <Label htmlFor="schedule-ai-analysis">Include AI Analysis</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleScheduleReport}>Schedule Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ReportsTab; 