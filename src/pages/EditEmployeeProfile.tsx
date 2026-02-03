/**
 * Edit Employee Profile Page
 * Full-page employee profile editor with comprehensive fields including profile picture, leave, documents, training, performance, and history
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Save, X, User, Briefcase, Phone, MapPin, AlertTriangle,
  Calendar, Upload, FileText, Award, TrendingUp, History, Trash2, Plus, Camera
} from 'lucide-react';
import { useHRService } from '@/hooks/useHRService';
import { EmployeeProfile, EmploymentStatus, EmploymentType, LeaveBalance, LeaveRequest, EmployeeDocument, Training, PerformanceReview, EmploymentHistory } from '@/types/hr';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

const EditEmployeeProfile: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { fetchEmployeeProfile, updateEmployee, isInitialized } = useHRService();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // States for additional sections
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [employmentHistory, setEmploymentHistory] = useState<EmploymentHistory[]>([]);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    preferredName: '',
    gender: '',
    dateOfBirth: '',
    nationalId: '',

    // Contact Information
    email: '',
    phone: '',
    mobilePhone: '',
    address: '',

    // Employment Information
    jobTitle: '',
    department: '',
    unit: '',
    officeLocation: '',
    employmentStatus: 'Active' as EmploymentStatus,
    employmentType: 'Permanent' as EmploymentType,
    lineManager: '',
    lineManagerEmail: '',
    startDate: '',
    endDate: '',
    grade: '',
    payScale: '',
    costCenter: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',

    // Banking Information
    payrollId: '',
    bankName: '',
    bankAccount: '',
  });

  useEffect(() => {
    if (isInitialized && employeeId) {
      loadProfile();
    }
  }, [isInitialized, employeeId]);

  const loadProfile = async () => {
    if (!employeeId) return;

    setIsLoading(true);
    try {
      const data = await fetchEmployeeProfile(employeeId);
      if (data) {
        setProfile(data);
        setPhotoUrl(data.photoUrl || '');
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          preferredName: data.preferredName || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth || '',
          nationalId: data.nationalId || '',
          email: data.email || '',
          phone: data.phone || '',
          mobilePhone: data.mobilePhone || '',
          address: data.address || '',
          jobTitle: data.jobTitle || '',
          department: data.department || '',
          unit: data.unit || '',
          officeLocation: data.officeLocation || '',
          employmentStatus: data.employmentStatus || 'Active',
          employmentType: data.employmentType || 'Permanent',
          lineManager: data.lineManager || '',
          lineManagerEmail: data.lineManagerEmail || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          grade: data.grade || '',
          payScale: data.payScale || '',
          costCenter: data.costCenter || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          emergencyContactRelation: data.emergencyContactRelation || '',
          payrollId: data.payrollId || '',
          bankName: data.bankName || '',
          bankAccount: data.bankAccount || '',
        });

        // Load additional data
        setLeaveBalances(data.leaveBalances || []);
        setLeaveRequests(data.leaveRequests || []);
        setDocuments(data.documents || []);
        setTrainings(data.trainings || []);
        setPerformanceReviews(data.performanceReviews || []);
        setEmploymentHistory(data.employmentHistory || []);
      }
    } catch (error) {
      toast.error('Failed to load employee profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setPhotoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      toast.error('Cannot update: Employee ID not found');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Upload photo to SharePoint if photoFile exists
      // For now, we'll just update the profile data

      await updateEmployee(profile.id.toString(), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferredName: formData.preferredName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationalId: formData.nationalId,
        email: formData.email,
        phone: formData.phone,
        mobilePhone: formData.mobilePhone,
        address: formData.address,
        jobTitle: formData.jobTitle,
        department: formData.department,
        unit: formData.unit,
        officeLocation: formData.officeLocation,
        employmentStatus: formData.employmentStatus,
        employmentType: formData.employmentType,
        lineManager: formData.lineManager,
        lineManagerEmail: formData.lineManagerEmail,
        startDate: formData.startDate,
        endDate: formData.endDate,
        grade: formData.grade,
        payScale: formData.payScale,
        costCenter: formData.costCenter,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        payrollId: formData.payrollId,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
      });

      toast.success('Employee profile updated successfully');
      navigate('/hr-profiles');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update profile: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/hr-profiles');
  };

  if (isLoading || !profile) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Employee Profile</h1>
              <p className="text-muted-foreground">
                {profile.fullName} - Employee ID: {profile.employeeId}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>Upload or change employee profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <img
                src={photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName}&backgroundColor=600018`}
                alt={profile.fullName}
                className="w-32 h-32 rounded-full border-4 border-intranet-primary shadow-lg object-cover"
              />
              <Button
                type="button"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new photo
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
                {photoFile && (
                  <p className="text-sm text-green-600">
                    New photo selected: {photoFile.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="banking">Banking</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic personal details and identification</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    value={formData.preferredName}
                    onChange={(e) => handleChange('preferredName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Office Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mobilePhone">Mobile Phone</Label>
                  <Input
                    id="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={(e) => handleChange('mobilePhone', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department/Unit</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Specific Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="officeLocation">Office Location (Division)</Label>
                  <Input
                    id="officeLocation"
                    value={formData.officeLocation}
                    onChange={(e) => handleChange('officeLocation', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(value) => handleChange('employmentStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleChange('employmentType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lineManager">Line Manager</Label>
                  <Input
                    id="lineManager"
                    value={formData.lineManager}
                    onChange={(e) => handleChange('lineManager', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lineManagerEmail">Line Manager Email</Label>
                  <Input
                    id="lineManagerEmail"
                    type="email"
                    value={formData.lineManagerEmail}
                    onChange={(e) => handleChange('lineManagerEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (if applicable)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade/Level</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="payScale">Pay Scale</Label>
                  <Input
                    id="payScale"
                    value={formData.payScale}
                    onChange={(e) => handleChange('payScale', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="costCenter">Cost Center</Label>
                  <Input
                    id="costCenter"
                    value={formData.costCenter}
                    onChange={(e) => handleChange('costCenter', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Input
                    id="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Tab */}
          <TabsContent value="leave" className="space-y-6">
            <LeaveManagementSection
              leaveBalances={leaveBalances}
              leaveRequests={leaveRequests}
              employeeId={profile.employeeId}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentsManagementSection
              documents={documents}
              employeeId={profile.employeeId}
            />
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <TrainingManagementSection
              trainings={trainings}
              employeeId={profile.employeeId}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceManagementSection
              reviews={performanceReviews}
              employeeId={profile.employeeId}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <EmploymentHistorySection
              history={employmentHistory}
              employeeId={profile.employeeId}
            />
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payroll & Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="payrollId">Payroll ID</Label>
                  <Input
                    id="payrollId"
                    value={formData.payrollId}
                    onChange={(e) => handleChange('payrollId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange('bankAccount', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

// Leave Management Section Component
const LeaveManagementSection: React.FC<{
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  employeeId: string;
}> = ({ leaveBalances, leaveRequests, employeeId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Balances</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Balance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {leaveBalances && leaveBalances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Entitlement</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>{balance.leaveType}</TableCell>
                    <TableCell>{balance.year}</TableCell>
                    <TableCell className="text-right">{balance.entitlement} days</TableCell>
                    <TableCell className="text-right">{balance.used} days</TableCell>
                    <TableCell className="text-right font-semibold">{balance.available} days</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No leave balances found</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests History</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests && leaveRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.daysRequested} days</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'Approved' ? 'default' : request.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.approvedBy || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No leave requests found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Documents Management Section Component
const DocumentsManagementSection: React.FC<{
  documents: EmployeeDocument[];
  employeeId: string;
}> = ({ documents, employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentName}</TableCell>
                  <TableCell><Badge variant="outline">{doc.documentType}</Badge></TableCell>
                  <TableCell>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No documents found</p>
        )}
      </CardContent>
    </Card>
  );
};

// Training Management Section Component
const TrainingManagementSection: React.FC<{
  trainings: Training[];
  employeeId: string;
}> = ({ trainings, employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Training & Certifications
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Training
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {trainings && trainings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainings.map((training) => (
                <TableRow key={training.id}>
                  <TableCell>{training.courseName}</TableCell>
                  <TableCell>{training.provider || '-'}</TableCell>
                  <TableCell>{new Date(training.completionDate).toLocaleDateString()}</TableCell>
                  <TableCell>{training.expiryDate ? new Date(training.expiryDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={training.status === 'Current' ? 'default' : 'secondary'}>
                      {training.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No training records found</p>
        )}
      </CardContent>
    </Card>
  );
};

// Performance Management Section Component
const PerformanceManagementSection: React.FC<{
  reviews: PerformanceReview[];
  employeeId: string;
}> = ({ reviews, employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Reviews
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{review.reviewPeriod}</h4>
                      <p className="text-sm text-muted-foreground">{review.reviewType}</p>
                      <p className="text-xs text-muted-foreground">
                        Reviewed: {new Date(review.reviewDate).toLocaleDateString()} by {review.reviewer}
                      </p>
                    </div>
                    <Badge className={
                      review.overallRating === 'Exceeds' ? 'bg-green-100 text-green-800' :
                        review.overallRating === 'Meets' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                    }>
                      {review.overallRating}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No performance reviews found</p>
        )}
      </CardContent>
    </Card>
  );
};

// Employment History Section Component
const EmploymentHistorySection: React.FC<{
  history: EmploymentHistory[];
  employeeId: string;
}> = ({ history, employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Employment History
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history && history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Change Type</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell><Badge variant="outline">{entry.changeType}</Badge></TableCell>
                  <TableCell>{entry.previousJobTitle || '-'}</TableCell>
                  <TableCell>{entry.newJobTitle || '-'}</TableCell>
                  <TableCell>{new Date(entry.effectiveDate).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.reason || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No employment history found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EditEmployeeProfile;
