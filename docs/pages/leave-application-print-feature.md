# Leave Application Print Feature

## Overview
The Leave Application system now includes a **Print to Paper Format** feature that allows users to generate a printable version of their leave applications in the official paper form format. The system automatically fills in manager and director designations and approval dates based on the workflow approval status and the employee's department.

## Features

### 1. Print Button
- Located on each leave application card in the "My Applications" tab
- Available for all leave applications regardless of status (Pending, Approved, Rejected)
- Easily accessible next to the Request ID

### 2. Print Preview Modal
When the "Print Form" button is clicked:
- Opens a modal dialog with a full preview of the paper format
- Shows the leave application formatted exactly as it would appear on paper
- Includes all official sections:
  - Section A: Applicant Information
  - Section B: Manager Approval
  - Section C: Director Approval
  - Section D: HR Division (with leave deductions table)
  - Remarks section with leave balance information

### 3. Auto-populated Data
The printable form automatically includes:
- **Applicant Information:**
  - Payroll Number
  - Name
  - Division
  - Unit
  - Leave dates and duration
  - Reason for leave
  - Selected leave type (checkbox marked)
  - Submission date

- **Manager Approval Section (Auto-filled when approved):**
  - Manager's signature/name (from SharePoint workflow)
  - Designation (auto-mapped based on department - e.g., "Manager IT" for IT department)
  - Approval date (from SharePoint "Manager Approval Date" column)

- **Director Approval Section (Auto-filled when approved):**
  - Director's signature/name (from SharePoint workflow)
  - Designation (auto-mapped based on department - e.g., "Director Corporate Service" for IT department)
  - Approval date (from SharePoint "Director Approval Date" column)

- **Leave Balance Information:**
  - Entitlement
  - Used days
  - Available days
  - Pending days

- **Application Metadata:**
  - Current status (Pending/Approved/Rejected)
  - Current stage in approval workflow
  - Request ID
  - Print date and time

### 4. Print Functionality
- Click "Print" button to open the browser's print dialog
- **Single A4 page** - Entire form fits on one page with optimized spacing
- Professional formatting with proper margins (10mm page margins)
- Includes SCPNG logo and official header
- Clean print layout (removes unnecessary UI elements)
- Compact fonts (9pt print, 10pt screen) for maximum content density
- Properly aligned columns for signatures, designations, and dates

## How to Use

### For Employees:
1. Navigate to **Forms > Leave Application**
2. Click on the **"My Applications"** tab
3. Find the leave application you want to print
4. Click the **"Print Form"** button on the application card
5. Review the preview in the modal
6. Click **"Print"** to open the print dialog
7. Select your printer and print settings
8. Click "Print" to generate the physical document

### Use Cases:
- **Physical Records:** Print for manual filing and record-keeping
- **Manager Signatures:** Print for physical signatures from managers/directors
- **Backup Documentation:** Keep hard copies as backup
- **HR Processing:** Submit physical forms to HR when required

## Technical Details

### Components
- **PrintableLeaveForm.tsx:** Core component that renders the paper format with smart approval detection
- **PrintLeaveApplicationModal.tsx:** Modal wrapper with print functionality
- **LeaveApplicationPage.tsx:** Main page with integrated print button
- **departmentDesignations.ts:** Utility for mapping departments to manager/director titles

### Department-Based Designation Mapping
The system uses intelligent mapping to auto-fill designations:

**IT Department:**
- Manager: "Manager IT"
- Director: "Director Corporate Service"

**HR Department:**
- Manager: "Manager HR"
- Director: "Director Corporate Service"

**Finance Department:**
- Manager: "Manager Finance"
- Director: "Director Corporate Service"

**Operations Department:**
- Manager: "Manager Operations"
- Director: "Director Operations"

See [departmentDesignations.ts](../../src/utils/departmentDesignations.ts) for full mapping configuration.

### Approval Detection Logic
- **Manager Section:** Populated when `currentStep >= 3` (Director Review stage or beyond)
- **Director Section:** Populated when `currentStep >= 4` (HR Review stage or beyond)
- Names pulled from: `Approver_Manager` and `Approver_Director` SharePoint fields
- Dates pulled from: `Manager Approval Date` and `Director Approval Date` SharePoint columns

### Styling
- Uses CSS print media queries for optimal print output (@page directive)
- Responsive design ensures correct sizing on paper (A4 210mm × 297mm)
- Print-specific styles hide UI elements not needed on paper
- Compact layout with reduced margins and font sizes for single-page printing
- Column-based layout with headers above values for clean alignment

### Data Sources
The printable form pulls data from:
- **SharePoint "Staff Leave Requests" List:**
  - Leave request details (dates, type, reason, status)
  - Approver names (`Approver_Manager`, `Approver_Director`)
  - Approval dates (`Manager Approval Date`, `Director Approval Date`)
  - Workflow stage (`CurrentStep`, `Stage`)
- **Microsoft Graph API:**
  - Employee profile (name, division, department)
  - Department for designation mapping
- **SharePoint "HR_LeaveBalances" List:**
  - Leave balance information

## SharePoint List Configuration

For the approval features to work correctly, ensure your SharePoint "Staff Leave Requests" list has these columns:

| Column Name | Type | Description |
|------------|------|-------------|
| `Approver_Manager` | Text | Name of manager who approved |
| `Approver_Director` | Text | Name of director who approved |
| `Manager Approval Date` | Date | When manager approved the request |
| `Director Approval Date` | Date | When director approved the request |
| `CurrentStep` | Number/Text | Current workflow step (1-5) |
| `Stage` | Choice/Text | Current stage (Submitted, Manager Review, Director Review, HR Review, Approved) |

These columns are automatically populated by your Power Automate approval workflow.

## Implementation Timeline

### Phase 1: Basic Print Feature ✅
- Created PrintableLeaveForm component
- Added print button to My Applications view
- Implemented print modal with preview
- Single A4 page optimization

### Phase 2: Smart Approval Auto-fill ✅
- Created department designation mapping system
- Added approval detection logic based on workflow stage
- Integrated manager/director names from SharePoint
- Added approval dates from SharePoint columns
- Implemented clean column-based layout with headers

## Future Enhancements
Potential improvements for future versions:
- PDF download option (save without printing)
- Batch print multiple applications
- Email PDF to stakeholders
- Digital signature integration via Canvas signatures
- Custom watermarks for different statuses
- Pull designations dynamically from Microsoft Graph organizational hierarchy
- Support for multiple approval levels per stage

## Browser Compatibility
Works with all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Notes
- ✅ The print feature works entirely in the frontend - no Power Automate required
- ✅ All data is real-time from the live application
- ✅ Manager and Director designations auto-fill based on department
- ✅ Approval names and dates auto-fill from SharePoint when approved
- ✅ Form optimized to fit on a single A4 page
- ✅ The form matches the official SCPNG leave application template
- ✅ Clean alignment with headers above data values

## Related Documentation
- [Leave Application Approval Mapping](./leave-application-approval-mapping.md) - Detailed approval workflow documentation
- [Leave Application Process Workflow](./leave-application-process-workflow.md) - Overall workflow process
- [Department Designations Configuration](../../src/utils/departmentDesignations.ts) - Add/edit department mappings
