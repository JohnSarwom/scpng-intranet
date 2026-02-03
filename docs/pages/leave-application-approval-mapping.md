# Leave Application Approval Mapping

## Overview
The printable leave application form now automatically fills in Manager and Director designations and approval dates based on the workflow approval status and the employee's department.

## Features

### 1. Department-Based Designation Mapping
The system automatically determines the correct Manager and Director titles based on the employee's department/division:

#### Current Mappings:

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

**Default (Other Departments):**
- Manager: "Manager"
- Director: "Director"

### 2. Automatic Form Population

When a leave application is printed, the form will automatically show:

#### Section B (Manager Approval):
- **Signature:** Manager's name (when approved)
- **Designation:** Automatically filled based on department
- **Date:** Date when manager approved

#### Section C (Director Approval):
- **Signature:** Director's name (when approved)
- **Designation:** Automatically filled based on department
- **Date:** Date when director approved

### 3. Approval Workflow Integration

The form intelligently shows approval information based on the workflow stage:

| Workflow Stage | Manager Section | Director Section |
|---------------|-----------------|------------------|
| Submitted | Empty | Empty |
| Manager Review | Empty | Empty |
| Director Review | ✅ Filled | Empty |
| HR Review | ✅ Filled | ✅ Filled |
| Approved | ✅ Filled | ✅ Filled |

**Logic:**
- Manager info appears when `currentStep >= 3` (Director Review stage or beyond)
- Director info appears when `currentStep >= 4` (HR Review stage or beyond)

## Technical Implementation

### Files Modified:

1. **[src/types/hr.ts](../../src/types/hr.ts)**
   - Added `managerApprovedDate`, `directorApprovedDate`, `hrApprovedDate` fields to `LeaveRequest` interface

2. **[src/services/hrSharePointService.ts](../../src/services/hrSharePointService.ts)**
   - Updated to map approval date fields from SharePoint

3. **[src/utils/departmentDesignations.ts](../../src/utils/departmentDesignations.ts)** (New)
   - Department-to-designation mapping configuration
   - Helper functions: `getManagerDesignation()`, `getDirectorDesignation()`

4. **[src/components/forms/PrintableLeaveForm.tsx](../../src/components/forms/PrintableLeaveForm.tsx)**
   - Integrated designation mapping
   - Conditional rendering based on approval status
   - Auto-fills approver names and dates

### SharePoint List Fields Required:

For this feature to work, your SharePoint "Staff Leave Requests" list should have:
- `Approver_Manager` (Text) - Name of approving manager
- `Approver_Director` (Text) - Name of approving director
- `Manager_Approved_Date` (Date) - When manager approved
- `Director_Approved_Date` (Date) - When director approved
- `CurrentStep` (Number/Text) - Current workflow step

## How It Works

### Example: IT Department Employee

**Before Approval:**
```
B) FOR MANAGER
SIGNATURE FOR MANAGER: ____________
DESIGNATION: ____________
DATE: ____________
```

**After Manager Approval (CurrentStep = 3):**
```
B) FOR MANAGER
SIGNATURE FOR MANAGER: John Smith
DESIGNATION: Manager IT
DATE: 25/11/2025
```

**After Director Approval (CurrentStep = 4):**
```
C) FOR DIVISIONAL DIRECTOR
SIGNATURE FOR DIRECTOR: Jane Doe
DESIGNATION: Director Corporate Service
DATE: 26/11/2025
```

## Adding New Departments

To add designation mappings for new departments, edit [src/utils/departmentDesignations.ts](../../src/utils/departmentDesignations.ts):

```typescript
export const DEPARTMENT_DESIGNATIONS: Record<string, DepartmentDesignations> = {
  // Add your new department
  'Your Department Name': {
    manager: 'Manager [Department]',
    director: 'Director [Division]',
  },
  // ... existing mappings
};
```

The system supports:
- Exact matches (case-sensitive)
- Case-insensitive fallback matching
- Default fallback for unmapped departments

## Benefits

✅ **Automated:** No manual entry of designations needed
✅ **Consistent:** Same designation format across all applications
✅ **Accurate:** Only shows approvals when actually approved
✅ **Department-Aware:** Correct titles based on organizational structure
✅ **Audit Trail:** Captures exact approval dates for compliance

## Future Enhancements

Potential improvements:
- Pull designations from Microsoft Graph organizational hierarchy
- Support for multiple approval levels per stage
- Custom designation overrides per employee
- Integration with digital signature capture
