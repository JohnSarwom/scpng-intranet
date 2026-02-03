import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, AlertCircle, FileText } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/use-toast';
import { Report, ReportTemplate, ScheduledReport } from '@/types/reports';
import { reportsService } from '@/integrations/supabase/reportsService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import ReportPreview from '@/components/reports/ReportPreview';
import ReportEditor from '@/components/reports/ReportEditor';
import TemplateManager from '@/components/reports/TemplateManager';
import AIReportChat from '@/components/reports/AIReportChat';

const Reports = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAIChat, setShowAIChat] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const reportsData = await reportsService.getReports(user?.email);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (report: Report) => {
    try {
      const savedReport = await reportsService.saveReport(report);

      setReports([...reports, savedReport]);
      setSelectedReport(savedReport);
      setIsGenerating(false);

      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateReport = async (report: Report) => {
    try {
      // For now, we'll just save a new version as updating isn't implemented in the service
      const savedReport = await reportsService.saveReport(report);

      // Replace the updated report in the list
      setReports(reports.map(r => r.id === report.id ? savedReport : r));
      setSelectedReport(savedReport);
      setIsEditing(false);

      toast({
        title: 'Success',
        description: 'Report updated successfully',
      });
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive',
      });
    }
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setIsEditing(false);
  };

  const handleEditReport = () => {
    if (selectedReport) {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setIsEditing(false);
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);

    // Prepare a new report based on the template
    const newReport: Omit<Report, 'id'> = {
      name: `New ${template.name}`,
      template_id: template.id,
      content: {
        sections: template.content_schema.sections.map(section => ({
          id: section.id,
          title: section.title,
          type: section.type,
          data: [], // Empty data to be filled later
          visualization: section.visualization ? {
            type: section.visualization,
            chart_type: section.chart_type
          } : undefined
        })),
        metadata: {
          generated_at: new Date().toISOString(),
          version: '1.0'
        }
      },
      created_by: user?.email || 'anonymous',
      created_at: new Date().toISOString(),
      date_range: {
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString()
      },
      ai_analysis: false
    };

    // Create a temporary ID for the report
    const tempReport = {
      ...newReport,
      id: `temp-${Date.now()}`
    };

    setSelectedReport(tempReport as Report);
    setIsGenerating(true);
  };

  const handleCreateTemplate = (template: ReportTemplate) => {
    toast({
      title: "Success",
      description: "Template created successfully. You can now use it to generate reports."
    });
  };

  const renderGenerateContent = () => (
    <div className="space-y-6">
      {isGenerating && selectedReport ? (
        <ReportEditor
          report={selectedReport}
          onSave={handleGenerateReport}
          onCancel={() => setIsGenerating(false)}
          onPreview={handlePreviewReport}
        />
      ) : selectedReport && !isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleEditReport}>
              Edit Report
            </Button>
          </div>
          <ReportPreview
            report={selectedReport}
            isLoading={false}
            onEdit={handleEditReport}
          />
        </div>
      ) : isEditing && selectedReport ? (
        <ReportEditor
          report={selectedReport}
          onSave={handleUpdateReport}
          onCancel={handleCancelEdit}
          onPreview={handlePreviewReport}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Reports</h3>

                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-10 bg-muted rounded-md w-full"></div>
                    <div className="h-10 bg-muted rounded-md w-full"></div>
                    <div className="h-10 bg-muted rounded-md w-full"></div>
                  </div>
                ) : reports.length > 0 ? (
                  <div className="space-y-2">
                    {reports.map(report => (
                      <Button
                        key={report.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleSelectReport(report)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {report.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>No reports found</p>
                    <p className="text-sm">Generate a new report to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Report Template</h3>
                <p className="text-muted-foreground">
                  Choose a template to generate a new report
                </p>

                <TemplateManager
                  onCreate={handleCreateTemplate}
                  onView={handleSelectTemplate}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderScheduledContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Scheduled Reports</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule New Report
        </Button>
      </div>

      <div className="text-center text-muted-foreground py-16">
        <Calendar className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No scheduled reports yet</p>
        <p className="text-sm">Schedule a report to have it generated automatically</p>
      </div>
    </div>
  );

  const renderTemplatesContent = () => (
    <TemplateManager
      onCreate={handleCreateTemplate}
      onView={handleSelectTemplate}
    />
  );

  return (
    <PageLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generate">Generate Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            {renderGenerateContent()}
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            {renderScheduledContent()}
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            {renderTemplatesContent()}
          </TabsContent>
        </Tabs>

        {/* AI Chat */}
        {user && (
          <AIReportChat
            userId={user.id}
            reportId={selectedReport?.id}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default Reports; 