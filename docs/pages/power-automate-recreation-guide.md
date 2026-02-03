# Power Automate Workflow Recreation Guide: Leave Credit Deduction

This guide details how to recreate the Power Automate flow that automatically deducts leave credits when a request is approved.

## 1. Flow Basics
*   **Name**: `Leave Request Deduction Logic` (or similar)
*   **Type**: Automated cloud flow

## 2. The Trigger
*   **Trigger**: **"When an item is created or modified"** (SharePoint)
*   **Site Address**: Select your Intranet site (`.../sites/scpngintranet`)
*   **List Name**: `Staff Leave Requests`

## 3. The Condition (Check for Approval)
*   **Action**: Add a **"Condition"** control.
*   **Logic**:
    *   Choose value: `ApprovalStatus` (Dynamic Content from Trigger)
    *   Operator: `is equal to`
    *   Choose value: `Approved`
*   *Note: We only want this to run when the status changes to "Approved".*

## 4. The "Yes" Branch (If Approved)
All following steps go inside the **"If yes"** box.

### Step 4.1: Find the Balance Record
*   **Action**: Add **"Get items"** (SharePoint).
*   **Site Address**: Your Intranet site.
*   **List Name**: `HR_LeaveBalances`
*   **Filter Query**:
    ```
    EmployeeID eq '@{triggerOutputs()?['body/EmployeeID']}' and LeaveType eq '@{triggerOutputs()?['body/Type_of_leave']}'
    ```
    *   *Tip: You can type `EmployeeID eq '` then select the `EmployeeID` dynamic content from the trigger, then type `' and LeaveType eq '` and select `Type_of_leave` dynamic content, then close with `'`.*

### Step 4.2: Update the Balance (The Deduction)
*   **Action**: Add **"Apply to each"** control.
*   **Select an output from previous steps**: Select `value` from the "Get items" step.
    *   *Reason: Even though we expect only one balance record, "Get items" always returns a list.*

*   **Inside the "Apply to each":**
    *   **Action**: Add **"Update item"** (SharePoint).
    *   **Site Address**: Your Intranet site.
    *   **List Name**: `HR_LeaveBalances`
    *   **Id**: Select `ID` from the "Get items" step.

    *   **Field: Used**:
        *   Click inside the "Used" field.
        *   Go to the **Expression** tab (fx).
        *   Enter this formula to handle the text-to-number conversion and addition:
        ```javascript
        add(float(items('Apply_to_each')?['Used']), float(triggerOutputs()?['body/TotalLeaveDays']))
        ```
        *   *Explanation*:
            1.  `items('Apply_to_each')?['Used']`: Gets the current "Used" amount (as text).
            2.  `float(...)`: Converts it to a number.
            3.  `triggerOutputs()?['body/TotalLeaveDays']`: Gets the days from the request.
            4.  `add(...)`: Adds them together.

    *   **Field: Available**:
        *   *Optional but recommended*: You can also update the "Available" field directly here if you want it statically calculated, OR let your frontend calculate it dynamically (which it currently does: `Entitlement - Used`). If you want to update it here:
        ```javascript
        sub(float(items('Apply_to_each')?['Entitlement']), add(float(items('Apply_to_each')?['Used']), float(triggerOutputs()?['body/TotalLeaveDays'])))
        ```

## 5. Save and Test
1.  Save the flow.
2.  Create a test leave request in the app.
3.  Manually set its status to `Approved` in the SharePoint list (or go through the approval process if that flow is active).
4.  Check the `HR_LeaveBalances` list to see if the `Used` amount increased.
