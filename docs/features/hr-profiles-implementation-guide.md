# HR Profiles - Implementation Guide

## Overview

A comprehensive HR Profiles module for the SCPNG Intranet that provides complete employee management functionality with SharePoint as the backend storage.

## What Has Been Built

### 1. SharePoint List Structure
**File**: `docs/features/hr-profiles-sharepoint-structure.md`

Complete SharePoint list schema including:
- 9 SharePoint lists (Employees, Leave Balances, Leave Requests, Documents, Training, Performance Reviews, HR Cases, Employment History, Audit Log)
- Document library structure
- Field definitions with proper types
- Security and permissions model
- Views and filters
- Integration notes

### 2. TypeScript Type Definitions
**File**: `src/types/hr.ts`

Comprehensive type system including:
- `Employee` - Main employee profile
- `EmployeeProfile` - Complete profile with related data
- `LeaveBalance` & `LeaveRequest` - Leave management
- `EmployeeDocument` - Document metadata
- `Training` - Training and certifications
- `PerformanceReview` - Performance reviews
- `HRCase` - HR cases (disciplinary, grievances)
- `EmploymentHistory` - Job changes and promotions
- `AuditLogEntry` - Audit trail
- `HRStatistics` - Dashboard statistics
- Enums for all choice fields (EmploymentType, EmploymentStatus, etc.)

**Key Feature**: Employment types are explicitly defined:
- Permanent
- Contract
- Casual
- Temporary
- Intern
- Consultant
- Agency

### 3. SharePoint Service Layer
**File**: `src/services/hrSharePointService.ts`

Complete CRUD operations for:
- Employee management (create, read, update)
- Leave operations (balances, requests, submissions)
- Document management
- Training records
- Performance reviews
- Employment history
- HR statistics
- Audit logging

Features:
- Automatic initialization with site and list IDs
- Filtering and search capabilities
- Error handling
- TypeScript type safety
- Comprehensive employee profile retrieval
- **Client-side filtering for EmployeeID** - Avoids SharePoint indexed column requirement by fetching all items and filtering in-memory
- Client-side sorting for date-based queries

### 4. React Hook for HR Service
**File**: `src/hooks/useHRService.ts`

Custom React hook providing:
- MSAL authentication integration
- Microsoft Graph client setup
- Service initialization
- Employee CRUD operations
- Leave management
- Statistics fetching
- Loading states
- Error handling
- Toast notifications

### 5. HR Profiles Page
**File**: `src/pages/HRProfiles.tsx`

Main interface featuring:
- **Statistics Dashboard**: Total employees, active, on leave, contracts expiring
- **Advanced Search & Filters**:
  - Full-text search (name, email, employee ID, position, department)
  - Employment status filter
  - Employment type filter
  - Department filter
  - Location filter
- **Employee Cards Grid**: Responsive grid showing employee cards
- **Pagination**: 25 items per page with navigation
- **Loading States**: Skeleton loaders
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-friendly layout

Employee Card Features:
- Profile photo with fallback to avatar
- Full name and job title
- Employee ID
- Status and employment type badges
- Department badge
- Contact information (email, phone, location)
- Start date
- "View Full Profile" button

### 6. Employee Profile Modal
**File**: `src/components/hr/EmployeeProfileModal.tsx`

Comprehensive employee detail view with 6 tabs:

#### **Summary Tab**
- Profile photo and header
- Employment status badges
- Contact information (email, phone, mobile, address)
- Employment details (department, unit, manager, start date, grade, pay scale)
- Emergency contact information

#### **Leave Tab**
- Leave balances by type (Annual, Sick, Special, etc.)
- Balance cards showing entitlement, used, pending, available
- Low balance warnings (< 5 days)
- Leave request history with status
- Approval information

#### **Documents Tab**
- List of all employee documents
- Document type badges
- Upload and expiry dates
- Download/view links
- Document notes

#### **Training Tab**
- Training courses and certifications
- Provider information
- Completion and expiry dates
- Status badges (Current, Expired, Pending Renewal)
- Certificate download links

#### **Performance Tab**
- Performance review history
- Review period and type
- Overall rating badges
- Strengths and areas for improvement
- Goals and objectives
- Reviewer information

#### **History Tab**
- Employment history timeline
- Job changes (promotions, transfers, etc.)
- Previous and new positions
- Effective dates
- Change reasons

### 7. HR Data Importer
**Files**:
- `src/components/hr/HRDataImporter.tsx`
- `src/data/hrImportData.ts`

One-click data import functionality featuring:
- **Pre-loaded Employee Data**: 41 real SCPNG employees from Microsoft Graph
- **Progress Tracking**: Real-time progress bar during import
- **Success/Error Reporting**: Detailed results showing successful and failed imports
- **Rate Limiting**: 500ms delay between imports to avoid SharePoint throttling
- **Initialization Check**: Waits for HR service to be ready before enabling import
- **Import Dialog**: Accessible from HR Profiles page header

Employee Data Structure:
- Employee IDs: EMP001 - EMP041
- All divisions and units from SCPNG organization
- Contact information (email, phone, mobile)
- Job titles and employment status
- Office locations and departments

## File Structure

```
unitopia-hub/
├── docs/
│   └── features/
│       ├── hr-profiles-sharepoint-structure.md
│       └── hr-profiles-implementation-guide.md
├── src/
│   ├── components/
│   │   └── hr/
│   │       ├── EmployeeProfileModal.tsx
│   │       └── HRDataImporter.tsx
│   ├── data/
│   │   └── hrImportData.ts
│   ├── hooks/
│   │   └── useHRService.ts
│   ├── pages/
│   │   └── HRProfiles.tsx
│   ├── services/
│   │   └── hrSharePointService.ts
│   └── types/
│       └── hr.ts
```

## Setup Instructions

### 1. Create SharePoint Lists

All columns should be created as **Single line of text** for easy syncing. Create the lists in this order:

#### 1. HR_Employees

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| FirstName | Single line of text | Yes |
| LastName | Single line of text | Yes |
| PreferredName | Single line of text | No |
| Gender | Single line of text | No |
| DateOfBirth | Single line of text | No |
| PhotoURL | Single line of text | No |
| NationalID | Single line of text | No |
| Email | Single line of text | Yes |
| Phone | Single line of text | No |
| MobilePhone | Single line of text | No |
| Address | Single line of text | No |
| EmergencyContactName | Single line of text | No |
| EmergencyContactPhone | Single line of text | No |
| EmergencyContactRelation | Single line of text | No |
| Department | Single line of text | No |
| Unit | Single line of text | No |
| JobTitle | Single line of text | Yes |
| LineManager | Single line of text | No |
| LineManagerEmail | Single line of text | No |
| OfficeLocation | Single line of text | No |
| StartDate | Single line of text | Yes |
| EndDate | Single line of text | No |
| EmploymentStatus | Single line of text | Yes |
| EmploymentType | Single line of text | Yes |
| Grade | Single line of text | No |
| PayScale | Single line of text | No |
| CostCenter | Single line of text | No |
| PayrollID | Single line of text | No |
| BankName | Single line of text | No |
| BankAccount | Single line of text | No |

#### 2. HR_LeaveBalances

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| LeaveType | Single line of text | Yes |
| Year | Single line of text | Yes |
| Entitlement | Single line of text | Yes |
| Used | Single line of text | Yes |
| Pending | Single line of text | Yes |
| Available | Single line of text | Yes |
| AccrualRate | Single line of text | No |
| LastAccrualDate | Single line of text | No |

#### 3. HR_LeaveRequests

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| EmployeeName | Single line of text | No |
| LeaveType | Single line of text | Yes |
| StartDate | Single line of text | Yes |
| EndDate | Single line of text | Yes |
| DaysRequested | Single line of text | Yes |
| Reason | Single line of text | No |
| Status | Single line of text | Yes |
| ApprovedBy | Single line of text | No |
| ApprovedByEmail | Single line of text | No |
| ApprovedDate | Single line of text | No |
| Comments | Single line of text | No |
| CreatedDate | Single line of text | No |

#### 4. HR_Documents

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| DocumentType | Single line of text | Yes |
| DocumentName | Single line of text | Yes |
| FileURL | Single line of text | Yes |
| UploadedBy | Single line of text | No |
| UploadDate | Single line of text | No |
| ExpiryDate | Single line of text | No |
| Version | Single line of text | Yes |
| IsActive | Single line of text | Yes |
| Notes | Single line of text | No |

#### 5. HR_Training

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| CourseName | Single line of text | Yes |
| Provider | Single line of text | No |
| CompletionDate | Single line of text | Yes |
| ExpiryDate | Single line of text | No |
| CertificateURL | Single line of text | No |
| Status | Single line of text | Yes |
| Cost | Single line of text | No |
| Notes | Single line of text | No |

#### 6. HR_PerformanceReviews

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| ReviewPeriod | Single line of text | Yes |
| ReviewDate | Single line of text | Yes |
| ReviewType | Single line of text | Yes |
| Reviewer | Single line of text | Yes |
| ReviewerEmail | Single line of text | No |
| OverallRating | Single line of text | Yes |
| Strengths | Single line of text | No |
| AreasForImprovement | Single line of text | No |
| Goals | Single line of text | No |
| EmployeeComments | Single line of text | No |
| Status | Single line of text | Yes |

#### 7. HR_Cases

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| CaseType | Single line of text | Yes |
| CaseTitle | Single line of text | Yes |
| Description | Single line of text | Yes |
| DateReported | Single line of text | Yes |
| ReportedBy | Single line of text | Yes |
| ReportedByEmail | Single line of text | No |
| Status | Single line of text | Yes |
| Severity | Single line of text | No |
| Resolution | Single line of text | No |
| ResolutionDate | Single line of text | No |
| IsConfidential | Single line of text | Yes |

#### 8. HR_EmploymentHistory

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| ChangeType | Single line of text | Yes |
| PreviousJobTitle | Single line of text | No |
| NewJobTitle | Single line of text | No |
| PreviousDepartment | Single line of text | No |
| NewDepartment | Single line of text | No |
| PreviousGrade | Single line of text | No |
| NewGrade | Single line of text | No |
| EffectiveDate | Single line of text | Yes |
| Reason | Single line of text | No |
| ApprovedBy | Single line of text | No |
| ApprovedByEmail | Single line of text | No |

#### 9. HR_AuditLog

| Column Name | Type | Required |
|------------|------|----------|
| EmployeeID | Single line of text | Yes |
| EntityType | Single line of text | Yes |
| Action | Single line of text | Yes |
| FieldChanged | Single line of text | No |
| OldValue | Single line of text | No |
| NewValue | Single line of text | No |
| ChangedBy | Single line of text | No |
| ChangedDate | Single line of text | Yes |
| IPAddress | Single line of text | No |

---

### Common Field Values Reference

**EmploymentStatus values:**
- Active
- On Leave
- Terminated
- Retired

**EmploymentType values:**
- Permanent
- Contract
- Casual
- Temporary
- Intern
- Consultant
- Agency

**LeaveType values:**
- Annual
- Sick
- Special
- Maternity
- Paternity
- Unpaid
- Compassionate

**Leave Status values:**
- Pending
- Approved
- Declined
- Cancelled

**DocumentType values:**
- CV
- Contract
- ID Copy
- Qualification
- Police Check
- Visa
- Medical
- Certificate
- Other

### 2. Create Document Library

Create **HR_Documents** library with folder structure:
```
/HR_Documents
  /{EmployeeID}
    /Contracts
    /CVs
    /Qualifications
    /ID_Copies
    /Police_Checks
    /Medical
    /Certifications
    /Other
```

### 3. Configure Permissions

Set up SharePoint permissions:
- **HR Admins**: Full Control
- **HR Officers**: Edit (restricted to division)
- **Managers**: Read (own team only)
- **Employees**: Read (own profile only)

### 4. Update MSAL Permissions

Ensure your Azure AD app registration has:
- `Sites.ReadWrite.All`
- `Files.ReadWrite.All`
- `User.Read.All`

### 5. Add Sample Data

Add test employees to verify:
1. List creation and relationships
2. Data retrieval via Graph API
3. UI rendering
4. Search and filters

## Usage

### Accessing HR Profiles

Navigate to `/hr-profiles` in your intranet.

### Viewing Employee Profiles

1. Use search bar to find employees
2. Apply filters for department, status, type, location
3. Click on employee card to view full profile
4. Navigate through tabs to see detailed information

### Adding New Employees

Click "Add Employee" button (functionality to be implemented):
- Fill in employee form
- Upload documents
- Set up leave balances
- Assign to department/unit

## Features Not Yet Implemented

The following features are planned but not yet implemented:

### 1. Add/Edit Employee Form
Create form dialogs for:
- Adding new employees
- Editing employee information
- Bulk import from CSV/Excel

### 2. Document Upload
Implement document upload functionality:
- Direct upload to SharePoint HR_Documents library
- File type validation
- Virus scanning integration
- Version control

### 3. Leave Request Submission
Employee self-service for:
- Submitting leave requests
- Viewing approval status
- Canceling pending requests

### 4. Leave Approval Workflow
Manager interface for:
- Reviewing pending leave requests
- Approving/declining requests
- Adding comments
- Email notifications

### 5. Performance Review Management
HR tools for:
- Creating review templates
- Scheduling reviews
- Tracking completion
- Employee acknowledgment

### 6. Onboarding/Offboarding
Workflows for:
- New employee onboarding checklist
- Asset assignment
- Access provisioning
- Exit procedures

### 7. Reporting & Analytics
Dashboard and reports:
- Headcount reports
- Leave liability
- Training compliance
- Performance summaries
- Export to Excel

### 8. Notifications & Reminders
Automated alerts for:
- Document expiry (60 days before)
- Contract expiry (90 days before)
- Certification renewal
- Probation period ending
- Low leave balance

### 9. Role-Based Access Control
Fine-grained permissions:
- HR admin vs HR officer views
- Manager access to team only
- Employee self-service limits
- Payroll data encryption

### 10. Audit Trail Viewer
UI for:
- Viewing audit logs
- Filtering by date, user, action
- Compliance reporting
- Export audit data

### 11. Advanced Search
Enhanced search with:
- Skills and qualifications
- Custom fields
- Date ranges
- Boolean operators
- Saved searches

### 12. Integration Features
Connect with other systems:
- Payroll system sync
- Calendar integration for leave
- Email/SMS notifications
- SSO with Azure AD
- Export to HR systems

## API Reference

### useHRService Hook

```typescript
const {
  isInitialized,      // Service ready
  isLoading,          // Operation in progress
  error,              // Error message
  fetchEmployees,     // Get all employees
  fetchEmployeeById,  // Get single employee
  fetchEmployeeProfile, // Get full profile
  createEmployee,     // Create new employee
  updateEmployee,     // Update employee
  fetchLeaveBalances, // Get leave balances
  fetchLeaveRequests, // Get leave requests
  submitLeaveRequest, // Submit leave request
  fetchStatistics,    // Get HR statistics
} = useHRService();
```

### Service Methods

```typescript
// Get employees with filters
const employees = await hrService.getEmployees({
  status: 'Active',
  department: 'IT',
  employmentType: 'Permanent'
});

// Get full employee profile
const profile = await hrService.getEmployeeProfile('EMP001');

// Create employee
const newEmployee = await hrService.createEmployee({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@scpng.com',
  jobTitle: 'Software Engineer',
  startDate: '2025-01-01',
  employmentStatus: 'Active',
  employmentType: 'Permanent',
  department: 'IT'
});

// Submit leave request
const request = await hrService.submitLeaveRequest({
  employeeId: 'EMP001',
  leaveType: 'Annual',
  startDate: '2025-02-01',
  endDate: '2025-02-05',
  daysRequested: 5,
  reason: 'Family vacation'
});
```

## Customization

### Adding New Fields

1. Add field to SharePoint list
2. Update TypeScript type in `src/types/hr.ts`
3. Update mapping in `hrSharePointService.ts`
4. Add to UI in `HRProfiles.tsx` or `EmployeeProfileModal.tsx`

### Custom Employment Types

Edit the `EmploymentType` enum in `src/types/hr.ts`:

```typescript
export type EmploymentType =
  | 'Permanent'
  | 'Contract'
  | 'Casual'
  | 'Temporary'
  | 'Intern'
  | 'Consultant'
  | 'Agency'
  | 'YourCustomType';  // Add here
```

### Custom Leave Types

Update `LeaveType` enum and SharePoint choice field:

```typescript
export type LeaveType =
  | 'Annual'
  | 'Sick'
  | 'Special'
  | 'Maternity'
  | 'Paternity'
  | 'Unpaid'
  | 'Compassionate'
  | 'YourCustomLeave';  // Add here
```

### Styling

The system uses your existing theme:
- Primary color: `#600018` (maroon/burgundy)
- Secondary color: `#8B0000`
- Tailwind CSS for styling
- shadcn/ui components

## Security Considerations

### Data Protection
- Sensitive fields (NationalID, BankAccount) should be encrypted
- Payroll data restricted to authorized users
- HR cases marked as confidential
- Audit logs for compliance

### Access Control
- Implement item-level permissions in SharePoint
- Use SharePoint security groups
- Row-level security for sensitive data
- API permissions properly scoped

### Compliance
- GDPR/data privacy compliance
- Employee consent logging
- Data retention policies (7 years for terminated employees)
- Right to access/delete personal data

## Troubleshooting

### Service Not Initializing
- Check MSAL authentication
- Verify SharePoint site path
- Ensure Graph API permissions granted
- Check network connectivity

### Data Not Loading
- Verify SharePoint lists exist
- Check list names match exactly
- Ensure user has read permissions
- Check browser console for errors

### Documents Not Displaying
- Verify HR_Documents library exists
- Check document URLs are accessible
- Ensure file permissions correct
- Verify firewall rules

### ❌ FIXED: "Field 'EmployeeID' cannot be referenced in filter or orderby"

**Problem**: SharePoint requires indexed columns for filtering on large lists. The service was attempting to filter by `EmployeeID` field which wasn't indexed, causing the error:
```
Field 'EmployeeID' cannot be referenced in filter or orderby as it is not indexed.
Provide the 'Prefer: HonorNonIndexedQueriesWarningMayFailRandomly' header to allow this.
```

**Solution Implemented**:
- Created helper function `getItemsByEmployeeId()` that fetches all items from the list and filters by `EmployeeID` client-side
- Updated all methods that query by EmployeeID:
  - `getEmployeeById()`
  - `getLeaveBalances()`
  - `getLeaveRequests()`
  - `getDocuments()`
  - `getTraining()`
  - `getPerformanceReviews()`
  - `getEmploymentHistory()`
- Replaced server-side `orderby()` with client-side sorting
- For additional filters (like `IsActive`), these are still applied server-side to reduce data transfer

**Performance Note**: This workaround is suitable for small to medium datasets (< 5000 employees). For larger datasets, you should:
1. Index the `EmployeeID` column in SharePoint (Settings → List Settings → Columns → EmployeeID → Index this column)
2. Or use SharePoint Search API for better performance

### ❌ FIXED: "HR Service not initialized" Error

**Problem**: Modal and importer components were trying to use the HR service before it finished initializing, causing "HR Service not initialized" toast errors.

**Solution Implemented**:
- Updated `EmployeeProfileModal` to check `isInitialized` state before loading profiles
- Added initialization dependency to useEffect
- Updated loading message to show "Initializing HR Service..." vs "Loading Employee Profile..."
- Updated `HRDataImporter` to disable import button until service is initialized
- Shows "Initializing HR Service..." button text while waiting

## Performance Optimization

### Current Implementation
- Pagination (25 items per page)
- Lazy loading of profile details
- Client-side filtering for instant feedback
- Skeleton loaders for UX

### Future Optimizations
- Implement virtual scrolling for large datasets
- Add caching with React Query
- Optimize Graph API queries with $select
- Implement search indexing
- Use SharePoint search API for large datasets

## Testing Checklist

Before deployment:

- [ ] All SharePoint lists created
- [ ] Sample data added
- [ ] Permissions configured
- [ ] Authentication working
- [ ] Employee search functional
- [ ] Filters working correctly
- [ ] Profile modal displays all tabs
- [ ] Pagination working
- [ ] Mobile responsive
- [ ] Error handling tested
- [ ] Loading states correct
- [ ] Statistics accurate
- [ ] Document links working
- [ ] Audit logging enabled

## Support & Maintenance

### Regular Tasks
- **Daily**: Monitor error logs
- **Weekly**: Review audit logs
- **Monthly**: Check data quality
- **Quarterly**: Update documentation
- **Annually**: Review access permissions

### Backup Strategy
- SharePoint automatic versioning enabled
- Regular site collection backups
- Document library backups
- Export critical data monthly

## Next Steps

1. **Test with real data**: Import actual employee records
2. **Implement missing features**: Start with add/edit employee
3. **Set up workflows**: Leave approval workflow
4. **Configure notifications**: Document expiry alerts
5. **Train HR staff**: User training sessions
6. **Roll out gradually**: Pilot with one department
7. **Gather feedback**: Iterate based on user input
8. **Full deployment**: Organization-wide launch

## Conclusion

You now have a solid foundation for an HR Profiles system with:
- ✅ Complete data model (9 SharePoint lists)
- ✅ SharePoint integration with Microsoft Graph
- ✅ Service layer with full CRUD operations
- ✅ Client-side filtering to avoid indexing requirements
- ✅ React hook for easy consumption
- ✅ Professional UI with search/filters
- ✅ Comprehensive employee profiles with 6-tab modal
- ✅ One-click data importer (41 real SCPNG employees)
- ✅ Mobile-responsive design
- ✅ Type-safe TypeScript implementation
- ✅ Proper initialization handling
- ✅ Error handling and loading states

**Current Status**:
- All 9 SharePoint lists created and configured
- 41 employees imported from real SCPNG data
- System tested and working with actual SharePoint backend
- Bug fixes completed for indexing and initialization issues

The system is **production-ready** for basic HR profile viewing. You can now proceed with implementing advanced features like employee add/edit forms, leave request workflows, and document uploads.
