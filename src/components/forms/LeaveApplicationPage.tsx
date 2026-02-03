import React, { useState, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormRenderer } from '@/components/forms/FormRenderer';
import LeaveApplicationPaper from '@/components/forms/LeaveApplicationPaper';
import PrintLeaveApplicationModal from '@/components/forms/PrintLeaveApplicationModal';
import { leaveApplicationTemplate } from '@/config/formTemplates';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { useGraphProfile } from '@/hooks/useGraphProfile';
import { useHRService } from '@/hooks/useHRService';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useLeaveBalances } from '@/hooks/useLeaveBalances';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, RefreshCw, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { LeaveApplicationTracker } from './LeaveApplicationTracker';
import { format, differenceInBusinessDays } from 'date-fns';
import { LeaveRequest } from '@/types/hr';

const SHAREPOINT_SITEPATH = "/sites/scpngintranet";
const SHAREPOINT_LIST_NAME = "Staff Leave Requests";

const LeaveApplicationPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'digital' | 'paper'>('digital');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LeaveRequest | null>(null);
  const { user } = useRoleBasedAuth();
  const { profile } = useGraphProfile();
  const { submitLeaveRequest, inspectListColumns, error } = useHRService();

  // Use new hooks for data fetching
  const { data: employee } = useCurrentEmployee();

  // Use faxNumber (payroll number) as the employee ID for fetching data
  // This matches what we use when submitting leave requests
  const effectiveEmployeeId = profile?.faxNumber || employee?.employeeId;

  const { data: leaveBalances = [] } = useLeaveBalances(effectiveEmployeeId);
  const { data: myApplications = [], dataUpdatedAt } = useLeaveRequests(effectiveEmployeeId);

  // Track previous applications to detect changes
  const prevApplicationsRef = useRef<LeaveRequest[]>([]);
  const [changedAppIds, setChangedAppIds] = useState<Set<string>>(new Set());

  // Detect status or stage changes and show notifications
  useEffect(() => {
    if (!myApplications || myApplications.length === 0) return;

    const prevApps = prevApplicationsRef.current;
    if (prevApps.length === 0) {
      // First load, just store the current state
      prevApplicationsRef.current = myApplications;
      return;
    }

    const newChangedIds = new Set<string>();

    // Check for changes in each application
    myApplications.forEach((currentApp) => {
      const prevApp = prevApps.find((app) => app.id === currentApp.id);

      if (prevApp) {
        // Check for status change
        if (prevApp.status !== currentApp.status) {
          newChangedIds.add(currentApp.id);
          toast.success(`Leave request #${currentApp.id} status changed!`, {
            description: `Status updated from "${prevApp.status}" to "${currentApp.status}"`,
            duration: 5000,
          });
        }

        // Check for stage change
        if (prevApp.stage !== currentApp.stage) {
          newChangedIds.add(currentApp.id);
          toast.info(`Leave request #${currentApp.id} moved to next stage`, {
            description: `Now at: ${currentApp.stage}`,
            duration: 5000,
          });
        }
      } else {
        // New application detected
        newChangedIds.add(currentApp.id);
        toast.success('New leave application detected!', {
          description: `${currentApp.leaveType} Leave - ${currentApp.daysRequested} days`,
          duration: 5000,
        });
      }
    });

    // Update the reference
    prevApplicationsRef.current = myApplications;

    // Update changed IDs and clear them after animation
    if (newChangedIds.size > 0) {
      setChangedAppIds(newChangedIds);
      setTimeout(() => setChangedAppIds(new Set()), 3000);
    }
  }, [myApplications, dataUpdatedAt]);

  const methods = useForm({
    defaultValues: {
      payrollNumber: '',
      name: '',
      division: '',
      unit: '',
      absenceFrom: '',
      absenceTo: '',
      reason: '',
      leaveType: '',
      signatureOfficer: '',
    },
  });

  useEffect(() => {
    if (profile) {
      if (profile.displayName) methods.setValue('name', profile.displayName);
      // Map Office Location to Division
      if (profile.officeLocation) methods.setValue('division', profile.officeLocation);
      // Map Department to Unit
      if (profile.department) methods.setValue('unit', profile.department);
      // Map Fax Number to Payroll Number
      if (profile.faxNumber) methods.setValue('payrollNumber', profile.faxNumber);
    }
  }, [profile, methods]);

  const handlePrintApplication = (app: LeaveRequest) => {
    setSelectedApplication(app);
    setPrintModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const startDate = data.absenceFrom ? new Date(data.absenceFrom) : null;
      const endDate = data.absenceTo ? new Date(data.absenceTo) : null;
      const days = startDate && endDate ? differenceInBusinessDays(endDate, startDate) + 1 : 1;

      await submitLeaveRequest({
        employeeId: data.payrollNumber,
        leaveType: data.leaveType || 'N/A',
        startDate: startDate ? startDate.toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toISOString().split('T')[0] : '',
        daysRequested: days > 0 ? days : 1,
        reason: data.reason,
        name: data.name,
        division: data.division,
        unit: data.unit,
        signature: data.signatureOfficer,
      });

      toast.success('Leave application submitted successfully!');
      methods.reset();

      // No need to manually refresh list, React Query polling will handle it
    } catch (err) {
      console.error("Submission failed", err);
      // Toast handled by hook
    }
  };

  return (
    <FormProvider {...methods}>
      {error && <p className="text-sm text-destructive text-right mb-4">{error}</p>}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'digital' | 'paper')} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Leave Application</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inspectListColumns && inspectListColumns('Staff Leave Requests')}
            >
              Debug Schema
            </Button>
            <TabsList>
              <TabsTrigger value="digital">Digital Form</TabsTrigger>
              <TabsTrigger value="paper">Paper Form</TabsTrigger>
              <TabsTrigger value="tracking">My Applications</TabsTrigger>
            </TabsList >
          </div >
        </div >

        <TabsContent value="digital">
          {/* Leave Balances Summary */}
          {leaveBalances.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Your Leave Balances</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {leaveBalances.map((balance) => (
                    <div key={balance.id} className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                      <p className="text-xs text-muted-foreground font-medium uppercase">{balance.leaveType}</p>
                      <div className="flex items-end gap-1 mt-1">
                        <span className={`text-xl font-bold ${balance.available < 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {balance.available}
                        </span>
                        <span className="text-xs text-muted-foreground mb-1">days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <FormRenderer template={leaveApplicationTemplate} mode="fill" onSubmit={onSubmit} />
        </TabsContent>
        <TabsContent value="paper">
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <LeaveApplicationPaper />
          </form>
        </TabsContent>

        <TabsContent value="tracking">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Leave Applications</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Live updates enabled</span>
                {dataUpdatedAt && (
                  <span className="text-xs">
                    • Last updated: {format(new Date(dataUpdatedAt), 'HH:mm:ss')}
                  </span>
                )}
              </div>
            </div>
            {myApplications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No leave applications found.
                </CardContent>
              </Card>
            ) : (
              myApplications.map((app) => {
                const hasChanged = changedAppIds.has(app.id);
                return (
                  <Card
                    key={app.id}
                    className={`overflow-hidden transition-all duration-300 ${hasChanged ? 'ring-2 ring-blue-500 shadow-lg animate-pulse' : ''
                      }`}
                  >
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{app.leaveType} Leave</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {app.createdDate ? format(new Date(app.createdDate), 'PPP') : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintApplication(app)}
                          className="flex items-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print Form
                        </Button>
                        <div className="text-right">
                          <div className="font-medium">Request ID</div>
                          <div className="text-sm text-muted-foreground">#{app.id}</div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Duration</span>
                          <p className="mt-1">
                            {format(new Date(app.startDate), 'MMM d, yyyy')} - {format(new Date(app.endDate), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">({app.daysRequested} days)</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Reason</span>
                          <p className="mt-1">{app.reason || 'No reason provided'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                            {app.status}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-4">Application Progress</h4>
                        <LeaveApplicationTracker
                          currentStage={app.stage || 'Submitted'}
                          status={app.status}
                          dates={{
                            submitted: app.createdDate,
                            managerAction: app.approvedDate, // Placeholder
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs >

      {/* Print Modal */}
      {selectedApplication && (
        <PrintLeaveApplicationModal
          isOpen={printModalOpen}
          onClose={() => {
            setPrintModalOpen(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          leaveBalances={leaveBalances}
          employeeName={profile?.displayName || employee?.fullName}
          division={profile?.officeLocation || employee?.department}
          unit={profile?.department || employee?.unit}
        />
      )}
    </FormProvider >
  );
};

export default LeaveApplicationPage;
