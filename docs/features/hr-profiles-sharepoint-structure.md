# HR Profiles - SharePoint List Structure

## Overview
This document outlines the SharePoint list structure for the HR Profiles module. All employee data will be stored in SharePoint lists with proper relationships.

## SharePoint Site
- **Site Path**: `/sites/scpngintranet`
- **Document Libraries**:
  - `HR Documents` - For storing employee documents (CVs, contracts, certificates, etc.)

## SharePoint Lists

### 1. Employees (Main Profile List)
**List Name**: `HR_Employees`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated SharePoint ID |
| EmployeeID | Single Line Text | Yes | Unique employee identifier |
| FirstName | Single Line Text | Yes | Employee first name |
| LastName | Single Line Text | Yes | Employee last name |
| PreferredName | Single Line Text | No | Preferred/nickname |
| Gender | Choice | No | Male, Female, Other, Prefer not to say |
| DateOfBirth | Date | No | Birth date |
| PhotoURL | Hyperlink | No | Link to profile photo |
| NationalID | Single Line Text | No | National ID or Passport |
| Email | Single Line Text | Yes | Primary email (indexed) |
| Phone | Single Line Text | No | Primary phone number |
| MobilePhone | Single Line Text | No | Mobile number |
| Address | Multiple Lines Text | No | Residential address |
| EmergencyContactName | Single Line Text | No | Emergency contact name |
| EmergencyContactPhone | Single Line Text | No | Emergency contact phone |
| EmergencyContactRelation | Single Line Text | No | Relationship to employee |
| Department | Single Line Text | No | Department/division |
| Unit | Single Line Text | No | Unit/team |
| JobTitle | Single Line Text | Yes | Current position |
| LineManager | Person or Group | No | Reporting manager |
| OfficeLocation | Single Line Text | No | Office/location |
| StartDate | Date | Yes | Employment start date |
| EndDate | Date | No | Employment end date (if applicable) |
| EmploymentStatus | Choice | Yes | Active, On Leave, Terminated, Retired |
| EmploymentType | Choice | Yes | Permanent, Contract, Casual, Temporary, Intern, Consultant, Agency |
| Grade | Single Line Text | No | Pay grade |
| PayScale | Single Line Text | No | Pay scale/band |
| CostCenter | Single Line Text | No | Cost center code |
| PayrollID | Single Line Text | No | Payroll system ID |
| BankName | Single Line Text | No | Bank name (encrypted in production) |
| BankAccount | Single Line Text | No | Account number (encrypted) |
| CreatedDate | Date Time | Auto | Record creation date |
| ModifiedDate | Date Time | Auto | Last modification date |
| CreatedBy | Person or Group | Auto | Created by user |
| ModifiedBy | Person or Group | Auto | Last modified by user |

**EmploymentType Values (Explicit):**
- `Permanent` - Full-time or part-time permanent staff
- `Contract` - Fixed-term contract employees
- `Casual` - Casual employees (as-needed basis)
- `Temporary` - Temporary employees (short-term coverage)
- `Intern` - Interns and trainees
- `Consultant` - Independent consultants
- `Agency` - Staff hired through recruitment agencies

### 2. Leave Balances
**List Name**: `HR_LeaveBalances`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| LeaveType | Choice | Yes | Annual, Sick, Special, Maternity, Paternity, Unpaid, Compassionate |
| Year | Number | Yes | Calendar year |
| Entitlement | Number | Yes | Total days entitled |
| Used | Number | Yes | Days used |
| Pending | Number | Yes | Days pending approval |
| Available | Calculated | Yes | Entitlement - Used - Pending |
| AccrualRate | Number | No | Days accrued per month |
| LastAccrualDate | Date | No | Last accrual calculation date |

### 3. Leave Requests
**List Name**: `HR_LeaveRequests`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| LeaveType | Choice | Yes | Annual, Sick, Special, etc. |
| StartDate | Date | Yes | Leave start date |
| EndDate | Date | Yes | Leave end date |
| DaysRequested | Number | Yes | Number of days |
| Reason | Multiple Lines Text | No | Reason for leave |
| Status | Choice | Yes | Pending, Approved, Declined, Cancelled |
| ApprovedBy | Person or Group | No | Manager who approved |
| ApprovedDate | Date | No | Approval date |
| Comments | Multiple Lines Text | No | Approver comments |
| CreatedDate | Date Time | Auto | Request creation date |

### 4. Employee Documents
**List Name**: `HR_Documents`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| DocumentType | Choice | Yes | CV, Contract, ID Copy, Qualification, Police Check, Visa, Medical, Certificate, Other |
| DocumentName | Single Line Text | Yes | Document name/description |
| FileURL | Hyperlink | Yes | Link to document in HR Documents library |
| UploadedBy | Person or Group | Auto | User who uploaded |
| UploadDate | Date Time | Auto | Upload date |
| ExpiryDate | Date | No | Document expiry date |
| Version | Number | Yes | Document version |
| IsActive | Yes/No | Yes | Active document flag |
| Notes | Multiple Lines Text | No | Additional notes |

### 5. Training & Certifications
**List Name**: `HR_Training`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| CourseName | Single Line Text | Yes | Training course name |
| Provider | Single Line Text | No | Training provider |
| CompletionDate | Date | Yes | Date completed |
| ExpiryDate | Date | No | Certification expiry |
| CertificateURL | Hyperlink | No | Link to certificate |
| Status | Choice | Yes | Current, Expired, Pending Renewal |
| Cost | Currency | No | Training cost |
| Notes | Multiple Lines Text | No | Additional notes |

### 6. Performance Reviews
**List Name**: `HR_PerformanceReviews`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| ReviewPeriod | Single Line Text | Yes | E.g., "2024 Q1" |
| ReviewDate | Date | Yes | Review date |
| ReviewType | Choice | Yes | Annual, Mid-Year, Probation, Ad-hoc |
| Reviewer | Person or Group | Yes | Reviewing manager |
| OverallRating | Choice | Yes | Exceeds, Meets, Needs Improvement, Unsatisfactory |
| Strengths | Multiple Lines Text | No | Key strengths |
| AreasForImprovement | Multiple Lines Text | No | Improvement areas |
| Goals | Multiple Lines Text | No | Goals for next period |
| EmployeeComments | Multiple Lines Text | No | Employee feedback |
| Status | Choice | Yes | Draft, Completed, Acknowledged |

### 7. HR Cases (Disciplinary & Grievances)
**List Name**: `HR_Cases`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| CaseType | Choice | Yes | Disciplinary, Grievance, Investigation, Improvement Plan |
| CaseTitle | Single Line Text | Yes | Brief title |
| Description | Multiple Lines Text | Yes | Case description |
| DateReported | Date | Yes | Date case was reported |
| ReportedBy | Person or Group | Yes | Person who reported |
| Status | Choice | Yes | Open, Under Investigation, Resolved, Closed |
| Severity | Choice | No | Low, Medium, High |
| Resolution | Multiple Lines Text | No | Resolution details |
| ResolutionDate | Date | No | Date resolved |
| IsConfidential | Yes/No | Yes | Confidentiality flag |

### 8. Employment History
**List Name**: `HR_EmploymentHistory`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| ChangeType | Choice | Yes | Promotion, Transfer, Demotion, Role Change, Salary Adjustment |
| PreviousJobTitle | Single Line Text | No | Previous position |
| NewJobTitle | Single Line Text | No | New position |
| PreviousDepartment | Single Line Text | No | Previous department |
| NewDepartment | Single Line Text | No | New department |
| PreviousGrade | Single Line Text | No | Previous grade |
| NewGrade | Single Line Text | No | New grade |
| EffectiveDate | Date | Yes | Change effective date |
| Reason | Multiple Lines Text | No | Reason for change |
| ApprovedBy | Person or Group | No | Approving authority |

### 9. Audit Log
**List Name**: `HR_AuditLog`

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| ID | Counter | Yes | Auto-generated ID |
| EmployeeID | Lookup | Yes | Link to HR_Employees.EmployeeID |
| EntityType | Choice | Yes | Employee, Leave, Document, Training, Review, Case |
| Action | Choice | Yes | Created, Updated, Deleted, Viewed |
| FieldChanged | Single Line Text | No | Field name changed |
| OldValue | Multiple Lines Text | No | Previous value |
| NewValue | Multiple Lines Text | No | New value |
| ChangedBy | Person or Group | Auto | User who made change |
| ChangedDate | Date Time | Auto | Change timestamp |
| IPAddress | Single Line Text | No | User IP address |

## SharePoint Library Structure

### HR Documents Library
**Library Name**: `HR_Documents`

**Folder Structure**:
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

**Metadata Columns**:
- EmployeeID (Lookup)
- DocumentType (Choice)
- ExpiryDate (Date)
- Version (Number)
- IsActive (Yes/No)

## Permissions & Security

### List-Level Permissions:
1. **HR Admins**: Full Control
2. **HR Officers**: Edit, Delete (restricted to their division)
3. **Managers**: Read (employees in their team)
4. **Employees**: Read (own profile only)

### Field-Level Security (via views):
- Payroll information visible only to HR Admins and Payroll team
- Disciplinary cases visible only to HR Admins and relevant managers
- Personal information (NationalID, Bank details) encrypted and restricted

## Views to Create

### Employees List Views:
1. **All Active Employees** - Default view
2. **By Department** - Grouped by department
3. **By Employment Type** - FT, PT, Contract
4. **Probation Ending Soon** - Employees nearing probation end
5. **Contract Expiring** - Contracts expiring in next 90 days
6. **HR Admin View** - All fields including sensitive data

### Leave Balances Views:
1. **Current Year Balances** - This year's balances
2. **Low Balance Alert** - Employees with < 5 days leave
3. **By Leave Type** - Grouped by leave type

### Documents Views:
1. **Expiring Soon** - Documents expiring in 60 days
2. **By Employee** - Grouped by employee
3. **By Document Type** - Grouped by type

## Integration Notes

### API Access:
- Use Microsoft Graph API for CRUD operations
- Endpoint: `/sites/{site-id}/lists/{list-id}/items`
- Authentication: MSAL with delegated permissions

### Required Graph API Permissions:
- `Sites.Read.All`
- `Sites.ReadWrite.All` (for admins)
- `Files.Read.All`
- `Files.ReadWrite.All` (for document uploads)
- `User.Read.All` (for looking up users)

### Data Retention:
- Active employees: Indefinite
- Terminated employees: 7 years (legal requirement)
- Audit logs: 3 years
- Performance reviews: 5 years
- Leave records: 3 years after employment end

## Implementation Steps

1. **Create SharePoint Lists** (in order):
   - HR_Employees (master list)
   - HR_LeaveBalances
   - HR_LeaveRequests
   - HR_Documents
   - HR_Training
   - HR_PerformanceReviews
   - HR_Cases
   - HR_EmploymentHistory
   - HR_AuditLog

2. **Create Document Library**:
   - HR_Documents with folder structure

3. **Configure Permissions**:
   - Set up permission groups
   - Configure list-level permissions
   - Set up item-level permissions (employees can only see their own data)

4. **Create Views**:
   - Create all views listed above

5. **Set up Lookups**:
   - Configure lookup columns to link lists

6. **Test Data Entry**:
   - Add sample employee records
   - Test relationships and lookups

## Migration Plan

If migrating from existing system:
1. Export data from current system
2. Clean and format data
3. Import employees first (master data)
4. Import related records (leave, documents, etc.)
5. Verify relationships and data integrity
6. Run audit report

## Maintenance

### Regular Tasks:
- **Daily**: Audit log review
- **Weekly**: Document expiry checks
- **Monthly**: Leave accrual calculations
- **Quarterly**: Data quality review
- **Annually**: Archive terminated employee records
