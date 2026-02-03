/**
 * HR Profiles TypeScript Type Definitions
 * Corresponds to SharePoint HR Lists
 */

// Employment type enumeration
export type EmploymentType =
  | 'Permanent'
  | 'Contract'
  | 'Casual'
  | 'Temporary'
  | 'Intern'
  | 'Consultant'
  | 'Agency';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated' | 'Retired';
export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type LeaveType = 'Annual' | 'Sick' | 'Special' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Compassionate';
export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Declined' | 'Cancelled' | 'Rejected';
export type DocumentType = 'CV' | 'Contract' | 'ID Copy' | 'Qualification' | 'Police Check' | 'Visa' | 'Medical' | 'Certificate' | 'Other';
export type TrainingStatus = 'Current' | 'Expired' | 'Pending Renewal';
export type ReviewType = 'Annual' | 'Mid-Year' | 'Probation' | 'Ad-hoc';
export type PerformanceRating = 'Exceeds' | 'Meets' | 'Needs Improvement' | 'Unsatisfactory';
export type ReviewStatus = 'Draft' | 'Completed' | 'Acknowledged';
export type CaseType = 'Disciplinary' | 'Grievance' | 'Investigation' | 'Improvement Plan';
export type CaseStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
export type CaseSeverity = 'Low' | 'Medium' | 'High';
export type ChangeType = 'Promotion' | 'Transfer' | 'Demotion' | 'Role Change' | 'Salary Adjustment';
export type AuditEntityType = 'Employee' | 'Leave' | 'Document' | 'Training' | 'Review' | 'Case';
export type AuditAction = 'Created' | 'Updated' | 'Deleted' | 'Viewed';

/**
 * Main Employee Profile
 * SharePoint List: HR_Employees
 */
export interface Employee {
  id: string | number;
  employeeId: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  fullName?: string; // Computed: firstName + lastName
  gender?: Gender;
  dateOfBirth?: string;
  photoUrl?: string;
  nationalId?: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  department?: string;
  unit?: string;
  jobTitle: string;
  lineManager?: string; // Person field
  lineManagerEmail?: string;
  officeLocation?: string;
  startDate: string;
  endDate?: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  grade?: string;
  payScale?: string;
  costCenter?: string;
  payrollId?: string;
  bankName?: string; // Encrypted
  bankAccount?: string; // Encrypted
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}

/**
 * Leave Balance
 * SharePoint List: HR_LeaveBalances
 */
export interface LeaveBalance {
  id: string | number;
  employeeId: string;
  leaveType: LeaveType;
  year: number;
  entitlement: number;
  used: number;
  pending: number;
  available: number; // Calculated: entitlement - used - pending
  accrualRate?: number;
  lastAccrualDate?: string;
}

/**
 * Leave Request
 * SharePoint List: HR_LeaveRequests
 */
export interface LeaveRequest {
  id: string | number;
  employeeId: string;
  employeeName?: string; // For display
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  status: LeaveRequestStatus;
  stage?: 'Submitted' | 'Manager Review' | 'Director Review' | 'HR Review' | 'Approved' | 'Rejected';
  currentStep?: number;
  approverManager?: string;
  approverDirector?: string;
  approverHR?: string;
  approvedBy?: string;
  approvedByEmail?: string;
  approvedDate?: string;
  managerApprovedDate?: string; // Date when manager approved
  directorApprovedDate?: string; // Date when director approved
  hrApprovedDate?: string; // Date when HR approved
  comments?: string;
  createdDate?: string;
}

/**
 * Employee Document
 * SharePoint List: HR_Documents
 */
export interface EmployeeDocument {
  id: string | number;
  employeeId: string;
  documentType: DocumentType;
  documentName: string;
  fileUrl: string;
  uploadedBy?: string;
  uploadDate?: string;
  expiryDate?: string;
  version: number;
  isActive: boolean;
  notes?: string;
}

/**
 * Training & Certification
 * SharePoint List: HR_Training
 */
export interface Training {
  id: string | number;
  employeeId: string;
  courseName: string;
  provider?: string;
  completionDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  status: TrainingStatus;
  cost?: number;
  notes?: string;
}

/**
 * Performance Review
 * SharePoint List: HR_PerformanceReviews
 */
export interface PerformanceReview {
  id: string | number;
  employeeId: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewType: ReviewType;
  reviewer: string;
  reviewerEmail?: string;
  overallRating: PerformanceRating;
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  employeeComments?: string;
  status: ReviewStatus;
}

/**
 * HR Case (Disciplinary/Grievance)
 * SharePoint List: HR_Cases
 */
export interface HRCase {
  id: string | number;
  employeeId: string;
  caseType: CaseType;
  caseTitle: string;
  description: string;
  dateReported: string;
  reportedBy: string;
  reportedByEmail?: string;
  status: CaseStatus;
  severity?: CaseSeverity;
  resolution?: string;
  resolutionDate?: string;
  isConfidential: boolean;
}

/**
 * Employment History
 * SharePoint List: HR_EmploymentHistory
 */
export interface EmploymentHistory {
  id: string | number;
  employeeId: string;
  changeType: ChangeType;
  previousJobTitle?: string;
  newJobTitle?: string;
  previousDepartment?: string;
  newDepartment?: string;
  previousGrade?: string;
  newGrade?: string;
  effectiveDate: string;
  reason?: string;
  approvedBy?: string;
  approvedByEmail?: string;
}

/**
 * Audit Log Entry
 * SharePoint List: HR_AuditLog
 */
export interface AuditLogEntry {
  id: string | number;
  employeeId: string;
  entityType: AuditEntityType;
  action: AuditAction;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedDate: string;
  ipAddress?: string;
}

/**
 * Comprehensive Employee Profile with related data
 */
export interface EmployeeProfile extends Employee {
  leaveBalances?: LeaveBalance[];
  leaveRequests?: LeaveRequest[];
  documents?: EmployeeDocument[];
  trainings?: Training[];
  performanceReviews?: PerformanceReview[];
  hrCases?: HRCase[];
  employmentHistory?: EmploymentHistory[];
}

/**
 * HR Dashboard Statistics
 */
export interface HRStatistics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  byDepartment: Record<string, number>;
  byEmploymentType: Record<EmploymentType, number>;
  contractsExpiring: number; // In next 90 days
  documentsExpiring: number; // In next 60 days
  certificationsExpiring: number;
  lowLeaveBalance: number; // < 5 days
}

/**
 * Filter state for HR Profiles
 */
export interface HRProfileFilters {
  searchQuery: string;
  department?: string;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
  location?: string;
  manager?: string;
}

/**
 * Document upload metadata
 */
export interface DocumentUploadData {
  employeeId: string;
  documentType: DocumentType;
  documentName: string;
  file: File;
  expiryDate?: string;
  notes?: string;
}

/**
 * Leave request submission data
 */
export interface LeaveRequestSubmission {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  // Additional fields for form submission
  name?: string;
  division?: string;
  unit?: string;
  signature?: string;
}

/**
 * Employee creation/update data
 */
export interface EmployeeFormData {
  employeeId?: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  nationalId?: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  department?: string;
  unit?: string;
  jobTitle: string;
  lineManagerEmail?: string;
  officeLocation?: string;
  startDate: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  grade?: string;
  payScale?: string;
  costCenter?: string;
}

/**
 * Onboarding checklist item
 */
export interface OnboardingItem {
  id: string;
  task: string;
  description?: string;
  responsible: string;
  dueDate?: string;
  completed: boolean;
  completedDate?: string;
  completedBy?: string;
}

/**
 * Offboarding checklist item
 */
export interface OffboardingItem {
  id: string;
  task: string;
  description?: string;
  responsible: string;
  dueDate?: string;
  completed: boolean;
  completedDate?: string;
  completedBy?: string;
}

/**
 * Onboarding process
 */
export interface OnboardingProcess {
  employeeId: string;
  startDate: string;
  completionDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  checklist: OnboardingItem[];
}

/**
 * Offboarding process
 */
export interface OffboardingProcess {
  employeeId: string;
  lastWorkingDay: string;
  completionDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  reason?: string;
  checklist: OffboardingItem[];
}
