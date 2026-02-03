/**
 * Employee Profile Detail Modal
 * Comprehensive view of employee information with tabs
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  FileText,
  Award,
  TrendingUp,
  AlertTriangle,
  Clock,
  Download,
  Edit,
  ExternalLink,
  CheckCircle,
  XCircle,
  History,
  Shield,
} from 'lucide-react';
import { useHRService } from '@/hooks/useHRService';
import { EmployeeProfile, LeaveBalance, LeaveRequest, EmployeeDocument, Training } from '@/types/hr';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface EmployeeProfileModalProps {
  employeeId: string;
  open: boolean;
  onClose: () => void;
}

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ employeeId, open, onClose }) => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchEmployeeProfile, isInitialized } = useHRService();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && employeeId && isInitialized) {
      loadProfile();
    }
  }, [open, employeeId, isInitialized]);

  const loadProfile = async () => {
    setIsLoading(true);
    const data = await fetchEmployeeProfile(employeeId);
    setProfile(data);
    setIsLoading(false);
  };

  const handleEditClick = () => {
    // Close modal and navigate to edit page
    onClose();
    navigate(`/hr-profiles/edit/${employeeId}`);
  };

  if (!isInitialized || isLoading || !profile) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {!isInitialized ? 'Initializing HR Service...' : 'Loading Employee Profile...'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      case 'Retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600';
      case 'Pending': return 'text-yellow-600';
      case 'Declined': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={profile.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName}&backgroundColor=600018`}
                alt={profile.fullName}
                className="w-32 h-32 rounded-full border-4 border-intranet-primary shadow-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                  {profile.preferredName && (
                    <p className="text-muted-foreground">"{profile.preferredName}"</p>
                  )}
                  <p className="text-lg text-muted-foreground mt-1">{profile.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">Employee ID: {profile.employeeId}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex gap-2 mt-4">
                <Badge className={getStatusBadgeColor(profile.employmentStatus)}>
                  {profile.employmentStatus}
                </Badge>
                <Badge variant="outline">{profile.employmentType}</Badge>
                {profile.department && <Badge variant="secondary">{profile.department}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            )}
            {profile.mobilePhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="font-medium">{profile.mobilePhone}</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {profile.officeLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Office Location</p>
                  <p className="font-medium">{profile.officeLocation}</p>
                </div>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Department / Unit</p>
              <p className="font-medium">{profile.department}{profile.unit ? ` / ${profile.unit}` : ''}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Line Manager</p>
              <p className="font-medium">{profile.lineManager || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="font-medium">{new Date(profile.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="space-y-3">
            {profile.grade && (
              <div>
                <p className="text-xs text-muted-foreground">Grade</p>
                <p className="font-medium">{profile.grade}</p>
              </div>
            )}
            {profile.payScale && (
              <div>
                <p className="text-xs text-muted-foreground">Pay Scale</p>
                <p className="font-medium">{profile.payScale}</p>
              </div>
            )}
            {profile.costCenter && (
              <div>
                <p className="text-xs text-muted-foreground">Cost Center</p>
                <p className="font-medium">{profile.costCenter}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {profile.emergencyContactName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{profile.emergencyContactName}</p>
            </div>
            {profile.emergencyContactPhone && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.emergencyContactPhone}</p>
              </div>
            )}
            {profile.emergencyContactRelation && (
              <div>
                <p className="text-xs text-muted-foreground">Relationship</p>
                <p className="font-medium">{profile.emergencyContactRelation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLeaveTab = () => (
    <div className="space-y-6">
      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Leave Balances ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.leaveBalances && profile.leaveBalances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.leaveBalances.map((balance) => (
                <Card key={balance.id}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm mb-3">{balance.leaveType}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entitlement:</span>
                        <span className="font-medium">{balance.entitlement} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used:</span>
                        <span className="font-medium">{balance.used} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-medium">{balance.pending} days</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-bold">
                        <span>Available:</span>
                        <span className={balance.available < 5 ? 'text-red-600' : 'text-green-600'}>
                          {balance.available} days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No leave balance data available</p>
          )}
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Request History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.leaveRequests && profile.leaveRequests.length > 0 ? (
            <div className="space-y-3">
              {profile.leaveRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{request.leaveType}</Badge>
                          <span className={`font-medium ${getLeaveStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm mt-2">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{request.daysRequested} days</p>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground mt-2">Reason: {request.reason}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {request.approvedBy && (
                          <p>Approved by: {request.approvedBy}</p>
                        )}
                        {request.approvedDate && (
                          <p>{new Date(request.approvedDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No leave requests found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Employee Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.documents && profile.documents.length > 0 ? (
          <div className="space-y-3">
            {profile.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.documentName}</span>
                        <Badge variant="outline" className="text-xs">{doc.documentType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {doc.expiryDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                      {doc.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{doc.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No documents found</p>
        )}
      </CardContent>
    </Card>
  );

  const renderTrainingTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Training & Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.trainings && profile.trainings.length > 0 ? (
          <div className="space-y-3">
            {profile.trainings.map((training) => (
              <Card key={training.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{training.courseName}</span>
                        <Badge
                          variant="outline"
                          className={
                            training.status === 'Current'
                              ? 'bg-green-100 text-green-800'
                              : training.status === 'Expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {training.status}
                        </Badge>
                      </div>
                      {training.provider && (
                        <p className="text-sm text-muted-foreground mt-1">Provider: {training.provider}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed: {new Date(training.completionDate).toLocaleDateString()}
                      </p>
                      {training.expiryDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(training.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                      {training.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{training.notes}</p>
                      )}
                    </div>
                    {training.certificateUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={training.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No training records found</p>
        )}
      </CardContent>
    </Card>
  );

  const renderPerformanceTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.performanceReviews && profile.performanceReviews.length > 0 ? (
          <div className="space-y-3">
            {profile.performanceReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{review.reviewPeriod}</h4>
                      <p className="text-sm text-muted-foreground">{review.reviewType}</p>
                      <p className="text-xs text-muted-foreground">
                        Reviewed: {new Date(review.reviewDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Reviewer: {review.reviewer}</p>
                    </div>
                    <Badge
                      className={
                        review.overallRating === 'Exceeds'
                          ? 'bg-green-100 text-green-800'
                          : review.overallRating === 'Meets'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {review.overallRating}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  {review.strengths && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Strengths:</p>
                      <p className="text-sm text-muted-foreground">{review.strengths}</p>
                    </div>
                  )}
                  {review.areasForImprovement && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Areas for Improvement:</p>
                      <p className="text-sm text-muted-foreground">{review.areasForImprovement}</p>
                    </div>
                  )}
                  {review.goals && (
                    <div>
                      <p className="text-sm font-medium mb-1">Goals:</p>
                      <p className="text-sm text-muted-foreground">{review.goals}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No performance reviews found</p>
        )}
      </CardContent>
    </Card>
  );

  const renderHistoryTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Employment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.employmentHistory && profile.employmentHistory.length > 0 ? (
          <div className="space-y-3">
            {profile.employmentHistory.map((history) => (
              <Card key={history.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">{history.changeType}</Badge>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {history.previousJobTitle && (
                          <div>
                            <p className="text-xs text-muted-foreground">From:</p>
                            <p className="font-medium">{history.previousJobTitle}</p>
                          </div>
                        )}
                        {history.newJobTitle && (
                          <div>
                            <p className="text-xs text-muted-foreground">To:</p>
                            <p className="font-medium">{history.newJobTitle}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Effective: {new Date(history.effectiveDate).toLocaleDateString()}
                      </p>
                      {history.reason && (
                        <p className="text-sm text-muted-foreground mt-2">Reason: {history.reason}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No employment history found</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="leave">Leave</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="summary">{renderSummaryTab()}</TabsContent>
                <TabsContent value="leave">{renderLeaveTab()}</TabsContent>
                <TabsContent value="documents">{renderDocumentsTab()}</TabsContent>
                <TabsContent value="training">{renderTrainingTab()}</TabsContent>
                <TabsContent value="performance">{renderPerformanceTab()}</TabsContent>
                <TabsContent value="history">{renderHistoryTab()}</TabsContent>
              </div>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfileModal;
