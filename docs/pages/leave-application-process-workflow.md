Leave Management System: Comprehensive Developer Reference
1. System Architecture and Data Sources
The Leave Management System operates as a front-end React application that interacts with Microsoft SharePoint Online Lists via the Microsoft Graph API.
A. Data Source Principle
All employee and leave data is sourced directly from SharePoint Lists, and NOT from Microsoft 365 (Azure AD) user profiles. The Microsoft Graph API is strictly used as the tool to query and write data to the designated SharePoint lists (e.g., HR_Employees).
The core service responsible for all read/write operations is located at src/services/hrSharePointService.ts.
B. Core SharePoint Lists
The application relies on four primary interconnected SharePoint lists, using the EmployeeID as the common key.
List Name
Purpose in System
Key Linkage Field
Status Note
HR_Employees
Employee Master Data (Read for profile display)
EmployeeID
Populated via the HR Data Import feature.
HR_LeaveBalances
Employee Leave Ledger (Read/Write for deduction)
EmployeeID and LeaveType
All staff balances reside in this single table.
Staff Leave Requests
Primary Leave Transaction Log
EmployeeID
This list replaced the legacy HR_LeaveRequests list.
HR_Documents
Document management
N/A
Note: List ID was reported as "List not found" during service initialization.

--------------------------------------------------------------------------------
2. SharePoint Schema and Data Type Management
A critical aspect of system stability is managing the data type mismatch between the application (which assumes Numbers/Booleans) and the SharePoint lists (which frequently use Single Line of Text).
A. Staff Leave Requests Schema Details (Submission Target)
All submission logic must adhere to the confirmed column names and types in the Staff Leave Requests list.
Frontend Field
SharePoint Column Name (Internal Name)
SharePoint Data Type
Application Usage/Fixes
Employee Identifier
EmployeeID
Single line of text
Renamed from Payroll_Number to resolve submission error. Retrieved from MS Graph Fax Number during user profile context loading.
Leave Duration
TotalLeaveDays
Number
Used instead of the deprecated DaysRequested field. Calculated automatically by LeaveApplicationPage.tsx.
Request Status
ApprovalStatus
Single line of text
Used instead of the deprecated Status field. Updated by Power Automate/Approvers.
Tracking State
Stage
Single line of text
Critical for the Visual Tracker. Initial value set to 'Manager Review' upon submission.
Tracking Step
CurrentStep
Single line of text
Used to manage tracking progression. Value is submitted as a String (e.g., "2") to match the list type.
Leave Type
Type_of_leave
Single line of text
Maps to the balance type in HR_LeaveBalances.
Dates
Start_Date, End_Date, Submission_Date
Single line of text
Used for calculating TotalLeaveDays.
Other Data
Name, Division, Unit, Reason, Signature, Request_ID
Single line of text
Request_ID is auto-generated upon submission.
B. HR_LeaveBalances Schema Details
All key balance columns in this list are configured as Single line of text (String) in SharePoint. This is critical for all integration points:
SharePoint Column Name
SharePoint Data Type
Developer Note
EmployeeID, LeaveType
Single line of text
Used for matching/lookup.
Entitlement, Used, Pending, Available
Single line of text
Requires string conversion in code (for import) and float conversion in Power Automate (for arithmetic).

--------------------------------------------------------------------------------
3. Application Features and Logic
A. Leave Application Submission Logic
The submission process (LeaveApplicationPage.tsx) ensures data integrity before creating a new list item in Staff Leave Requests:
1. Stage Default: Upon form submission, the system automatically sets the initial state: Stage: 'Manager Review' and CurrentStep: 2 (as a string).
2. Days Calculation: The form calculates the number of days requested using a date difference function (differenceInBusinessDays) and submits this value to the TotalLeaveDays column.
3. Field Renaming Alignment: The submission logic maps internal application fields (Status, DaysRequested) to the correct SharePoint column names (ApprovalStatus, TotalLeaveDays) to prevent submission errors.
4. Employee Lookup Fix: When fetching employee data by email (e.g., for pre-filling the form), the HR Service (hrSharePointService.ts) includes the special HTTP header Prefer: HonorNonIndexedQueriesWarningMayFailRandomly to overcome SharePoint limitations on filtering by the non-indexed Email column.
B. HR Data Import (HRDataImporter.tsx)
This feature imports staff data and populates initial leave balances.
1. Data Source: Fetches employee records from Microsoft Graph (Active Directory).
2. Employee Key: The Microsoft Graph Fax Number field is used as the EmployeeID when creating records in SharePoint.
3. Balance Initialization: The import process creates initial balance entries (Entitlement, Used, Available) for 10 specific leave types in the HR_LeaveBalances list, using predefined default values for demonstration (e.g., 20 days for Annual Leave).
4. Schema Alignment: The import code explicitly converts initial numeric balance values into Strings to match the Single line of text type used by all columns in the HR_LeaveBalances list, preventing a "General exception" (500 error).
C. Leave Application Tracking Logic (Visual Tracker)
The visual progression tracker (e.g., Submitted -> Manager -> HR -> Completed) is controlled by the content of the Stage column in the Staff Leave Requests list.
The frontend code (LeaveApplicationPage.tsx) monitors the Stage field. To advance the visual tracker, the Stage column must be updated with these exact, case-sensitive strings:
Workflow Step
Required Stage Value (String)
Required ApprovalStatus Value
Initial Submission
Manager Review (Set by default)
N/A (or "Pending")
Manager Approval
Director Review
N/A
Director Approval
HR Review
N/A
Final Processing
Approved
Approved
Rejection
(Stays at current stage)
Rejected or Declined

--------------------------------------------------------------------------------
4. Power Automate Automation (Balance Deduction Flow)
A Power Automate (Flow) automation is required to handle the secure, server-side deduction of leave days from the employee's balance once a request is fully approved.
A. Flow Trigger and Conditions
1. Trigger: When an item is created or modified in the Staff Leave Requests list.
2. Condition: The flow should proceed only If Approval Status is equal to Approved.
B. Balance Lookup (Finding the correct Ledger Row)
After approval, the flow must locate the specific balance ledger item in the HR_LeaveBalances list.
• Action: Get items targeting the HR_LeaveBalances list.
• Filter Logic: The filter must use OData syntax to match both the employee and the leave type.
    ◦ Find the item where: EmployeeID equals the request's EmployeeID AND LeaveType equals the request's Type_of_leave.
C. Critical: Leave Deduction and Data Type Conversion
Since the Used column in HR_LeaveBalances is a Single line of text, standard arithmetic functions in Power Automate will fail with an InvalidTemplate error if they are not converted to floating-point numbers first.
1. Action: Update item (inside the Apply to each loop) targeting the HR_LeaveBalances list.
2. ID Context: The Id field of this action must use the ID Dynamic Content item sourced from the Get items or Apply to each step (i.e., the ID of the balance row).
3. Used Field Update (Required Expression): The total used days must be calculated by converting the existing Used value (from the balance item) and the TotalLeaveDays (from the request trigger) to floating-point numbers before adding them:
4. This expression must be pasted into the Expression tab of the Dynamic Content editor for the Used field.

--------------------------------------------------------------------------------
5. Summary of Key Developer Fixes
Issue
Original Configuration/Error
Final Resolution/Implementation
Data Source Identity
Payroll_Number was used as the ID.
Renamed column to EmployeeID in SharePoint; code retrieves value from MS Graph Fax Number field.
SharePoint Column Errors
Submission failed because DaysRequested and Status fields were not recognized.
Code was updated to use SharePoint column names: TotalLeaveDays and ApprovalStatus.
Non-Indexed Query Failures
SharePoint failed when filtering HR_Employees by Email because it was not indexed.
Added HTTP header Prefer: HonorNonIndexedQueriesWarningMayFailRandomly to hrSharePointService.ts queries.
Balance Import Failure
Import failed (500 Error) because numbers were sent to Text columns in HR_LeaveBalances.
Import code was fixed to convert all numeric balance values (Entitlement, Used, etc.) to Strings before writing to SharePoint.
Flow Deduction Failure
Power Automate failed the add() function because HR_LeaveBalances columns are Text.
Implemented explicit conversion using float() function within the Power Automate expression.
Tracking Progression
Unclear what fields control the visual progress bar.
Progression is controlled solely by updating the Stage column with specific string values (Manager Review, Director Review, HR Review, Approved).

--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
Analogy: The Leave Management System is like an inventory warehouse built entirely out of customized cardboard boxes (SharePoint Text Columns). You need a specific service (the application code) to manage loading the initial inventory (the Data Importer) by carefully turning all your numeric data into written labels (Strings). When a truck takes items out (Power Automate Deduction), it needs strict instructions to read the label, convert it back to a number to do the math, and then write the new total back as a label, otherwise the whole system throws a clipboard (500 Error).